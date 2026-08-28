import Link from "next/link";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import "flag-icons/css/flag-icons.min.css";
import { Metadata } from "next";
import ProfileVisibilityToggle from "@/components/ProfileVisibilityToggle";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();

  const client = await clientPromise;
  const db = client.db("typefighter");

  const user = await db.collection("users").findOne({ username });

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.id === user.discordId;
  const isHidden = user.profileHidden === true && !isOwner;

  const countryCode = user.country?.toLowerCase();
  const highestFloor = user.highestFloor ?? 0;
  const highestFloorRuns = user.floorRuns?.[String(highestFloor)] ?? 0;
  const bestTime = formatBestTime(user.bestTime);
  const rank = await getUserRank(highestFloor, user.bestTime);

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
          href="/leaderboard"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back to Leaderboard
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
            {isOwner ? "Fighter Profile" : "Viewing Fighter"}
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">
            PROFILE
          </h1>
        </div>

        <div className="relative">
          <div
            className={
              isHidden ? "pointer-events-none select-none blur-md" : ""
            }
          >
            <section className="border border-white/[0.08] bg-white/[0.025]">
              <div className="border-b border-white/[0.07] p-6 md:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.displayName} avatar`}
                      className="h-24 w-24 border border-white/[0.1] object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center border border-white/[0.1] bg-white/[0.05] text-3xl font-black">
                      {(user.displayName ?? "P").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                      Fighter
                    </p>
                    <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                      {user.displayName ?? user.username ?? "PLAYER"}
                    </h2>
                    <p className="mt-1 text-sm text-white/30">
                      @{user.username ?? "unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/[0.07] p-6 md:p-8">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                  Country
                </p>
                {countryCode ? (
                  <div className="flex items-center gap-4">
                    <span
                      className={`fi fi-${countryCode}`}
                      style={{
                        width: "40px",
                        height: "28px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "inline-block",
                      }}
                    />
                    <div>
                      <p className="text-lg font-black">
                        {getCountryName(user.country)}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        {user.country}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/30">No country selected</p>
                )}
              </div>

              <div className="p-6 md:p-8">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                  Statistics
                </p>
                <div className="grid gap-px border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2">
                  <div className="bg-[#0b0e13] p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                      WPM
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-tight">
                      {user.wpm ?? 0}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-white/15">
                      Words per minute
                    </p>
                  </div>
                  <div className="bg-[#0b0e13] p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                      Highest Floor
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-tight">
                      {highestFloor}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-white/15">
                      Solo progression
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                  Best Time
                </p>
                <p className="mt-2 text-2xl font-black">{bestTime}</p>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                  Runs
                </p>
                <p className="mt-2 text-2xl font-black">{highestFloorRuns}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-white/15">
                  Floor {highestFloor} attempts
                </p>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                  Rank
                </p>
                <p className="mt-2 text-2xl font-black">
                  {rank ? `#${rank}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {isHidden && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40">
              <span className="text-2xl">🔒</span>
              <p className="text-lg font-black tracking-tight">
                Profile is hidden
              </p>
              <p className="max-w-xs text-center text-xs text-white/40">
                {user.displayName ?? username} has chosen to keep their profile
                private.
              </p>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-6">
            <ProfileVisibilityToggle
              initialHidden={user.profileHidden ?? false}
            />
          </div>
        )}

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.25em] text-white/15">
          TypeFighter
        </p>
      </div>
    </main>
  );
}

async function getUserRank(
  highestFloor: number,
  bestTime: unknown,
): Promise<number | null> {
  if (!highestFloor || highestFloor <= 0) return null;

  const client = await clientPromise;
  const db = client.db("typefighter");
  const users = db.collection("users");

  const hasBestTime = typeof bestTime === "number" && Number.isFinite(bestTime);

  const higherRankedCount = await users.countDocuments({
    $or: [
      { highestFloor: { $gt: highestFloor } },
      {
        highestFloor,
        ...(hasBestTime
          ? { bestTime: { $lt: bestTime as number } }
          : { bestTime: { $exists: true } }),
      },
    ],
  });

  return higherRankedCount + 1;
}

function getCountryName(code?: string | null) {
  if (!code) return "Unknown";
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return names.of(code.toUpperCase()) ?? code;
}

function formatBestTime(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return "—";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
