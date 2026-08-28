/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayer } from "@/hooks/useMultiplayer";

type View = "choose" | "create" | "join" | "room";

export default function LobbyClient({ username }: { username: string }) {
  const router = useRouter();
  const { socket, room, createLobby, joinLobby, startLobby } = useMultiplayer();

  const [view, setView] = useState<View>("choose");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;
    const onError = (msg: string) => setError(msg);
    socket.on("lobby:error", onError);
    return () => {
      socket.off("lobby:error", onError);
    };
  }, [socket]);

  useEffect(() => {
    if (room?.code) setView("room");
  }, [room]);

  useEffect(() => {
    if (room?.status === "in_progress" || room?.status === "starting") {
      router.push(`/game?mode=multiplayer&room=${room.code}`);
    }
  }, [room, router]);

  const isHost = room && socket && room.hostId === socket.id;

  const readyCount = room?.players.filter((p: any) => p.ready).length ?? 0;

  const toggleReady = useCallback(
    (code: string) => socket?.emit("lobby:ready", { code }),
    [socket],
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

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
          Private Room
        </p>

        {view === "choose" && (
          <>
            <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.04em] md:text-6xl">
              CUSTOM
              <br />
              <span className="text-purple-400">LOBBY.</span>
            </h1>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setView("create")}
                className="group border border-purple-400/30 bg-purple-500/[0.07] p-6 text-left transition hover:border-purple-400/80 hover:bg-purple-500/[0.14]"
              >
                <p className="text-2xl font-black">CREATE</p>
                <p className="mt-1 text-xs text-white/30">
                  Host a new room and invite friends
                </p>
              </button>

              <button
                onClick={() => setView("join")}
                className="group border border-white/[0.07] bg-white/[0.025] p-6 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <p className="text-2xl font-black">JOIN</p>
                <p className="mt-1 text-xs text-white/30">
                  Enter a room code from a friend
                </p>
              </button>
            </div>
          </>
        )}

        {view === "create" && (
          <>
            <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.04em] md:text-6xl">
              SET
              <br />
              <span className="text-purple-400">ROOM SIZE.</span>
            </h1>

            <p className="mt-6 text-sm text-white/30">
              Choose how many players can join, up to 10.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxPlayers(n)}
                  className={`h-14 w-14 border text-lg font-black transition ${
                    maxPlayers === n
                      ? "border-purple-400 bg-purple-500/20 text-purple-400"
                      : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => setView("choose")}
                className="border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => createLobby(maxPlayers)}
                className="flex-1 bg-purple-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-purple-400"
              >
                Create Room
              </button>
            </div>
          </>
        )}

        {view === "join" && (
          <>
            <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.04em] md:text-6xl">
              ENTER
              <br />
              <span className="text-purple-400">ROOM CODE.</span>
            </h1>

            <input
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={6}
              placeholder="ABC123"
              className="mt-8 w-full border border-white/10 bg-white/[0.03] px-5 py-4 text-center font-mono text-2xl font-black tracking-[0.3em] text-white placeholder:text-white/15 focus:border-purple-400/60 focus:outline-none"
            />

            {error && (
              <p className="mt-3 text-center text-xs font-bold text-red-400">
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setView("choose");
                  setError("");
                }}
                className="border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => joinCode.length >= 4 && joinLobby(joinCode)}
                disabled={joinCode.length < 4}
                className="flex-1 bg-purple-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-purple-400 disabled:opacity-30"
              >
                Join Room
              </button>
            </div>
          </>
        )}

        {view === "room" && room && (
          <>
            <div className="mt-4 flex items-center justify-between">
              <h1 className="text-4xl font-black tracking-[-0.03em]">
                ROOM <span className="text-purple-400">{room.code}</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {room.players.length}/{room.maxPlayers}
              </span>
            </div>

            <p className="mt-4 text-sm text-white/30">
              Share this code with friends.{" "}
              {isHost ? "You're the host" : "Waiting for host to start"}.
            </p>

            <div className="mt-8 space-y-2">
              {room.players.map((p: any) => {
                const isMe = socket && p.id === socket.id;
                const isPlayerHost = p.id === room.hostId;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border border-white/[0.07] bg-white/[0.025] px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white/80">
                        {p.username}
                        {isPlayerHost && (
                          <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-purple-400">
                            Host
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          p.ready ? "text-green-400" : "text-white/20"
                        }`}
                      >
                        {p.ready ? "Ready" : "Waiting"}
                      </span>

                      {isMe && !isPlayerHost && (
                        <button
                          onClick={() => toggleReady(room.code)}
                          className={`border px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition ${
                            p.ready
                              ? "border-green-400/30 bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30"
                              : "border-purple-400/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                          }`}
                        >
                          {p.ready ? "Ready ✓ (click to unready)" : "Ready Up"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {Array.from({
                length: room.maxPlayers - room.players.length,
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="border border-dashed border-white/[0.06] px-5 py-4 text-xs text-white/15"
                >
                  Open slot
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => router.push("/multiplayer")}
                className="border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:border-red-400/40 hover:text-red-400"
              >
                Leave
              </button>
              {isHost && (
                <button
                  onClick={() => startLobby(room.code)}
                  disabled={
                    room.players.length < 2 ||
                    !room.players.every((p: any) => p.ready)
                  }
                  className="flex-1 bg-purple-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-purple-400 disabled:opacity-30"
                >
                  Start Match ({readyCount}/{room.players.length} ready)
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
