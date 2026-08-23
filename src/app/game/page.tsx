import GameClient from "../../components/GameClient";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

type Props = {
  searchParams: Promise<{
    floor?: string;
  }>;
};

export default async function GamePage({ searchParams }: Props) {
  const params = await searchParams;

  const floor = Math.max(1, Number(params.floor ?? 1));

  const session = await auth();

  let playerName: string | undefined = undefined;
  let country: string | null | undefined = undefined;
  let wpm = 0;
  let runs = 0;

  if (session?.user?.id) {
    const client = await clientPromise;
    const db = client.db("typefighter");

    const user = await db.collection("users").findOne({
      discordId: session.user.id,
    });

    playerName = session.user.name ?? user?.displayName ?? undefined;
    country = user?.country ?? null;
    wpm = user?.wpm ?? 0;
    runs = user?.floorRuns?.[String(floor)] ?? 0;
  } else if (session?.user) {
    playerName = session.user.name ?? undefined;
  }

  return (
    <main className="min-h-screen bg-[#090b0f]">
      <GameClient
        floor={floor}
        playerName={playerName}
        country={country}
        wpm={wpm}
        runs={runs}
      />
    </main>
  );
}