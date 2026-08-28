/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

export default function ResultsScreen({ ranking }: { ranking: any[] }) {
  return (
    <main className="min-h-screen bg-[#090b0f] text-white">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
          Match Complete
        </p>
        <h1 className="mt-4 text-center text-5xl font-black tracking-[-0.03em]">
          RESULTS
        </h1>

        <div className="mt-10 space-y-2">
          {ranking.map((p) => (
            <div
              key={p.userId}
              className={`flex items-center justify-between border p-5 ${
                p.rank === 1
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-white/[0.07] bg-white/[0.025]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-purple-400">
                  #{p.rank}
                </span>
                <span className="font-bold">{p.username}</span>
                {p.outcome === "defeat" && (
                  <span className="border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-red-400">
                    Defeated
                  </span>
                )}
              </div>
              <div className="flex gap-6 text-xs font-bold text-white/40">
                <span>{p.wpm} WPM</span>
                <span>{p.accuracy}% ACC</span>
                <span>{p.time}s</span>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/multiplayer"
          className="mt-10 block border border-white/10 py-3 text-center text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white"
        >
          Back to Multiplayer
        </Link>
      </div>
    </main>
  );
}
