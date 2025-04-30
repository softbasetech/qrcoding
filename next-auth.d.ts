/* eslint-disable @typescript-eslint/no-unused-vars */
// next-auth.d.ts (create or modify this file in your project)
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      isPro: boolean;
      googleId: string;
    } & DefaultSession["user"]; // Extend the default user properties
  }

    interface JWT {
      id: string;
      email: string;
      role: string;
      isPro: boolean;
      googleId: string;
  }
}