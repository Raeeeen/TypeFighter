import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import LeaderboardClient from "@/components/LeaderboardClient";

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  username: string;
  avatar: string | null;
  country: string | null;
  highestFloor: number;
  bestTime: number;
  wpm: number;
};

export default async function LeaderboardPage() {
  const client = await clientPromise;
  const db = client.db("typefighter");

  const users = await db
    .collection("users")
    .aggregate<{
      displayName?: string;
      username?: string;
      avatar?: string | null;
      country?: string | null;
      highestFloor?: number;
      bestTime?: number;
      wpm?: number;
    }>([
      {
        $match: {
          highestFloor: { $gt: 0 },
          bestTime: { $type: "number" },
        },
      },
      { $sort: { highestFloor: -1, bestTime: 1 } },
      { $limit: 100 },
    ])
    .toArray();

  const entries: LeaderboardEntry[] = users.map((user, index) => ({
    rank: index + 1,
    displayName: user.displayName ?? user.username ?? "PLAYER",
    username: user.username ?? "unknown",
    avatar: user.avatar ?? null,
    country: user.country ?? null,
    highestFloor: user.highestFloor ?? 0,
    bestTime: user.bestTime ?? 0,
    wpm: user.wpm ?? 0,
  }));

  return (
    <main className="min-h-screen bg-[#090b0f] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/[0.06] blur-[180px]" />
      </div>

      <header className="relative z-10 flex h-20 items-center justify-between border-b border-white/[0.06] px-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-black tracking-tight transition hover:text-purple-400"
        >
          TYPE<span className="text-purple-400">FIGHTER</span>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back to Menu
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
              Rankings
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">
              LEADERBOARD
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/30">
              Top 100 fighters ranked by highest floor, then fastest best time.
            </p>
          </div>

        
        </div>

        <LeaderboardClient entries={entries} />
      </div>
    </main>
  );
}
