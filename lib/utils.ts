/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { scrypt, randomBytes, timingSafeEqual } from "crypto";
// import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import APIKey from "./models/APIKey";
import User from "./models/User";
import bcrypt from 'bcrypt';

// const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

// Password comparison
// export async function comparePasswords(
//   supplied: string,
//   stored: string,
// ): Promise<boolean> {
//   const [hashed, salt] = stored.split(".");
//   const hashedBuf = Buffer.from(hashed, "hex");
//   const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
//   return timingSafeEqual(hashedBuf, suppliedBuf);
// }



// Password hashing
// export async function hashPassword(password: string): Promise<string> {
//   const salt = randomBytes(16).toString("hex");
//   const buf = (await scryptAsync(password, salt, 64)) as Buffer;
//   return `${buf.toString("hex")}.${salt}`;
// }

export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as  jwt.PublicKey);
    return decoded as { id: number; email: string };
  } catch (error: any) {
    return null;
  }
}

// API key middleware
export const validateApiKey = async (req: NextRequest) => {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ message: "API key is required" }, {status: 401});
  }

  const key = await APIKey.findOne({ key: apiKey })
  if (!key) {
    return NextResponse.json({ message: "Invalid API key" }, {status: 401});
  }

  // Get the user associated with this API key
  const user = await User.findOne({ id: key.userId})
  if (!user) {
    return NextResponse.json({ message: "User not found" }, {status: 401});
  }

  if (!user.isPro) {
    return NextResponse.json({ message: "This API requires a Pro subscription" }, { status: 403 });
  }

  // // Assign user to request for later use
  // req.user = user;
  // next();
};