import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const floor = Number(body.floor);
    const time = Number(body.time);
    const wpm = Number(body.wpm);

    if (
      !Number.isInteger(floor) ||
      floor < 1 ||
      !Number.isFinite(time) ||
      time < 0 ||
      !Number.isFinite(wpm) ||
      wpm < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid game result" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("typefighter");
    const users = db.collection("users");
    const user = await users.findOne({ discordId: session.user.id });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const previousBestTime =
      typeof user.bestTime === "number" ? user.bestTime : null;
    const previousHighestFloor =
      typeof user.highestFloor === "number" ? user.highestFloor : 0;
    const previousWpm = typeof user.wpm === "number" ? user.wpm : 0;

    await users.updateOne(
      { discordId: session.user.id },
      {
        $set: {
          bestTime:
            previousBestTime === null
              ? time
              : Math.min(previousBestTime, time),
          highestFloor: Math.max(previousHighestFloor, floor),
          runs: typeof user.runs === "number" ? user.runs : 0,
          wpm: Math.max(previousWpm, wpm),
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save game result" },
      { status: 500 },
    );
  }
}