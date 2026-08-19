import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

import { createOrUpdateUser } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord" && user.id) {
        await createOrUpdateUser({
          discordId: user.id,
          username: user.name ?? "Unknown",
          displayName: user.name ?? "Unknown",
          avatar: user.image,
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.discordId = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.discordId) {
        session.user.id = token.discordId as string;
      }

      return session;
    },
  },
});