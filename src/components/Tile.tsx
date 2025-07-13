// components/Tile.tsx
"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function Tile({
  x,
  y,
  value,
  id,
}: {
  x: number;
  y: number;
  value: number;
  id: number;
}) {
  return (
    <motion.div
      key={id}
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "absolute w-20 h-20 flex items-center justify-center text-xl font-bold rounded",
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
      style={{
        top: `${y * 5.25}rem`,
        left: `${x * 5.25}rem`,
      }}
    >
      {value}
    </motion.div>
  );
}
