"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Point = { x: 1, y: 0 };
const SPEED = 120;

function generateFood(snake: Point[]): Point {
  let newFood: Point;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  return newFood;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>(generateFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef<NodeJS.Timer>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const { x, y } = direction;

    const newDirection =
      key === "arrowup" || key === "w"
        ? { x: 0, y: -1 }
        : key === "arrowdown" || key === "s"
        ? { x: 0, y: 1 }
        : key === "arrowleft" || key === "a"
        ? { x: -1, y: 0 }
        : key === "arrowright" || key === "d"
        ? { x: 1, y: 0 }
        : null;

    if (
      newDirection &&
      !(newDirection.x === -x && newDirection.y === -y) // prevent reverse
    ) {
      setDirection(newDirection);
    }
  };

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      // Collision check: wall or self
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        prevSnake.some((s) => s.x === newHead.x && s.y === newHead.y)
      ) {
        setGameOver(true);
        // clearInterval(intervalRef.current);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        const newFood = generateFood(newSnake);
        setFood(newFood);
        setScore((prev) => prev + 1);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const restartGame = () => {
    const freshSnake = INITIAL_SNAKE;
    const freshFood = generateFood(freshSnake);
    setSnake(freshSnake);
    setDirection(INITIAL_DIRECTION);
    setFood(freshFood);
    setScore(0);
    setGameOver(false);
    // clearInterval(intervalRef.current);
    intervalRef.current = setInterval(moveSnake, SPEED);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    intervalRef.current = setInterval(moveSnake, SPEED);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // clearInterval(intervalRef.current);
    };
  }, [direction]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">🐍 Snake Game</h1>

      <div
        className="grid border-4 border-lime-400"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          width: "400px",
          height: "400px",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);

          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = snake.some(
            (s, idx) => idx !== 0 && s.x === x && s.y === y,
          );
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`w-full h-full ${
                isHead
                  ? "bg-lime-200"
                  : isBody
                  ? "bg-lime-500"
                  : isFood
                  ? "bg-red-500"
                  : "bg-gray-900"
              }`}
            />
          );
        })}
      </div>

      <p className="mt-4 text-lg">Score: {score}</p>

      {gameOver && (
        <div className="mt-4 text-red-400 text-lg">
          💀 Game Over!
          <button onClick={restartGame} className="ml-2 underline text-white">
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
