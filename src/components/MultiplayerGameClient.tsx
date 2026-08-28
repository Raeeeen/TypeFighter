/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import MiniOpponentScreen from "@/components/MiniOpponentScreen";
import ResultsScreen from "@/components/ResultsScreen";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
});

export default function MultiplayerGameClient({
  roomCode,
  playerName,
}: {
  roomCode: string;
  playerName: string;
}) {
  const router = useRouter();
  const {
    socket,
    room,
    opponents,
    results,
    notInRoom,
    announceReady,
    emitAction,
    emitFinish,
    emitLeave,
    registerOpponentHandler,
    opponentTyping,
    emitTyping,
  } = useMultiplayer();

  const myFloor = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
  const sceneRef = useRef<any>(null);
  const [sentence, setSentence] = useState("Loading sentence...");
  const [inputValue, setInputValue] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [metrics, setMetrics] = useState({
    typedCharacters: 0,
    correctCharacters: 0,
  });
  const [finished, setFinished] = useState(false);
  const [focusedId, setFocusedId] = useState<string>("self");
  const previousInputRef = useRef("");
  const clockRef = useRef(0);
  const [, forceTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySentence =
    focusedId === "self"
      ? sentence
      : (opponentTyping[focusedId]?.sentence ?? "Waiting...");
  const displayTyped =
    focusedId === "self" ? inputValue : (opponentTyping[focusedId]?.text ?? "");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canType, setCanType] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (notInRoom) router.replace("/multiplayer");
  }, [notInRoom, router]);

  useEffect(() => {
    if (!sceneReady) return;
    announceReady(roomCode, myFloor);
  }, [sceneReady, roomCode, myFloor, announceReady]);

  useEffect(() => {
    if (focusedId === "self" && !finished) {
      inputRef.current?.focus();
    }
  }, [focusedId, finished]);

  useEffect(() => {
    if (!socket) return;
    const onCountdown = ({ startAt }: { startAt: number }) => {
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((startAt - Date.now()) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          setCanType(true);
        } else {
          requestAnimationFrame(tick);
        }
      };
      tick();
    };
    socket.on("game:countdown", onCountdown);
    return () => {
      socket.off("game:countdown", onCountdown);
    };
  }, [socket]);

  useEffect(() => {
    const leave = () => emitLeave(roomCode);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("beforeunload", leave);
      leave();
    };
  }, [roomCode, emitLeave]);

  useEffect(() => {
    if (!startedAt) return;
    const t = window.setInterval(() => {
      clockRef.current = Date.now();
      forceTick((n) => n + 1);
    }, 500);
    return () => window.clearInterval(t);
  }, [startedAt]);

  const liveWpm =
    startedAt && clockRef.current && metrics.typedCharacters
      ? Math.round(
          metrics.typedCharacters /
            5 /
            ((clockRef.current - startedAt) / 60000),
        )
      : 0;
  const accuracy = metrics.typedCharacters
    ? Math.round((metrics.correctCharacters / metrics.typedCharacters) * 100)
    : 100;
  const elapsedSeconds = startedAt
    ? Math.max(0, Math.floor((clockRef.current - startedAt) / 1000))
    : 0;

  const handleSceneRef = useCallback((scene: any | null) => {
    sceneRef.current = scene;
    if (scene) setSceneReady(true);
  }, []);

  const handleSentenceChange = useCallback((s: string) => {
    setSentence(s);
    setInputValue("");
    previousInputRef.current = "";
  }, []);

  const handleVictory = useCallback(() => {
    setFinished(true);
    emitFinish(roomCode, liveWpm, accuracy, elapsedSeconds || 1, "victory");
  }, [roomCode, liveWpm, accuracy, elapsedSeconds, emitFinish]);

  const handleDefeat = useCallback(() => {
    setFinished(true);
    emitFinish(roomCode, liveWpm, accuracy, elapsedSeconds || 1, "defeat");
  }, [roomCode, liveWpm, accuracy, elapsedSeconds, emitFinish]);

  const handleLeave = useCallback(() => {
    emitLeave(roomCode);
    router.replace("/multiplayer");
  }, [roomCode, emitLeave, router]);

  const opponentList = Object.entries(opponents);

  if (results) return <ResultsScreen ranking={results} />;

  function renderHighlighted(target: string, typed: string) {
    const targetChars = Array.from(target);
    const typedChars = Array.from(typed);
    return (
      <>
        {targetChars.map((ch, i) => (
          <span
            key={i}
            className={
              i >= typedChars.length
                ? "text-white"
                : typedChars[i] === ch
                  ? "text-yellow-300"
                  : "text-red-500"
            }
          >
            {ch}
          </span>
        ))}
        {typedChars.slice(targetChars.length).map((ch, i) => (
          <span key={`extra-${i}`} className="text-red-500">
            {ch}
          </span>
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6">
        <div className="text-lg font-black tracking-tight">
          TYPE<span className="text-purple-400">FIGHTER</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-white/30">
            Room {roomCode}
          </span>
          <button
            onClick={handleLeave}
            className="border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 transition hover:border-red-400/40 hover:text-red-400"
          >
            Leave Match
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-4">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-end gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Volume
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  sceneRef.current?.setMusicVolume?.(next);
                }}
                className="h-1 w-32 cursor-pointer appearance-none bg-white/10 accent-purple-400"
              />
              <span className="w-8 shrink-0 text-right text-[10px] font-bold text-white/40">
                {Math.round(volume * 100)}
              </span>
            </div>
            <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden border border-white/[0.08] bg-black">
              {!sceneReady && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400/30 border-t-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                    Loading assets...
                  </span>
                </div>
              )}

              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
                  <span className="text-8xl font-black text-purple-400">
                    {countdown}
                  </span>
                </div>
              )}

              <div
                className={focusedId === "self" ? "absolute inset-0" : "hidden"}
              >
                <PhaserGame
                  floor={myFloor}
                  playerName={playerName}
                  mode="multiplayer"
                  setSceneRef={handleSceneRef}
                  onSentenceChange={handleSentenceChange}
                  onCorrectHit={() => emitAction(roomCode, "correct")}
                  onMistake={() => emitAction(roomCode, "mistake")}
                  onVictory={handleVictory}
                  onDefeat={handleDefeat}
                />
              </div>

              {opponentList.map(([userId, info]) => (
                <div
                  key={userId}
                  className={
                    focusedId === userId ? "absolute inset-0" : "hidden"
                  }
                >
                  <MiniOpponentScreen
                    userId={userId}
                    username={info.username}
                    floor={info.floor}
                    status={info.status}
                    large
                    registerOpponentHandler={registerOpponentHandler}
                  />
                </div>
              ))}
            </div>

            <section className="mx-auto w-full max-w-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-6">
              <div className="mb-2 flex items-center justify-center gap-3">
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/25">
                  {focusedId === "self"
                    ? "Your fight"
                    : `Watching ${opponents[focusedId]?.username}`}
                </p>
                {focusedId !== "self" && (
                  <button
                    onClick={() => setFocusedId("self")}
                    className="border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-purple-400 transition hover:bg-purple-500/20"
                  >
                    ← Back to Your Fight
                  </button>
                )}
              </div>
              <h1 className="whitespace-pre-wrap text-center text-xl font-black">
                {renderHighlighted(displaySentence, displayTyped)}
              </h1>
              <input
                ref={inputRef}
                disabled={
                  finished ||
                  focusedId !== "self" ||
                  sentence === "Loading sentence..." ||
                  !canType
                }
                value={focusedId === "self" ? inputValue : displayTyped}
                onChange={(e) => {
                  const next = e.target.value;
                  const prevChars = Array.from(previousInputRef.current);
                  const nextChars = Array.from(next);
                  let common = 0;
                  while (
                    common < prevChars.length &&
                    common < nextChars.length &&
                    prevChars[common] === nextChars[common]
                  )
                    common++;
                  const added = nextChars.slice(common);
                  const sentenceChars = Array.from(sentence);
                  const addedCorrect = added.reduce(
                    (c, ch, i) =>
                      c + (sentenceChars[common + i] === ch ? 1 : 0),
                    0,
                  );
                  const addedWrong = added.length - addedCorrect;

                  setInputValue(next);
                  emitTyping(roomCode, sentence, next);
                  if (added.length) {
                    setMetrics((m) => ({
                      typedCharacters: m.typedCharacters + added.length,
                      correctCharacters: m.correctCharacters + addedCorrect,
                    }));
                  }
                  if (added.length && !startedAt) {
                    setStartedAt(Date.now());
                    clockRef.current = Date.now();
                  }
                  sceneRef.current?.setInputText?.(next);
                  for (let i = 0; i < addedWrong; i++)
                    sceneRef.current?.handleTypingMistake?.();
                  previousInputRef.current = next;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const ok =
                      sceneRef.current?.submitInput?.(inputValue) === true;
                    if (ok) {
                      setInputValue("");
                      sceneRef.current?.setInputText?.("");
                      emitTyping(roomCode, sentence, "");
                    }
                  }
                }}
                className="mt-6 h-14 w-full border border-white/10 bg-[#0d1016] px-5 text-center text-lg font-bold outline-none focus:border-purple-400/60 disabled:cursor-not-allowed disabled:opacity-40"
                placeholder={
                  focusedId !== "self"
                    ? "Waiting for them to type..."
                    : sentence === "Loading sentence..."
                      ? "Loading..."
                      : finished
                        ? "You're done — keep watching, or wait for results"
                        : "Start typing..."
                }
              />
              <div className="mt-4 flex justify-center gap-8 text-xs font-bold text-white/40">
                <span>
                  WPM <span className="text-purple-400">{liveWpm}</span>
                </span>
                <span>
                  Accuracy <span className="text-purple-400">{accuracy}%</span>
                </span>
                <span>Time {elapsedSeconds}s</span>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-2">
            {opponentList.map(([userId, info]) => (
              <button
                key={userId}
                onClick={() => setFocusedId(userId)}
                className={`aspect-video w-full overflow-hidden border text-left transition ${
                  focusedId === userId
                    ? "border-purple-400"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="pointer-events-none relative h-full w-full">
                  <MiniOpponentScreen
                    userId={userId}
                    username={info.username}
                    floor={info.floor}
                    status={info.status}
                    thumbnailOnly
                    registerOpponentHandler={registerOpponentHandler}
                  />
                </div>
              </button>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
