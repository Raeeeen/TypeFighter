/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "flag-icons/css/flag-icons.min.css";
import { useMultiplayer } from "@/hooks/useMultiplayer";

type Props = {
  username: string;
  avatar: string | null;
  country: string | null;
  rank: number | null;
};

export default function MatchmakingClient({
  username,
  avatar,
  country,
  rank,
}: Props) {
  const router = useRouter();
  const { socket, room, joinQueue } = useMultiplayer();
  const [elapsed, setElapsed] = useState(0);
  const [searching, setSearching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (socket && !searching) {
      joinQueue({ avatar, country, rank });
      setSearching(true);
    }
  }, [socket, searching, joinQueue, avatar, country, rank]);

  useEffect(() => {
    if (!searching || room?.code) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [searching, room?.code]);

  useEffect(() => {
    if (!room?.code || countdown !== null) return;
    setCountdown(5);
  }, [room?.code, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.replace(`/game?mode=multiplayer&room=${room.code}`);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, room, router]);

  const handleCancel = () => {
    socket?.emit("queue:leave");
    router.push("/multiplayer");
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const opponent = room?.players.find((p: any) => p.id !== socket?.id);

  const youOnRight = useMemo(() => {
    if (!room?.code) return false;
    return Math.random() < 0.5;
  }, [room?.code]);

  const youCard = (
    <PlayerCard
      username={username}
      avatar={avatar}
      country={country}
      rank={rank}
      accent
    />
  );
  const opponentCard = (
    <PlayerCard
      username={opponent?.username ?? "Opponent"}
      avatar={opponent?.avatar ?? null}
      country={opponent?.country ?? null}
      rank={opponent?.rank ?? null}
    />
  );

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
          href="/multiplayer"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back
        </Link>
      </header>

      {!room?.code && (
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
            Fighting as <span className="text-white/60">{username}</span>.
          </p>

          <button
            onClick={handleCancel}
            className="mt-10 border border-white/10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:border-red-400/40 hover:text-red-400"
          >
            Cancel Search
          </button>
        </div>
      )}

      {room?.code && (
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
            Match Found
          </p>

          <div className="mt-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6">
            {youOnRight ? opponentCard : youCard}
            <span className="text-3xl font-black text-white/20">VS</span>
            {youOnRight ? youCard : opponentCard}
          </div>

          <p className="mt-12 font-mono text-6xl font-black text-purple-400">
            {countdown ?? 5}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/30">
            Battle begins in...
          </p>
        </div>
      )}
    </main>
  );
}

function PlayerCard({
  username,
  avatar,
  country,
  rank,
  accent = false,
}: {
  username: string;
  avatar: string | null;
  country: string | null;
  rank: number | null;
  accent?: boolean;
}) {
  const countryCode = country?.toLowerCase();

  return (
    <div
      className={`flex flex-col items-center gap-3 border p-6 ${
        accent
          ? "border-purple-400/40 bg-purple-500/[0.08]"
          : "border-white/[0.08] bg-white/[0.025]"
      }`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className="h-20 w-20 border border-white/10 object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center border border-white/10 bg-white/[0.05] text-2xl font-black">
          {username.charAt(0).toUpperCase()}
        </div>
      )}

      <p className="max-w-[10rem] truncate text-lg font-black">{username}</p>

      {countryCode && (
        <span
          className={`fi fi-${countryCode}`}
          style={{
            width: "28px",
            height: "20px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "inline-block",
          }}
        />
      )}

      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
        Rank {rank ? `#${rank}` : "—"}
      </p>
    </div>
  );
}
