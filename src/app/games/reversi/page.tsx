"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

const SIZE = 8;
const EMPTY: null = null;
const BLACK = "⚫";
const WHITE = "⚪";

type Player = typeof BLACK | typeof WHITE;
type Cell = Player | null;
type Board = Cell[][];

function initializeBoard(): Board {
  const board: Board = Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

function getOpponent(player: Player): Player {
  return player === BLACK ? WHITE : BLACK;
}

function isValidMove(
  board: Board,
  row: number,
  col: number,
  player: Player,
): boolean {
  if (board[row][col] !== EMPTY) return false;
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const opponent = getOpponent(player);

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    let hasOpponent = false;
    while (
      r >= 0 &&
      r < SIZE &&
      c >= 0 &&
      c < SIZE &&
      board[r][c] === opponent
    ) {
      r += dx;
      c += dy;
      hasOpponent = true;
    }
    if (
      hasOpponent &&
      r >= 0 &&
      r < SIZE &&
      c >= 0 &&
      c < SIZE &&
      board[r][c] === player
    ) {
      return true;
    }
  }
  return false;
}

function applyMove(
  board: Board,
  row: number,
  col: number,
  player: Player,
): Board {
  const newBoard = board.map((r) => [...r]);
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const opponent = getOpponent(player);
  newBoard[row][col] = player;

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    const piecesToFlip: [number, number][] = [];

    while (
      r >= 0 &&
      r < SIZE &&
      c >= 0 &&
      c < SIZE &&
      newBoard[r][c] === opponent
    ) {
      piecesToFlip.push([r, c]);
      r += dx;
      c += dy;
    }
    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE && newBoard[r][c] === player) {
      for (const [fr, fc] of piecesToFlip) {
        newBoard[fr][fc] = player;
      }
    }
  }

  return newBoard;
}

function getValidMoves(board: Board, player: Player): [number, number][] {
  const validMoves: [number, number][] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (isValidMove(board, row, col, player)) {
        validMoves.push([row, col]);
      }
    }
  }
  return validMoves;
}

function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === BLACK) black++;
      if (cell === WHITE) white++;
    }
  }
  return { black, white };
}

export default function ReversiGame() {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [turn, setTurn] = useState<Player>(BLACK);
  const [gameOver, setGameOver] = useState(false);

  const validMoves = getValidMoves(board, turn);
  const { black, white } = countPieces(board);

  useEffect(() => {
    if (validMoves.length === 0) {
      const otherMoves = getValidMoves(board, getOpponent(turn));
      if (otherMoves.length === 0) {
        setGameOver(true);
      } else {
        setTurn(getOpponent(turn));
      }
    }
  }, [board, turn]);

  const handleClick = (row: number, col: number) => {
    if (isValidMove(board, row, col, turn)) {
      const newBoard = applyMove(board, row, col, turn);
      setBoard(newBoard);
      setTurn(getOpponent(turn));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-gray-900 p-4">
      <style>{`
        .flip {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flipped {
          transform: rotateY(180deg);
        }
        .disc-inner {
          transition: background-color 0.3s;
          transform: rotateY(0deg);
        }
      `}</style>
      <h1 className="text-3xl font-bold text-center mb-2 text-white">
        Reversi (Othello)
      </h1>
      <div className="flex gap-4 mb-4 text-white">
        <p>⚫ Black: {black}</p>
        <p>⚪ White: {white}</p>
      </div>
      <div className="grid grid-cols-8 border-4 border-gray-700">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSuggested = validMoves.some(
              ([vr, vc]) => vr === r && vc === c,
            );
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={clsx(
                  "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border border-gray-600 flex items-center justify-center cursor-pointer transition relative",
                  "bg-gray-800 hover:bg-gray-700",
                )}
              >
                {cell && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className={clsx(
                        "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flip flex items-center justify-center shadow-md",
                        cell === BLACK ? "bg-black flipped" : "bg-white",
                      )}
                    ></div>
                  </div>
                )}
                {!cell && isSuggested && (
                  <div
                    className="absolute w-10 h-10 rounded-full border-4 opacity-30"
                    style={{ borderColor: turn == BLACK ? "black" : "white" }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
      {!gameOver ? (
        <p className="text-center mt-4 text-lg text-white">
          Turn: {turn === BLACK ? "Black ⚫" : "White ⚪"}
        </p>
      ) : (
        <p className="text-center mt-4 text-2xl text-white font-bold">
          Game Over!{" "}
          {black > white
            ? "⚫ Black Wins!"
            : white > black
            ? "⚪ White Wins!"
            : "It's a Draw!"}
        </p>
      )}
    </div>
  );
}
