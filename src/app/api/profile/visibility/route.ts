import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = await request.json();
  const hidden = Boolean(body.hidden);

  const client = await clientPromise;
  const db = client.db("typefighter");

  await db
    .collection("users")
    .updateOne(
      { discordId: session.user.id },
      { $set: { profileHidden: hidden } },
    );

  return NextResponse.json({ success: true, hidden });
}
