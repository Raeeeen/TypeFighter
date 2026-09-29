import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solo Campaign",
  description:
    "Select a floor and battle typing bosses solo. Progress saves automatically.",
};

export default async function SoloPage() {
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

  const highestFloor = user.highestFloor ?? 0;

  const floors = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <main className="min-h-screen overflow-hidden bg-[#090b0f] text-white">
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
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-white/30 transition hover:text-white"
        >
          ← Back
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400">
            Solo Campaign
          </p>

          <h1 className="mt-4 text-6xl font-black leading-[0.9] tracking-[-0.04em] md:text-8xl">
            SELECT
            <br />
            <span className="text-purple-400">FLOOR.</span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/30">
            Defeat each boss to unlock the next floor. Your progress will be
            saved automatically.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between border-b border-white/[0.07] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
              Campaign Progress
            </p>

            <p className="mt-2 text-sm font-bold text-white/60">
              {highestFloor} / 10 Floors Cleared
            </p>
          </div>

          <div className="w-32 sm:w-48">
            <div className="h-1 bg-white/[0.06]">
              <div
                className="h-full bg-purple-400 transition-all"
                style={{
                  width: `${Math.min((highestFloor / 10) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {floors.map((floor) => {
            const unlocked = floor <= highestFloor + 1;
            const cleared = floor <= highestFloor;
            const estimatedWpm = 50 + (floor - 1) * 30;

            if (unlocked) {
              return (
                <Link
                  key={floor}
                  href={`/game?floor=${floor}`}
                  className="group relative aspect-square overflow-hidden border border-purple-400/30 bg-purple-500/[0.07] p-6 transition duration-200 hover:border-purple-400/80 hover:bg-purple-500/[0.14]"
                >
                  <div className="absolute right-0 top-0 h-full w-1 bg-purple-400 opacity-0 transition group-hover:opacity-100" />

                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-purple-400 transition-all duration-300 group-hover:w-full" />

                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
                        Floor
                      </span>

                      <span className="text-sm text-purple-400 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <div>
                      <p className="text-6xl font-black tracking-[-0.05em] transition group-hover:text-purple-400">
                        {String(floor).padStart(2, "0")}
                      </p>

                      <p className="mt-2 text-[9px] font-bold uppercase tracking-widest">
                        {cleared ? (
                          <span className="text-purple-400/70">Cleared</span>
                        ) : (
                          <span className="text-white/25">Ready</span>
                        )}
                      </p>

                      <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
                        Est. WPM{" "}
                        <span className="text-purple-400">{estimatedWpm}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={floor}
                className="relative aspect-square cursor-not-allowed border border-white/[0.05] bg-white/[0.02] p-6 opacity-35"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                      Floor
                    </span>

                    <span className="text-lg text-white/20">🔒</span>
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-[-0.05em] text-white/20">
                      {String(floor).padStart(2, "0")}
                    </p>

                    <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Locked
                    </p>

                    <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Est. WPM {estimatedWpm}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] text-white/15">
          TypeFighter • Solo Campaign • 10 Floors
        </p>
      </div>
    </main>
  );
}
