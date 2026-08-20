import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

import { createOrUpdateUser } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],

  callbacks: {
    async signIn({ user, account }) {
      const discordId =
        account?.provider === "discord"
          ? account.providerAccountId
          : undefined;

      if (discordId) {
        await createOrUpdateUser({
          discordId,
          username: user.name ?? "Unknown",
          displayName: user.name ?? "Unknown",
          avatar: user.image,
        });
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "discord" && account.providerAccountId) {
        token.discordId = account.providerAccountId;
      } else if (user?.id && !token.discordId) {
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