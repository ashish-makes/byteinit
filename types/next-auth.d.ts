// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;  // Ensure that id is always a string
      role?: string; // Role can be optional
    } & DefaultSession["user"];
  }

  interface User {
    id: string;  // Ensure that id is always a string
    role?: string; // Role can be optional
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;  // Ensure that id is always a string
    role?: string; // Role can be optional
  }
}
