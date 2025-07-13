// app/page.tsx
import Link from "next/link";

const games = [
  {
    name: "Tic Tac Toe",
    slug: "tic-tac-toe",
  },
  {
    name: "Rock Paper Scissors",
    slug: "rock-paper-scissors",
  },
  {
    name: "Memory Game",
    slug: "memory",
  },
  {
    name: "Snake Game",
    slug: "snake",
  },
  {
    name: "2048 Game",
    slug: "2048",
  },
  {
    name: "Connect Four Game",
    slug: "connect-four",
  },
  {
    name: "Reversi game",
    slug: "reversi",
  },
  {
    name: "Simon Says game",
    slug: "simon-says",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎮 Games Mania</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((game) => (
          <div
            key={game.slug}
            className="border border-gray-400 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-4 flex flex-col items-center">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <Link
                href={`/games/${game.slug}`}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Play Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
