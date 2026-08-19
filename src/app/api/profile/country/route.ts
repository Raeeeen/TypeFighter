import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const country = body.country;

    if (!country || typeof country !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Country is required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("typefighter");

    await db.collection("users").updateOne(
      {
        discordId: session.user.id,
      },
      {
        $set: {
          discordId: session.user.id,
          username: session.user.name ?? "Unknown Fighter",
          image: session.user.image ?? null,
          country,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          wpm: 0,
          highestFloor: 0,
          bestTime: null,
          runs: 0,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Country save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save country",
      },
      { status: 500 }
    );
  }
}