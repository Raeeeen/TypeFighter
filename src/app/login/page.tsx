import { signIn } from "@/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TypeFighter — Typing Battle Game",
  description: "Battle bosses across 10 floors by typing sentences fast and accurately. Free browser-based typing game with leaderboards.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0b0d10] text-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "TypeFighter",
            alternateName: "typefighter.onrender.com",
            url: "https://typefighter.onrender.com",
          }),
        }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-white/40">
              TYPEFIGHTER
            </div>

            <h1 className="text-5xl font-black tracking-tight">
              TYPE<span className="text-purple-400">FIGHTER</span>
            </h1>

            <p className="mt-4 text-sm text-white/40">
              Type faster. Fight harder.
            </p>
          </div>

          <div className="border border-white/10 bg-[#111419]/95 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">
                Welcome
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Enter the arena
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Sign in with Discord to save your runs and compete on the
                leaderboard.
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("discord", {
                  redirectTo: "/",
                });
              }}
            >
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 bg-[#5865F2] px-5 py-4 font-bold transition hover:bg-[#6875ff] active:scale-[0.99]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.54 0c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H4.46c-1.1 0-2-.9-2-2V2c0-1.1.9-2 2-2h15.08Zm-3.5 17.3c-.77.57-1.7.86-2.73.86-1.03 0-1.96-.29-2.73-.86.08-.1.17-.21.25-.32-1.5-.44-2.61-1.36-3.34-2.76.2.14.41.27.63.38.22.11.45.2.68.27-.23-.17-.44-.37-.62-.59a6.7 6.7 0 0 1-1.3-2.3c.2.1.4.19.62.26.21.08.43.14.65.19a3.8 3.8 0 0 1-.64-.72c-.2-.28-.38-.58-.52-.9.8.4 1.65.61 2.55.64a3.04 3.04 0 0 1-.02-.38c0-.42.1-.82.29-1.18.2-.36.46-.65.8-.87.34-.22.72-.33 1.15-.33.43 0 .82.11 1.16.34.34.22.6.53.79.9.86-.1 1.65-.35 2.37-.73-.1.36-.28.68-.52.96.23-.03.45-.09.67-.16.22-.07.43-.16.63-.27-.15.23-.32.44-.51.64-.19.2-.4.38-.63.53v.22c0 1.33-.3 2.45-.9 3.37-.6.91-1.46 1.63-2.58 2.14-.09.04-.19.08-.28.11.08.11.17.22.26.32Z" />
                </svg>

                <span>CONTINUE WITH DISCORD</span>
              </button>
            </form>

            <div className="my-7 h-px bg-white/10" />

            <p className="text-center text-xs leading-5 text-white/30">
              By continuing, you agree to the TypeFighter rules and terms.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white/20">
            <span>TYPEFIGHTER</span>
            <span>•</span>
            <span>SOLO</span>
            <span>•</span>
            <span>LEADERBOARDS</span>
          </div>
        </div>
      </div>
    </main>
  );
}