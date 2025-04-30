/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import { comparePasswords} from "@/lib/utils"
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        await dbConnect();

        const user = await User.findOne({ username: credentials.username }).select('+password')

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await comparePasswords(credentials.password, user.password)
        console.log("isPasswordValid:",isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id,
          name: user.displayName || user.username,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          isPro: user.isPro,
          image: user?.image,
          dailyConversionsRemaining: user.dailyConversionsRemaining,
          lastConversionReset: user.lastConversionReset,
          emailVerified: user.emailVerified
          
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.isPro = token.isPro;
        session.user.googleId = token.googleId;
        session.user.image = token.image;
        session.user.dailyConversionsRemaining = token.dailyConversionsRemaining;
        session.user.lastConversionReset = token.lastConversionReset;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: JWT, user: any, account: any}) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.isPro = user.isPro;
        token.googleId = user.googleId;
        token.image = user.image;
        token.dailyConversionsRemaining = user.dailyConversionsRemaining;
        token.lastConversionReset = user.lastConversionReset;
        token.emailVerified = user.emailVerified;
      }

      if (account && account.provider && account.provider !== "credentials" && user?.email) {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            username: user.username,
            password: Math.random().toString(36).slice(-10),
            image: user.image,
            emailVerified: new Date(),
          });
          
          token.sub = newUser._id.toString();
          token.username = newUser.username;
          token.id = newUser._id;
          token.name = newUser.name;
          token.email = newUser.email;
          token.role = newUser.role;
          token.isPro = newUser.isPro;
          token.googleId = newUser.googleId;
          token.image =  newUser.image;
          token.dailyConversionsRemaining =  newUser.dailyConversionsRemaining;
          token.lastConversionReset =  newUser.lastConversionReset;
          token.emailVerified =  newUser.emailVerified;
        } else {
          token.sub = existingUser._id.toString();
          token.username = existingUser.username;
        }
      }
      return token
    },

  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
