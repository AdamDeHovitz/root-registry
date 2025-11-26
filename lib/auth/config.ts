import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { findUserByEmail } from "../db/queries/users";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      direwolfUsername?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    direwolfUsername?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email as string);

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await compare(credentials.password as string, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          direwolfUsername: user.direwolfUsername || undefined,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, create user in database if they don't exist
      if (account?.provider === "google") {
        const existingUser = await findUserByEmail(user.email!);

        if (!existingUser) {
          const { createUser } = await import("../db/queries/users");
          const username = user.email!.split("@")[0];

          const newUser = await createUser({
            email: user.email!,
            username,
            image: user.image,
          });

          user.id = newUser.id;
          user.username = newUser.username;
        } else {
          user.id = existingUser.id;
          user.username = existingUser.username;
          user.direwolfUsername = existingUser.direwolfUsername || undefined;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.direwolfUsername = user.direwolfUsername;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.direwolfUsername = token.direwolfUsername as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
