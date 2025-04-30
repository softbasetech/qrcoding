/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/app/utils/authOptions";
import NextAuth from "next-auth/next";
// import CredentialsProvider from "next-auth/providers/credentials"
// import GithubProvider from "next-auth/providers/github"
// import TwitterProvider from "next-auth/providers/twitter"
// import { comparePasswords} from "@/lib/utils"
// import GoogleProvider from "next-auth/providers/google";
// import dbConnect from "@/lib/db"
// import User from "@/lib/models/User"
// import { JWT } from "next-auth/jwt"
// import { Session } from "next-auth"

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
