"use client";

import { useState } from "react";

const choices = ["rock", "paper", "scissors"] as const;
type Choice = (typeof choices)[number];

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const play = (choice: Choice) => {
    const compChoice = choices[Math.floor(Math.random() * 3)];
    const outcome = getResult(choice, compChoice);

    setPlayerChoice(choice);
    setComputerChoice(compChoice);
    setResult(outcome);

    if (outcome === "You Win!") setScore(score + 1);
    if (outcome === "You Lose!") setScore(score - 1);
  };

  const getResult = (player: Choice, comp: Choice): string => {
    if (player === comp) return "It's a Draw!";
    if (
      (player === "rock" && comp === "scissors") ||
      (player === "paper" && comp === "rock") ||
      (player === "scissors" && comp === "paper")
    )
      return "You Win!";
    return "You Lose!";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <h1 className="text-3xl font-bold mb-6">Rock Paper Scissors</h1>

      <div className="flex gap-4 mb-6">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => play(choice)}
            className="px-6 py-3 text-lg font-medium border border-white rounded-xl shadow hover:scale-105 transition"
          >
            {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </button>
        ))}
      </div>

      {playerChoice && computerChoice && (
        <div className="text-center space-y-2 mb-4">
          <p>
            You chose: <strong>{playerChoice}</strong>
          </p>
          <p>
            Computer chose: <strong>{computerChoice}</strong>
          </p>
          <p className="text-xl font-semibold">{result}</p>
        </div>
      )}

      <p className="text-lg font-bold">Score: {score}</p>
    </div>
  );
}
