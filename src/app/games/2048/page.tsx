"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import Tile from "@/components/Tile";

const SIZE = 4;

type Grid = number[][];

const createEmptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const getEmptyCells = (grid: Grid) => {
  const empty: { x: number; y: number }[] = [];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 0) empty.push({ x, y });
    });
  });
  return empty;
};

const spawnTile = (grid: Grid): Grid => {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newGrid = grid.map((row) => [...row]);
  newGrid[y][x] = value;
  return newGrid;
};

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const slideAndMerge = (row: number[]): { newRow: number[]; score: number } => {
  const filtered = row.filter((v) => v !== 0);
  let score = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  const merged = filtered.filter((v) => v !== 0);
  while (merged.length < SIZE) merged.push(0);
  return { newRow: merged, score };
};

const rotate = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      newGrid[x][SIZE - y - 1] = grid[y][x];
    }
  }
  return newGrid;
};

const moveGrid = (
  grid: Grid,
  direction: "left" | "right" | "up" | "down",
): { newGrid: Grid; score: number; moved: boolean } => {
  let rotated = cloneGrid(grid);
  let rotateCount = 0;

  if (direction === "up") rotateCount = 3;
  else if (direction === "right") rotateCount = 2;
  else if (direction === "down") rotateCount = 1;

  for (let i = 0; i < rotateCount; i++) rotated = rotate(rotated);

  let moved = false;
  let totalScore = 0;

  let movedGrid = rotated.map((row) => {
    const { newRow, score } = slideAndMerge(row);
    if (JSON.stringify(row) !== JSON.stringify(newRow)) moved = true;
    totalScore += score;
    return newRow;
  });

  for (let i = 0; i < (4 - rotateCount) % 4; i++) movedGrid = rotate(movedGrid);

  return { newGrid: movedGrid, score: totalScore, moved };
};

const checkGameOver = (grid: Grid): boolean => {
  if (getEmptyCells(grid).length > 0) return false;

  const directions: ("left" | "right" | "up" | "down")[] = [
    "left",
    "right",
    "up",
    "down",
  ];

  return directions.every((dir) => {
    const { moved } = moveGrid(grid, dir);
    return !moved;
  });
};

type TileState = {
  id: number;
  x: number;
  y: number;
  value: number;
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(() =>
    spawnTile(spawnTile(createEmptyGrid())),
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [tiles, setTiles] = useState<TileState[]>([]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const direction =
        key === "arrowup" || key === "w"
          ? "up"
          : key === "arrowdown" || key === "s"
          ? "down"
          : key === "arrowleft" || key === "a"
          ? "left"
          : key === "arrowright" || key === "d"
          ? "right"
          : null;

      if (!direction || gameOver) return;

      const { newGrid, score: gained, moved } = moveGrid(grid, direction);

      if (moved) {
        const spawned = spawnTile(newGrid);
        setGrid(spawned);
        setScore((prev) => prev + gained);
        if (checkGameOver(spawned)) setGameOver(true);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  const restart = () => {
    const fresh = spawnTile(spawnTile(createEmptyGrid()));
    setGrid(fresh);
    setScore(0);
    setGameOver(false);
  };

  const bind = useGesture(
    {
      onDragEnd: ({ direction: [xDir, yDir] }) => {
        if (gameOver) return;

        const absX = Math.abs(xDir);
        const absY = Math.abs(yDir);
        let dir: "left" | "right" | "up" | "down" | null = null;

        if (absX > absY) {
          dir = xDir > 0 ? "right" : "left";
        } else if (absY > absX) {
          dir = yDir > 0 ? "down" : "up";
        }

        if (dir) {
          const { newGrid, score: gained, moved } = moveGrid(grid, dir);
          if (moved) {
            const spawned = spawnTile(newGrid);
            setGrid(spawned);
            setScore((prev) => prev + gained);
            if (checkGameOver(spawned)) setGameOver(true);
          }
        }
      },
    },
    {
      drag: {
        threshold: 20, // pixels required to recognize swipe
      },
    },
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">2048</h1>
      <p className="text-xl mb-2">Score: {score}</p>

      <div
        {...bind()}
        className="grid gap-2 p-3 rounded-md shadow-lg"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 5rem)` }}
      >
        {/* <AnimatePresence mode="popLayout">
          {grid.flat().map((value, idx) => (
            <motion.div
              key={idx + "-" + value} // ensures merge triggers animation
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "w-20 h-20 rounded flex items-center justify-center text-xl font-bold",
                value === 0
                  ? "bg-orange-100 text-transparent"
                  : value === 2
                  ? "bg-orange-200"
                  : value === 4
                  ? "bg-orange-300"
                  : value === 8
                  ? "bg-orange-400 text-white"
                  : value === 16
                  ? "bg-orange-500 text-white"
                  : value === 32
                  ? "bg-orange-600 text-white"
                  : value === 64
                  ? "bg-orange-700 text-white"
                  : value === 128
                  ? "bg-orange-800 text-white"
                  : "bg-black text-white",
              )}
            >
              {value || ""}
            </motion.div>
          ))}
        </AnimatePresence> */}

        <AnimatePresence>
          {tiles.map(({ x, y, value, id }) => (
            <Tile key={id} x={x} y={y} value={value} id={id} />
          ))}
        </AnimatePresence>
      </div>

      {gameOver && (
        <p className="mt-4 text-xl text-red-600 font-semibold">Game Over</p>
      )}

      <button
        onClick={restart}
        className="mt-6 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
      >
        Restart
      </button>
    </div>
  );
}
