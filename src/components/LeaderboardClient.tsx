"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LeaderboardEntry } from "@/app/leaderboard/page";
import "flag-icons/css/flag-icons.min.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

type Props = {
  entries: LeaderboardEntry[];
};

type Country = {
  code: string;
  name: string;
};

const countryList: Country[] = Object.entries(
  countries.getNames("en", { select: "official" }),
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function LeaderboardClient({ entries }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry =
    country !== "all"
      ? countryList.find((item) => item.code === country)
      : null;
  const filteredCountries = countryList.filter((item) =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  function selectCountry(code: string) {
    setCountry(code);
    setCountrySearch("");
    setCountryOpen(false);
  }

  const filteredEntries = entries.filter((entry) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      entry.displayName.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query);
    const matchesCountry =
      country === "all" || entry.country?.toUpperCase() === country;

    return matchesSearch && matchesCountry;
  });

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 border border-white/[0.07] bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
          Floor priority · Time tiebreaker
        </p>

        <div className="flex items-center gap-2">
          {searchOpen && (
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search fighter..."
              aria-label="Search fighter"
              className="h-10 w-full border border-white/[0.1] bg-[#0d1016] px-3 text-sm text-white outline-none focus:border-purple-400/60 sm:w-52"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => !open);
              if (searchOpen) setSearch("");
            }}
            className="h-10 border border-white/[0.1] px-4 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:border-purple-400/60 hover:text-white"
          >
            {searchOpen ? "Close" : "Search"}
          </button>

          <div ref={countryDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen((open) => !open)}
              aria-label="Filter by country"
              className={`flex h-10 min-w-44 items-center justify-between gap-3 border bg-[#0d1016] px-3 text-left transition ${
                countryOpen
                  ? "border-purple-400/60"
                  : "border-white/[0.1] hover:border-white/[0.2]"
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedCountry ? (
                  <>
                    <span
                      className={`fi fi-${selectedCountry.code.toLowerCase()}`}
                      style={{
                        width: "24px",
                        height: "18px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "inline-block",
                      }}
                    />
                    <span className="max-w-28 truncate text-xs font-bold text-white/70">
                      {selectedCountry.name}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-white/40">
                    All Countries
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] text-white/30 transition-transform ${countryOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {countryOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden border border-white/[0.1] bg-[#0d1016] shadow-2xl shadow-black/50">
                <div className="border-b border-white/[0.07] p-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/25">
                      ⌕
                    </span>
                    <input
                      autoFocus
                      type="text"
                      value={countrySearch}
                      onChange={(event) => setCountrySearch(event.target.value)}
                      placeholder="Search country..."
                      className="h-11 w-full border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-sm font-medium text-white outline-none placeholder:text-white/20 focus:border-purple-400/40"
                    />
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => selectCountry("all")}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${
                      country === "all"
                        ? "bg-purple-500/[0.12] text-white"
                        : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="text-lg">🌐</span>
                    <span>All Countries</span>
                    {country === "all" && (
                      <span className="ml-auto text-xs font-black text-purple-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {filteredCountries.map((item) => {
                    const isSelected = country === item.code;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => selectCountry(item.code)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                          isSelected
                            ? "bg-purple-500/[0.12] text-white"
                            : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span
                          className={`fi fi-${item.code.toLowerCase()}`}
                          style={{
                            width: "24px",
                            height: "18px",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span className="text-sm font-semibold">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-xs font-black text-purple-400">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border border-white/[0.07] bg-white/[0.025]">
        <div className="hidden grid-cols-[72px_minmax(220px,1fr)_120px_120px_100px] gap-4 border-b border-white/[0.07] px-5 py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white/25 md:grid">
          <span>Rank</span>
          <span>Fighter</span>
          <span>Country</span>
          <span>Floor / Time</span>
          <span>WPM</span>
        </div>

        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => {
            const countryCode = entry.country?.toLowerCase();

            return (
              <div
                key={`${entry.rank}-${entry.username}`}
                className="grid gap-4 border-b border-white/[0.06] px-5 py-4 last:border-b-0 md:grid-cols-[72px_minmax(220px,1fr)_120px_120px_100px] md:items-center"
              >
                <div className="text-2xl font-black text-purple-400">
                  {String(entry.rank).padStart(2, "0")}
                </div>

                <Link
                  href={`/profile/${entry.username}`}
                  className="flex min-w-0 items-center gap-3 transition hover:text-purple-300"
                >
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={`${entry.displayName} profile`}
                      className="h-10 w-10 shrink-0 border border-white/[0.1] object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.1] bg-white/[0.05] font-black">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-black">
                      {entry.displayName}
                    </span>
                    <span className="block truncate text-[10px] text-white/25">
                      @{entry.username}
                    </span>
                  </span>
                </Link>

                <div className="flex items-center gap-2">
                  {countryCode ? (
                    <span
                      className={`fi fi-${countryCode}`}
                      title={entry.country ?? ""}
                      aria-label={entry.country ?? ""}
                      style={{
                        width: "24px",
                        height: "17px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "inline-block",
                      }}
                    />
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </div>

                <div>
                  <p className="font-black">Floor {entry.highestFloor}</p>
                  <p className="text-xs text-white/35">
                    {formatTime(entry.bestTime)}
                  </p>
                </div>

                <div className="font-black text-purple-400">{entry.wpm}</div>
              </div>
            );
          })
        ) : (
          <p className="px-5 py-12 text-center text-sm text-white/30">
            No fighters match this search.
          </p>
        )}
      </div>
    </section>
  );
}
