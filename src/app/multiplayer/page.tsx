import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multiplayer",
  description:
    "Battle other players live. Find a match instantly or set up a custom lobby.",
};

export default async function MultiplayerPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const client = await clientPromise;
  const db = client.db("typefighter");

  const user = await db.collection("users").findOne({
    discordId: session.user?.id,
  });

  if (!user?.country) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[#090b0f] text-white">
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
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
            Multiplayer
          </p>

          <h1 className="mt-4 text-6xl font-black leading-[0.9] tracking-[-0.04em] md:text-8xl">
            CHOOSE
            <br />
            <span className="text-purple-400">MODE.</span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/30">
            Race against real players. Jump into a quick match or set up a
            private lobby with friends.
          </p>
        </div>

        {/* Mode options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Find Opponents */}
          <Link
            href="/multiplayer/matchmaking"
            className="group relative overflow-hidden border border-purple-400/30 bg-purple-500/[0.07] p-8 transition duration-200 hover:border-purple-400/80 hover:bg-purple-500/[0.14]"
          >
            <div className="absolute right-0 top-0 h-full w-1 bg-purple-400 opacity-0 transition group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-purple-400 transition-all duration-300 group-hover:w-full" />

            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                  Quick Match
                </span>
                <span className="text-sm text-purple-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <p className="text-4xl font-black tracking-[-0.03em] transition group-hover:text-purple-400">
                  FIND
                  <br />
                  OPPONENT
                </p>

                <p className="mt-4 text-[11px] leading-5 text-white/30">
                  Get matched with a random player instantly. 1v1, fastest
                  fingers win.
                </p>

                <p className="mt-5 text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Players{" "}
                  <span className="text-purple-400">2</span>
                </p>
              </div>
            </div>
          </Link>

          {/* Custom Lobby */}
          <Link
            href="/multiplayer/lobby"
            className="group relative overflow-hidden border border-purple-400/30 bg-purple-500/[0.07] p-8 transition duration-200 hover:border-purple-400/80 hover:bg-purple-500/[0.14]"
          >
            <div className="absolute right-0 top-0 h-full w-1 bg-purple-400 opacity-0 transition group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-purple-400 transition-all duration-300 group-hover:w-full" />

            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                  Private Room
                </span>
                <span className="text-sm text-purple-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <p className="text-4xl font-black tracking-[-0.03em] transition group-hover:text-purple-400">
                  CUSTOM
                  <br />
                  LOBBY
                </p>

                <p className="mt-4 text-[11px] leading-5 text-white/30">
                  Create or join a room with a code. Invite friends, up to 10
                  players.
                </p>

                <p className="mt-5 text-[9px] font-bold uppercase tracking-widest text-white/25">
                  Players{" "}
                  <span className="text-purple-400">2–10</span>
                </p>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] text-white/15">
          TypeFighter • Multiplayer
        </p>
      </div>
    </main>
  );
}