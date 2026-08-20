import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: false }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("typefighter");

  await db.collection("users").updateOne(
    { discordId: session.user.id },
    { $set: { lastSeen: new Date() } },
  );

  return Response.json({ success: true });
}