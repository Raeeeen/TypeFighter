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

    if (!Number.isInteger(floor) || floor < 1) {
      return NextResponse.json(
        { success: false, message: "A valid floor is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("typefighter");
    const result = await db.collection("users").findOneAndUpdate(
      { discordId: session.user.id },
      {
        $inc: {
          runs: 1,
          [`floorRuns.${floor}`]: 1,
        },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );

    return NextResponse.json({
      success: true,
      runs: result?.floorRuns?.[String(floor)] ?? 0,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to increment runs" },
      { status: 500 },
    );
  }
}