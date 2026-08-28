import { auth } from "@/auth"; 
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = jwt.sign(
    { sub: session.user.id, name: session.user.name },
    process.env.AUTH_SECRET!,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token });
}