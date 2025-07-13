"use client";

import { useState } from "react";
import clsx from "clsx";

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function ConnectFour() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [player, setPlayer] = useState<"🔴" | "🟡">("🔴");
  const [winner, setWinner] = useState<string | null>(null);

  const dropDisc = (col: number) => {
    if (winner) return;
    const newBoard = board.map((row) => [...row]);

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = player;
        setBoard(newBoard);
        if (checkWin(newBoard, row, col, player)) {
          setWinner(player);
        } else {
          setPlayer((prev) => (prev === "🔴" ? "🟡" : "🔴"));
        }
        break;
      }
    }
  };

  const checkWin = (b: string[][], row: number, col: number, p: string) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal ↘️
      [1, -1], // diagonal ↙️
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      for (let dir = -1; dir <= 1; dir += 2) {
        let r = row + dir * dx;
        let c = col + dir * dy;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r][c] === p) {
          count++;
          r += dir * dx;
          c += dir * dy;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const restart = () => {
    setBoard(createEmptyBoard());
    setPlayer("🔴");
    setWinner(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-6">
      <h1 className="text-3xl font-bold mb-4">Connect Four</h1>
      {winner ? (
        <p className="text-xl font-semibold text-green-700 mb-2">
          Winner: {winner}
        </p>
      ) : (
        <p className="text-xl mb-2">Current Player: {player}</p>
      )}
      <div
        className="grid gap-1 bg-blue-600 p-2 rounded"
        style={{ gridTemplateColumns: `repeat(${COLS}, 4rem)` }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => dropDisc(colIndex)}
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer transition relative group",
                cell === "🔴"
                  ? "bg-red-500"
                  : cell === "🟡"
                  ? "bg-yellow-400"
                  : "bg-white hover:scale-105",
              )}
            >
              {cell}
              {!cell && (
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full",
                    player === "🔴" ? "bg-red-500" : "bg-yellow-400",
                    "opacity-0 group-hover:opacity-30 pointer-events-none transition",
                  )}
                />
              )}
            </div>
          )),
        )}
      </div>
      <button
        onClick={restart}
        className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
      >
        Restart
      </button>
    </div>
  );
}
