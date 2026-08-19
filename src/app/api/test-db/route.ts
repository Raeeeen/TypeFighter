import dns from "dns";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  console.log("DNS SERVERS:", dns.getServers());

  try {
    const client = await clientPromise;

    await client.db("typefighter").command({ ping: 1 });

    return Response.json({
      success: true,
      message: "MongoDB connected!",
    });
  } catch (error) {
    console.error("MONGODB ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}