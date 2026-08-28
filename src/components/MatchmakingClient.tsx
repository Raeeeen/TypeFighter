/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayer } from "@/hooks/useMultiplayer";

export default function MatchmakingClient({ username }: { username: string }) {
  const router = useRouter();
  const { socket, room, joinQueue } = useMultiplayer();
  const [elapsed, setElapsed] = useState(0);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (socket && !searching) {
      joinQueue();
      setSearching(true);
    }
  }, [socket, searching, joinQueue]);

  useEffect(() => {
    if (!searching) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [searching]);

  useEffect(() => {
    if (room?.code && room.status !== "finished") {
      router.replace(`/game?mode=multiplayer&room=${room.code}`);
    }
  }, [room, router]);

  const handleCancel = () => {
    socket?.emit("queue:leave");
    router.push("/multiplayer");
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

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

      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-between border-b border-white/[0.06] px-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-black tracking-tight transition hover:text-purple-400"
        >
          TYPE<span className="text-purple-400">FIGHTER</span>
        </Link>

        <Link
          href="/multiplayer"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
          Quick Match
        </p>
        
        <div className="relative my-10 flex h-40 w-40 items-center justify-center">
          <div className="absolute h-40 w-40 animate-ping rounded-full bg-purple-400/10" />
          <div className="absolute h-28 w-28 animate-ping rounded-full bg-purple-400/15 [animation-delay:200ms]" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10">
            <span className="text-2xl">⚔️</span>
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-[-0.03em] md:text-5xl">
          SEARCHING FOR
          <br />
          <span className="text-purple-400">OPPONENT.</span>
        </h1>

        <p className="mt-6 font-mono text-3xl font-black tracking-widest text-white/60">
          {mm}:{ss}
        </p>

        <p className="mt-4 max-w-sm text-sm leading-6 text-white/30">
          Fighting as <span className="text-white/60">{username}</span>. This
          may take a few seconds depending on how many players are online.
        </p>

        <button
          onClick={handleCancel}
          className="mt-10 border border-white/10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:border-red-400/40 hover:text-red-400"
        >
          Cancel Search
        </button>
      </div>
    </main>
  );
}