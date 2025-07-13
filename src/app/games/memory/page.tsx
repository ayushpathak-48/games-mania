/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const symbols = ["🍎", "🐶", "🎵", "🚗", "🌟", "🍕", "🎮", "⚽️"];

type CardType = {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
};

function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffledSymbols = shuffle([...symbols, ...symbols]);
    const newCards = shuffledSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false,
    }));
    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setWon(false);
  };

  const flipCard = (index: number) => {
    if (cards[index].flipped || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    const newFlipped = [...flippedIndices, index];
    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [i1, i2] = newFlipped;
      if (newCards[i1].symbol === newCards[i2].symbol) {
        newCards[i1].matched = true;
        newCards[i2].matched = true;
        setFlippedIndices([]);

        if (
          newCards.every(
            (card) =>
              card.matched || card === newCards[i1] || card === newCards[i2],
          )
        ) {
          setWon(true);
        }
      } else {
        setTimeout(() => {
          newCards[i1].flipped = false;
          newCards[i2].flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 700);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🧠 Memory Match Game</h1>
      <div className="grid grid-cols-4 gap-4 max-w-md">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => flipCard(index)}
            className={clsx(
              "w-20 border h-20 text-2xl font-bold flex items-center justify-center rounded-lg shadow transition-all duration-300",
              card.flipped || card.matched
                ? " border-white"
                : "border-gray-400",
            )}
          >
            {card.flipped || card.matched ? card.symbol : ""}
          </button>
        ))}
      </div>

      <p className="mt-4 text-lg">Moves: {moves}</p>

      {won && (
        <div className="mt-6 text-green-600 font-semibold text-xl">
          🎉 You matched all cards in {moves} moves!
        </div>
      )}

      <button
        onClick={startNewGame}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Restart Game
      </button>
    </div>
  );
}
