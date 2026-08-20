/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "flag-icons/css/flag-icons.min.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const PhaserGame = dynamic(
  () => import("@/components/PhaserGame"),
  {
    ssr: false,
  }
);

type Props = {
  floor: number;
  playerName?: string;
  country?: string | null;
  wpm?: number;
  runs?: number;
};

export default function GameClient({
  floor,
  playerName = "PLAYER",
  country,
  runs = 0,
}: Props) {
  const sceneRef = useRef<any>(null);
  const mismatchRef = useRef(false);
  const previousInputRef = useRef("");
  const battleStatsRef = useRef({ time: 0, wpm: 0 });
  const [inputValue, setInputValue] = useState("");
  const [sentence, setSentence] = useState("Loading sentence...");
  const [inputError, setInputError] = useState(false);
  const [clock, setClock] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const runCount = runs;
  const [metrics, setMetrics] = useState({
    typedCharacters: 0,
    correctCharacters: 0,
  });
  const handleSceneRef = useCallback((scene: any | null) => {
    sceneRef.current = scene;
  }, []);
  const handleSentenceChange = useCallback((nextSentence: string) => {
    setSentence(nextSentence);
    setInputValue("");
    setInputError(false);
    mismatchRef.current = false;
    previousInputRef.current = "";
    sceneRef.current?.setInputText?.("");
  }, []);

  // Resolve country to ISO alpha-2 code for flag-icons
  let countryCode: string | undefined;
  let displayCountry: string | undefined | null = country;

  if (country) {
    const trimmed = country.trim();

    if (trimmed.length === 2) {
      countryCode = trimmed.toLowerCase();
      // convert code back to full name for display if possible
      const name = countries.getName(trimmed.toUpperCase(), "en");
      if (name) displayCountry = name;
    } else {
      // try to map full country name to alpha-2
      const code = countries.getAlpha2Code(trimmed, "en");
      if (code) {
        countryCode = code.toLowerCase();
        displayCountry = countries.getName(code, "en") || trimmed;
      } else {
        // fallback: show raw value
        displayCountry = trimmed;
      }
    }
  }

  const typedCharacters = Array.from(inputValue);
  const sentenceCharacters = Array.from(sentence);
  const hasMismatch = typedCharacters.some(
    (character, index) => sentenceCharacters[index] !== character,
  );
  const accuracy = metrics.typedCharacters
    ? Math.round(
        (metrics.correctCharacters / metrics.typedCharacters) * 100,
      )
    : 100;

  useEffect(() => {
    if (!startedAt) return;

    const timer = window.setInterval(() => setClock(Date.now()), 500);

    return () => window.clearInterval(timer);
  }, [startedAt]);

  const liveWpm =
    startedAt && clock && metrics.typedCharacters
      ? Math.round(
          metrics.typedCharacters /
            5 /
            ((clock - startedAt) / 60000),
        )
      : 0;
  const elapsedSeconds = startedAt && clock
    ? Math.max(0, Math.floor((clock - startedAt) / 1000))
    : 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedRemainingSeconds = elapsedSeconds % 60;
  const elapsedTime = `${String(elapsedMinutes).padStart(2, "0")}:${String(
    elapsedRemainingSeconds,
  ).padStart(2, "0")}`;

  useEffect(() => {
    battleStatsRef.current = {
      time: elapsedSeconds,
      wpm: liveWpm,
    };
  }, [elapsedSeconds, liveWpm]);

  const handleFloorCleared = useCallback(() => {
    void fetch("/api/game/result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        floor,
        time: battleStatsRef.current.time,
        wpm: battleStatsRef.current.wpm,
      }),
    }).catch(() => {});
  }, [floor]);

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">

      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6">
        <div className="text-lg font-black tracking-tight">
          TYPE<span className="text-purple-400">FIGHTER</span>
        </div>

        <div>
          <Link
            href="/solo"
            className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* GAME CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">

          {/* ========================= */}
          {/* LEFT — STATS (doesn't stretch to match right column) */}
          {/* ========================= */}

          <aside className="self-start border border-white/[0.07] bg-white/[0.025] p-5">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-purple-400">
              Battle Stats
            </p>

            <div className="mt-6 space-y-6">

              {/* PLAYER */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Player
                </p>

                <p className="mt-1 truncate text-lg font-black">
                  {playerName}
                </p>
              </div>

              {/* COUNTRY */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Country
                </p>

                {countryCode ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`fi fi-${countryCode}`}
                      title={displayCountry ?? country ?? ""}
                      aria-label={displayCountry ?? country ?? ""}
                      style={{
                        width: "20px",
                        height: "15px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "inline-block",
                      }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-white/25">—</p>
                )}
              </div>

              {/* FLOOR */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Floor
                </p>

                <p className="mt-1 text-3xl font-black">
                  {String(floor).padStart(2, "0")}
                </p>
              </div>

              {/* WPM */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  WPM
                </p>

                <p className="mt-1 text-3xl font-black text-purple-400">
                  {liveWpm}
                </p>
              </div>

              {/* ACCURACY */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Accuracy
                </p>

                <p className="mt-1 text-3xl font-black">
                  {accuracy}%
                </p>
              </div>

              {/* TIME */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Time
                </p>

                <p className="mt-1 text-3xl font-black">
                  {elapsedTime}
                </p>
              </div>

              {/* RUNS */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Runs
                </p>

                <p className="mt-1 text-3xl font-black">
                  {runCount}
                </p>
              </div>

            </div>

          </aside>


          {/* ========================= */}
          {/* RIGHT — GAME + TYPING (taller than the stats column) */}
          {/* ========================= */}

          <div className="flex min-w-0 flex-col gap-4">

            {/* GAME — fixed, small box instead of fullscreen */}
            <div className="h-[300px] w-full overflow-hidden border border-white/[0.08] bg-black md:h-[380px]">
              <PhaserGame
                floor={floor}
                setSceneRef={handleSceneRef}
                onSentenceChange={handleSentenceChange}
                onFloorCleared={handleFloorCleared}
              />
            </div>

            {/* TYPING */}
            <section className="border border-white/[0.07] bg-white/[0.025] px-6 py-8">

              <p className="text-center text-[9px] font-bold uppercase tracking-[0.35em] text-purple-400">
                Type This Sentence
              </p>

              <h1 className="mt-3 whitespace-pre-wrap text-center text-2xl font-black leading-tight tracking-tight md:text-3xl">
                {sentenceCharacters.map((character, index) => (
                  <span
                    key={`${index}-${character}`}
                    className={
                      index >= typedCharacters.length
                        ? "text-white"
                        : typedCharacters[index] === character
                          ? "text-yellow-300"
                          : "text-red-500"
                    }
                  >
                    {character}
                  </span>
                ))}
                {typedCharacters.slice(sentenceCharacters.length).map((character, index) => (
                  <span
                    key={`extra-${index}-${character}`}
                    className="text-red-500"
                  >
                    {character}
                  </span>
                ))}
              </h1>

              <div className="mx-auto mt-6 max-w-xl">
                <input
                  autoFocus
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  value={inputValue}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    const previousCharacters = Array.from(previousInputRef.current);
                    const nextCharacters = Array.from(nextValue);
                    const nextMismatch = nextCharacters.some(
                      (character, index) => sentenceCharacters[index] !== character,
                    );
                    let commonPrefixLength = 0;

                    while (
                      commonPrefixLength < previousCharacters.length &&
                      commonPrefixLength < nextCharacters.length &&
                      previousCharacters[commonPrefixLength] ===
                        nextCharacters[commonPrefixLength]
                    ) {
                      commonPrefixLength += 1;
                    }

                    const addedCharacters = nextCharacters.slice(commonPrefixLength);
                    const addedCorrectCharacters = addedCharacters.reduce(
                      (count, character, index) =>
                        count +
                        (sentenceCharacters[commonPrefixLength + index] === character
                          ? 1
                          : 0),
                      0,
                    );

                    setInputValue(nextValue);
                    setInputError(nextMismatch);
                    if (addedCharacters.length) {
                      setMetrics((current) => ({
                        typedCharacters: current.typedCharacters + addedCharacters.length,
                        correctCharacters:
                          current.correctCharacters + addedCorrectCharacters,
                      }));
                    }
                    if (addedCharacters.length && !startedAt) {
                      const now = Date.now();
                      setStartedAt(now);
                      setClock(now);
                    }
                    sceneRef.current?.setInputText?.(nextValue);

                    if (nextMismatch && !mismatchRef.current) {
                      sceneRef.current?.handleTypingMistake?.();
                    }

                    mismatchRef.current = nextMismatch;
                    previousInputRef.current = nextValue;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const isCorrect = sceneRef.current?.submitInput?.(inputValue) === true;

                      setInputError(!isCorrect);

                      if (isCorrect) {
                        setInputValue("");
                        sceneRef.current?.setInputText?.("");
                        mismatchRef.current = false;
                      }
                    }
                  }}
                  type="text"
                  placeholder="Start typing..."
                  aria-invalid={inputError || hasMismatch}
                  className={`h-14 w-full border bg-[#0d1016] px-5 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/15 ${
                    inputError || hasMismatch
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-white/[0.1] focus:border-purple-400/60"
                  }`}
                />
              </div>

              {inputError && (
                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
                  Warning: input does not match the sentence
                </p>
              )}

              <p className="mt-3 text-center text-[9px] uppercase tracking-[0.25em] text-white/20">
                Press Enter to attack
              </p>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}