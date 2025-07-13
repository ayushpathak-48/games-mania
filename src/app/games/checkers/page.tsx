"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

type Piece = {
  type: "pawn" | "king";
  color: "red" | "black";
};

type Cell = {
  piece: Piece | null;
  isHighlighted: boolean;
};

type Board = Cell[][];

type Position = {
  row: number;
  col: number;
};

type Move = {
  from: Position;
  to: Position;
  captures?: Position[];
};

const CheckersGame = () => {
  const createEmptyBoard = (): Board => {
    return Array(8)
      .fill(null)
      .map(() =>
        Array(8)
          .fill(null)
          .map(() => ({
            piece: null,
            isHighlighted: false,
          })),
      );
  };

  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"red" | "black">("red");
  const [gameStatus, setGameStatus] = useState<
    "playing" | "red-won" | "black-won" | "draw"
  >("playing");
  const [aiThinking, setAiThinking] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // Initialize the board with pieces
  const initializeBoard = useCallback(() => {
    const newBoard = createEmptyBoard();

    // Set up red pieces (top three rows)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col].piece = { type: "pawn", color: "red" };
        }
      }
    }

    // Set up black pieces (bottom three rows)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col].piece = { type: "pawn", color: "black" };
        }
      }
    }

    setBoard(newBoard);
    setSelectedPiece(null);
    setCurrentPlayer("red");
    setGameStatus("playing");
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Helper function to safely get a piece
  const getPieceAt = (row: number, col: number): Piece | null => {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return board[row]?.[col]?.piece ?? null;
  };

  // Get all valid moves for current player
  const getAllValidMoves = (player: "red" | "black"): Move[] => {
    const moves: Move[] = [];
    let hasCaptures = false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = getPieceAt(row, col);
        if (piece && piece.color === player) {
          const pieceMoves = getValidMovesForPiece(row, col);
          const captureMoves = pieceMoves.filter((move) => move.captures);

          if (captureMoves.length > 0) {
            hasCaptures = true;
            moves.push(...captureMoves);
          } else if (!hasCaptures) {
            moves.push(...pieceMoves);
          }
        }
      }
    }

    return hasCaptures ? moves.filter((move) => move.captures) : moves;
  };

  // Get valid moves for a specific piece
  const getValidMovesForPiece = (row: number, col: number): Move[] => {
    const piece = getPieceAt(row, col);
    if (!piece || piece.color !== currentPlayer) return [];

    const moves: Move[] = [];
    const directions =
      piece.type === "pawn" ? (piece.color === "red" ? [1] : [-1]) : [1, -1]; // Kings can move both directions

    // Check for capture moves first (mandatory in checkers)
    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const jumpRow = row + rowDir;
        const jumpCol = col + colDir;
        const landRow = row + 2 * rowDir;
        const landCol = col + 2 * colDir;

        if (landRow >= 0 && landRow < 8 && landCol >= 0 && landCol < 8) {
          const jumpPiece = getPieceAt(jumpRow, jumpCol);
          const landPiece = getPieceAt(landRow, landCol);

          if (jumpPiece && jumpPiece.color !== piece.color && !landPiece) {
            moves.push({
              from: { row, col },
              to: { row: landRow, col: landCol },
              captures: [{ row: jumpRow, col: jumpCol }],
            });
          }
        }
      }
    }

    // If we have captures, only return those (captures are mandatory)
    if (moves.length > 0) return moves;

    // Regular moves
    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!getPieceAt(newRow, newCol)) {
            moves.push({
              from: { row, col },
              to: { row: newRow, col: newCol },
            });
          }
        }
      }
    }

    return moves;
  };

  // Highlight valid moves for a selected piece
  const highlightValidMoves = (position: Position) => {
    const moves = getValidMovesForPiece(position.row, position.col);
    const newBoard = board.map((row) =>
      row.map((cell) => ({ ...cell, isHighlighted: false })),
    );

    for (const move of moves) {
      newBoard[move.to.row][move.to.col].isHighlighted = true;
    }

    setBoard(newBoard);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== "playing" || aiThinking) return;

    const cell = board[row][col];

    // If we clicked on a highlighted cell (move destination)
    if (cell.isHighlighted && selectedPiece) {
      const moves = getValidMovesForPiece(selectedPiece.row, selectedPiece.col);
      const move = moves.find((m) => m.to.row === row && m.to.col === col);

      if (move) {
        executeMove(move);
      }
      return;
    }

    // If we clicked on our own piece
    if (cell.piece && cell.piece.color === currentPlayer) {
      setSelectedPiece({ row, col });
      highlightValidMoves({ row, col });
    }
  };

  const executeMove = (move: Move) => {
    const newBoard = board.map((row) =>
      row.map((cell) => ({ ...cell, isHighlighted: false })),
    );
    const { from, to } = move;
    const movingPiece = newBoard[from.row][from.col].piece;

    if (!movingPiece) return;

    // Move the piece
    newBoard[to.row][to.col].piece = { ...movingPiece };
    newBoard[from.row][from.col].piece = null;

    // Promote to king if reached the end - with proper null check
    if (movingPiece.type === "pawn") {
      if (
        (movingPiece.color === "red" && to.row === 7) ||
        (movingPiece.color === "black" && to.row === 0)
      ) {
        // Safely update the piece type
        const promotedPiece = newBoard[to.row][to.col].piece;
        if (promotedPiece) {
          newBoard[to.row][to.col].piece = {
            ...promotedPiece,
            type: "king",
          };
        }
      }
    }
  };

  // Simple AI move selection
  const getAiMove = (): Move | null => {
    const moves = getAllValidMoves("black");
    if (moves.length === 0) return null;

    // Prefer captures
    const captures = moves.filter((move) => move.captures);
    if (captures.length > 0) {
      // Prefer captures that lead to promotion
      const promotingCaptures = captures.filter(
        (move) =>
          getPieceAt(move.from.row, move.from.col)?.type === "pawn" &&
          move.to.row === 0,
      );
      if (promotingCaptures.length > 0) {
        return promotingCaptures[
          Math.floor(Math.random() * promotingCaptures.length)
        ];
      }
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Prefer moves that get closer to promotion
    const pawnMoves = moves.filter(
      (move) => getPieceAt(move.from.row, move.from.col)?.type === "pawn",
    );
    if (pawnMoves.length > 0) {
      // Sort by distance to promotion row
      const sorted = [...pawnMoves].sort((a, b) => a.from.row - b.from.row);
      return sorted[0];
    }

    // Random move otherwise
    return moves[Math.floor(Math.random() * moves.length)];
  };

  // AI turn
  useEffect(() => {
    if (currentPlayer === "black" && gameStatus === "playing") {
      const timer = setTimeout(() => {
        setAiThinking(true);
        setTimeout(() => {
          const aiMove = getAiMove();
          if (aiMove) {
            executeMove(aiMove);
          }
          setAiThinking(false);
        }, 500);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameStatus]);

  // Get suggested move for current player
  const getSuggestedMove = (): Move | null => {
    const moves = getAllValidMoves(currentPlayer);
    if (moves.length === 0) return null;

    // Prefer captures
    const captures = moves.filter((move) => move.captures);
    if (captures.length > 0) {
      // Prefer captures that lead to promotion
      const promotingCaptures = captures.filter(
        (move) =>
          getPieceAt(move.from.row, move.from.col)?.type === "pawn" &&
          ((currentPlayer === "red" && move.to.row === 7) ||
            (currentPlayer === "black" && move.to.row === 0)),
      );
      if (promotingCaptures.length > 0) {
        return promotingCaptures[0];
      }
      return captures[0];
    }

    // Prefer moves that get closer to promotion
    const pawnMoves = moves.filter(
      (move) => getPieceAt(move.from.row, move.from.col)?.type === "pawn",
    );
    if (pawnMoves.length > 0) {
      // Sort by distance to promotion row
      const sorted = [...pawnMoves].sort((a, b) =>
        currentPlayer === "red"
          ? b.from.row - a.from.row
          : a.from.row - b.from.row,
      );
      return sorted[0];
    }

    return moves[0];
  };

  const suggestedMove = showHints ? getSuggestedMove() : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-4 flex justify-between w-full max-w-md">
        <div className="text-2xl font-bold">Checkers</div>
        <div className="text-xl">
          Turn:{" "}
          <span
            className={currentPlayer === "red" ? "text-red-600" : "text-black"}
          >
            {currentPlayer}
          </span>
        </div>
      </div>

      {gameStatus !== "playing" && (
        <div className="mb-4 text-xl font-bold">
          {gameStatus === "red-won"
            ? "Red Player Wins!"
            : gameStatus === "black-won"
            ? "Black Player Wins!"
            : "Draw!"}
        </div>
      )}

      <div className="relative">
        {aiThinking && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
            <div className="text-white text-xl">AI Thinking...</div>
          </div>
        )}

        <div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative
                  ${
                    (rowIndex + colIndex) % 2 === 0
                      ? "bg-gray-100"
                      : "bg-gray-800"
                  }
                  ${
                    selectedPiece?.row === rowIndex &&
                    selectedPiece?.col === colIndex
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                  ${cell.isHighlighted ? "bg-green-400" : ""}
                  cursor-pointer`}
              >
                {cell.piece && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                      ${cell.piece.color === "red" ? "bg-red-600" : "bg-black"}
                      ${
                        cell.piece.type === "king"
                          ? "border-2 border-yellow-400"
                          : ""
                      }
                      shadow-md`}
                  >
                    {cell.piece.type === "king" && (
                      <span className="text-xs text-yellow-400 font-bold">
                        K
                      </span>
                    )}
                  </motion.div>
                )}

                {suggestedMove?.from.row === rowIndex &&
                  suggestedMove?.from.col === colIndex && (
                    <div className="absolute inset-0 border-2 border-yellow-400 animate-pulse"></div>
                  )}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={initializeBoard}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            New Game
          </button>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-4 py-2 rounded-md ${
              showHints ? "bg-green-500 text-white" : "bg-gray-300"
            }`}
          >
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>
        </div>

        {suggestedMove && showHints && (
          <div className="text-sm text-gray-700">
            Suggested move: {String.fromCharCode(97 + suggestedMove.from.col)}
            {8 - suggestedMove.from.row}→{" "}
            {String.fromCharCode(97 + suggestedMove.to.col)}
            {8 - suggestedMove.to.row}
          </div>
        )}

        <div className="text-sm text-gray-600">
          {currentPlayer === "red"
            ? "Your turn (Red)"
            : "AI thinking (Black)..."}
        </div>
      </div>
    </div>
  );
};

export default CheckersGame;
