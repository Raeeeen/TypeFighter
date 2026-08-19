import clientPromise from "@/lib/mongodb";

export async function createOrUpdateUser(data: {
  discordId: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}) {
  const client = await clientPromise;

  const db = client.db("typefighter");

  await db.collection("users").updateOne(
    {
      discordId: data.discordId,
    },
    {
      $set: {
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar ?? null,
        updatedAt: new Date(),
      },

      $setOnInsert: {
        discordId: data.discordId,
        country: null,
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
}

export async function getUserByDiscordId(discordId: string) {
  const client = await clientPromise;

  const db = client.db("typefighter");

  return db.collection("users").findOne({
    discordId,
  });
}