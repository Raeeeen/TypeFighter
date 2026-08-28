import { auth } from "@/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { Metadata } from "next";
import LobbyClient from "@/components/LobbyClient";

export const metadata: Metadata = {
  title: "Custom Lobby",
  description: "Create or join a private lobby with up to 10 players.",
};

export default async function LobbyPage() {
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

  return <LobbyClient username={session.user?.name ?? "Player"} />;
}