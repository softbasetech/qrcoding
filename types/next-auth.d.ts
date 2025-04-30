/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    isPro: boolean
    googleId?: string
    image?: string
    dailyConversionsRemaining: number
    lastConversionReset: Date
    emailVerified: Date
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
    isPro: boolean
    googleId?: string
    image?: string
    dailyConversionsRemaining: number
    lastConversionReset: Date
    emailVerified: Date
  }
} 