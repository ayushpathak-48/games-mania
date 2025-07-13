/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

const emptyBoard = Array(9).fill(null);

type Mode = "pvp" | "pvai";
type Difficulty = "easy" | "hard";

export default function TicTacToeGame() {
  const [mode, setMode] = useState<Mode>("pvai");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [board, setBoard] = useState(emptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const [score, setScore] = useState({
    X: 0,
    O: 0,
  });

  // AI move effect
  useEffect(() => {
    if (mode === "pvai" && !isPlayerTurn && !winner) {
      const timeout = setTimeout(() => {
        const move =
          difficulty === "easy" ? getRandomMove(board) : getBestMove(board);
        if (move !== null) {
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);

          const win = calculateWinner(newBoard);
          if (win) {
            setWinner(win);
            setScore((prev: any) => ({ ...prev, [win]: prev[win] + 1 }));
          } else if (!newBoard.includes(null)) {
            setWinner("Draw");
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, board, winner, difficulty, mode]);

  const handleClick = (index: number) => {
    if (board[index] || winner || (mode === "pvai" && !isPlayerTurn)) return;

    const currentSymbol = isPlayerTurn ? "X" : "O";
    const newBoard = [...board];
    newBoard[index] = currentSymbol;
    setBoard(newBoard);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      setScore((prev: any) => ({ ...prev, [win]: prev[win] + 1 }));
    } else if (!newBoard.includes(null)) {
      setWinner("Draw");
    } else {
      setIsPlayerTurn(mode === "pvp" ? !isPlayerTurn : false);
    }
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setWinner(null);
    setIsPlayerTurn(true);
  };

  const getRandomMove = (board: (string | null)[]): number | null => {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((v) => v !== null) as number[];
    return emptyIndices.length
      ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      : null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>

      {/* Mode Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label className="font-semibold">Mode:</label>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as Mode);
            resetGame(); // reset when changing mode
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="pvai">Player vs AI</option>
          <option value="pvp">Player vs Player</option>
        </select>

        {mode === "pvai" && (
          <>
            <label className="font-semibold ml-4">Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="px-4 py-2 border rounded"
            >
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </select>
          </>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 w-60">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 text-3xl font-bold border-2 border-gray-300 transition"
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="mt-6 text-lg">
        {winner
          ? winner === "Draw"
            ? "It's a draw!"
            : `Winner: ${winner}`
          : `Turn: ${isPlayerTurn ? "X" : "O"}`}
      </div>

      {/* Scores */}
      <div className="mt-4 flex gap-6 text-lg font-medium">
        <p>❌ X: {score.X}</p>
        <p>⭕ O: {score.O}</p>
      </div>

      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Restart Game
      </button>
    </div>
  );
}

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getBestMove(board: (string | null)[]): number | null {
  let bestScore = -Infinity;
  let move: number | null = null;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
): number {
  const result = calculateWinner(board);
  if (result === "X") return -10 + depth;
  if (result === "O") return 10 - depth;
  if (!board.includes(null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}
