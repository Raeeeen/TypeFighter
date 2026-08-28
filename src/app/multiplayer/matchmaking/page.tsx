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

  return <MatchmakingClient username={session.user?.name ?? "Player"} />;
}