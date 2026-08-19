/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
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
};

export default function GameClient({
  floor,
  playerName = "PLAYER",
  country,
  wpm = 0,
}: Props) {
  const sceneRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState("");

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
                  {wpm}
                </p>
              </div>

              {/* ACCURACY */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Accuracy
                </p>

                <p className="mt-1 text-3xl font-black">
                  100%
                </p>
              </div>

              {/* TIME */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Time
                </p>

                <p className="mt-1 text-3xl font-black">
                  00:00
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
              <PhaserGame floor={floor} setSceneRef={(s) => (sceneRef.current = s)} />
            </div>

            {/* TYPING */}
            <section className="border border-white/[0.07] bg-white/[0.025] px-6 py-8">

              <p className="text-center text-[9px] font-bold uppercase tracking-[0.35em] text-purple-400">
                Type This Word
              </p>

              <h1 className="mt-3 text-center text-4xl font-black tracking-tight">
                warrior
              </h1>

              <div className="mx-auto mt-6 max-w-xl">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    sceneRef.current?.setInputText?.(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sceneRef.current?.submitInput?.();
                      setInputValue("");
                      sceneRef.current?.setInputText?.("");
                    }
                  }}
                  type="text"
                  placeholder="Start typing..."
                  className="h-14 w-full border border-white/[0.1] bg-[#0d1016] px-5 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/15 focus:border-purple-400/60"
                />
              </div>

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