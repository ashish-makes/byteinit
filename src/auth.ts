/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession, User as NextAuthUser, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_AUTH_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_AUTH_ID,
      clientSecret: process.env.DISCORD_AUTH_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<NextAuthUser | null> {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername },
              { name: credentials.emailOrUsername },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        if (typeof credentials?.password !== "string") {
          throw new Error("Invalid password format");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Ensure the token.id is always a string, even if user.id is undefined
        token.id = user.id || ""; // Default to an empty string if user.id is undefined
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
