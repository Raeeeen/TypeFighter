import { auth } from "@/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { Metadata } from "next";
import MatchmakingClient from "@/components/MatchmakingClient";

export const metadata: Metadata = {
  title: "Finding Opponent",
  description: "Searching for a live opponent to battle.",
};

export default async function MatchmakingPage() {
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

  const rank = await getUserRank(user.highestFloor ?? 0, user.bestTime);

  return (
    <MatchmakingClient
      username={session.user?.name ?? "Player"}
      avatar={session.user?.image ?? null}
      country={user.country ?? null}
      rank={rank}
    />
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
