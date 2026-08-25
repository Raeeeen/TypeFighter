"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "flag-icons/css/flag-icons.min.css";

countries.registerLocale(enLocale);

type Country = {
  code: string;
  name: string;
};

const countryList: Country[] = Object.entries(
  countries.getNames("en", {
    select: "official",
  })
)
  .map(([code, name]) => ({
    code,
    name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function OnboardingPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedCountry = country
    ? countryList.find((item) => item.code === country)
    : null;

  const filteredCountries = countryList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function selectCountry(code: string) {
    setCountry(code);
    setSearch("");
    setOpen(false);
    setError("");
  }

  async function handleSubmit() {
    if (!country) {
      setError("Please select your country.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/country", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save country");
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090b0f] text-white">
      {/* Background */}
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

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/[0.07] blur-[180px]" />
      </div>

      {/* Logo */}
      <header className="relative z-10 flex h-20 items-center border-b border-white/[0.06] px-6 md:px-10">
        <div className="text-xl font-black tracking-tight">
          TYPE<span className="text-purple-400">FIGHTER</span>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">

          {/* Heading */}
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
              Welcome, Fighter
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
              COMPLETE
              <br />
              YOUR PROFILE
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/35">
              Select your country before entering the arena. Your country will
              be displayed on the TypeFighter leaderboard.
            </p>
          </div>

          {/* Card */}
          <div className="border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">

            <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              Country
            </label>

            {/* Custom Country Picker */}
            <div ref={dropdownRef} className="relative">

              {/* Selected country button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen((value) => !value)}
                className={`flex h-14 w-full items-center justify-between border bg-[#0d1016] px-4 text-left transition ${
                  open
                    ? "border-purple-400/60"
                    : "border-white/[0.1] hover:border-white/[0.2]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">

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

                      <span className="text-sm font-bold">
                        {selectedCountry.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-white/30">
                      Select your country
                    </span>
                  )}

                </div>

                <span
                  className={`text-xs text-white/30 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden border border-white/[0.1] bg-[#0d1016] shadow-2xl shadow-black/50">

                  {/* Search */}
                  <div className="border-b border-white/[0.07] p-3">
                    <div className="relative">

                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/25">
                        ⌕
                      </span>

                      <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search country..."
                        className="h-11 w-full border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-sm font-medium text-white outline-none placeholder:text-white/20 focus:border-purple-400/40"
                      />

                    </div>
                  </div>

                  {/* Country list */}
                  <div className="max-h-[320px] overflow-y-auto">

                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((item) => {
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

                            {/* Flag */}
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

                            {/* Country name */}
                            <span className="text-sm font-semibold">
                              {item.name}
                            </span>

                            {/* Selected indicator */}
                            {isSelected && (
                              <span className="ml-auto text-xs font-black text-purple-400">
                                ✓
                              </span>
                            )}

                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/25">
                          No countries found
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Result count */}
                  <div className="border-t border-white/[0.06] px-4 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      {filteredCountries.length} countries
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* Selected country preview */}
            {selectedCountry && (
              <div className="mt-4 flex items-center gap-3 border border-purple-400/[0.12] bg-purple-500/[0.04] px-4 py-3">

                <span
                  className={`fi fi-${selectedCountry.code.toLowerCase()}`}
                  style={{
                    width: "28px",
                    height: "20px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "inline-block",
                  }}
                />

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400/50">
                    Selected country
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-white">
                    {selectedCountry.name}
                  </p>
                </div>

                <span className="ml-auto text-purple-400">
                  ✓
                </span>

              </div>
            )}

            {error && (
              <p className="mt-3 text-xs font-bold text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !country}
              className="mt-4 h-14 w-full bg-purple-500 text-sm font-black uppercase tracking-widest text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? "Saving..." : "Enter Arena →"}
            </button>

            <p className="mt-5 text-center text-[10px] leading-5 text-white/20">
              Your country will be visible to other players on the
              leaderboard.
            </p>

          </div>

          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] text-white/15">
            TypeFighter
          </p>

        </div>
      </div>
    </main>
  );
}