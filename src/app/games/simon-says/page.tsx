"use client";

import { useState, useEffect } from "react";

const colors = ["red", "green", "blue", "yellow"] as const;
type Color = (typeof colors)[number];

export default function SimonSaysGame() {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [active, setActive] = useState<Color | null>(null);
  const [message, setMessage] = useState("Click Start to Play");
  const [score, setScore] = useState(0);

  const playSequence = async () => {
    setIsShowing(true);
    for (const color of sequence) {
      setActive(color);
      await new Promise((res) => setTimeout(res, 500));
      setActive(null);
      await new Promise((res) => setTimeout(res, 200));
    }
    setIsShowing(false);
  };

  const startGame = () => {
    const first = colors[Math.floor(Math.random() * 4)];
    setSequence([first]);
    setUserIndex(0);
    setScore(0);
    setMessage("Watch the sequence");
  };

  const nextRound = () => {
    const next = colors[Math.floor(Math.random() * 4)];
    const newSeq = [...sequence, next];
    setSequence(newSeq);
    setUserIndex(0);
    setScore((prev) => prev + 1);
    setTimeout(() => playSequence(), 500);
    setMessage("Watch the sequence");
  };

  const handleClick = async (color: Color) => {
    if (isShowing || !sequence.length) return;

    if (color === sequence[userIndex]) {
      setActive(color);
      await new Promise((res) => setTimeout(res, 100));
      setActive(null);

      if (userIndex + 1 === sequence.length) {
        setMessage("Good! Next round...");
        setTimeout(nextRound, 1000);
      }
      setUserIndex(userIndex + 1);
    } else {
      setMessage(`❌ Wrong! Game Over. Final Score: ${score}`);
      setSequence([]);
      setUserIndex(0);
    }
  };

  useEffect(() => {
    if (sequence.length > 0) playSequence();
  }, [sequence.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Simon Says</h1>
      <div className="grid grid-cols-2 gap-4">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleClick(color)}
            className={`w-24 h-24 rounded-md text-xl font-bold focus:outline-none transition-transform duration-200 ${
              color === "red"
                ? "bg-red-800"
                : color === "green"
                ? "bg-green-800"
                : color === "blue"
                ? "bg-blue-800"
                : "bg-yellow-400"
            } ${active === color ? "scale-90 brightness-90" : ""}`}
          ></button>
        ))}
      </div>
      <p className="text-lg mt-4">{message}</p>
      <p className="text-md">Score: {score}</p>
      <button
        onClick={startGame}
        className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-300"
      >
        Start
      </button>
    </div>
  );
}
