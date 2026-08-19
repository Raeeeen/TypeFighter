import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";

export default async function Home() {
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
    <main className="min-h-screen overflow-hidden bg-[#090b0f] text-white">
      {/* Background grid */}
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

        <div className="flex items-center gap-4">
          {/* User info */}
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-white/80">
              {session?.user?.name ?? "PLAYER"}
            </p>

            <p className="text-[10px] uppercase tracking-widest text-white/30">
              ONLINE
            </p>
          </div>

          {/* Avatar */}
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="h-10 w-10 border border-white/10 object-cover"
            />
          ) : (
            <div className="h-10 w-10 border border-white/10 bg-white/10" />
          )}

          {/* Logout */}
          <form
            action={async () => {
              "use server";

              await signOut({
                redirectTo: "/login",
              });
            }}
          >
            <button
              type="submit"
              className="hidden text-xs font-bold uppercase tracking-wider text-white/30 transition hover:text-white sm:block"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-16 lg:grid-cols-[1fr_420px] lg:items-center">
          {/* Left */}
          <section>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
              Welcome back, fighter
            </p>

            <h1 className="max-w-3xl text-6xl font-black leading-[0.9] tracking-[-0.04em] md:text-8xl">
              TYPE.
              <br />
              FIGHT.
              <br />
              <span className="text-purple-400">DOMINATE.</span>
            </h1>

            <p className="mt-8 max-w-lg text-sm leading-7 text-white/35">
              Test your typing speed against increasingly dangerous enemies.
              Climb the stages and prove you&apos;re the fastest fighter.
            </p>

            {/* Game stats */}
            <div className="mt-10 flex gap-10 border-t border-white/[0.07] pt-6">
              <div>
                <p className="text-2xl font-black">∞</p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/25">
                  Stages
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">1v1</p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/25">
                  Typing Combat
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">∞</p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/25">
                  Words
                </p>
              </div>
            </div>
          </section>

          {/* Menu */}
          <section className="w-full">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
              Game modes
            </p>

            <div className="space-y-2">
              {/* SOLO */}
              <Link
                href="/solo"
                className="group relative block overflow-hidden border border-purple-400/30 bg-purple-500/[0.08] p-6 transition duration-200 hover:border-purple-400/70 hover:bg-purple-500/[0.14]"
              >
                <div className="absolute right-0 top-0 h-full w-1 bg-purple-400 opacity-0 transition group-hover:opacity-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black tracking-tight">SOLO</p>

                    <p className="mt-1 text-xs text-white/30">
                      Fight through endless stages
                    </p>
                  </div>

                  <span className="text-3xl font-light text-purple-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              {/* MULTIPLAYER */}
              <div className="relative border border-white/[0.07] bg-white/[0.025] p-6 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-black tracking-tight">
                        MULTIPLAYER
                      </p>

                      <span className="border border-yellow-400/20 bg-yellow-400/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-yellow-400/70">
                        In Development
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-white/25">
                      Compete against other fighters
                    </p>
                  </div>

                  <span className="text-2xl text-white/20">→</span>
                </div>
              </div>

              {/* LEADERBOARDS */}
              <Link
                href="/leaderboard"
                className="group block border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black tracking-tight">
                      LEADERBOARDS
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      See who rules the arena
                    </p>
                  </div>

                  <span className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </div>
              </Link>

              {/* PROFILE */}
              <Link
                href="/profile"
                className="group block border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black tracking-tight">
                      PROFILE
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      Your stats and account
                    </p>
                  </div>

                  <span className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </div>
              </Link>
            </div>

            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.25em] text-white/15">
              TypeFighter
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
