/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import APIKey from '@/lib/models/APIKey';


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("Session: ", session);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = session.user;
  if(!user.isProUser){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Generate API key
    const key = `convert_${randomBytes(24).toString("hex")}`;
  try{
    const apiKey = await APIKey.create({
        userId: user.id,
        key,
        name,
    });
    return NextResponse.json(apiKey);
  } catch (error: any) {
  return NextResponse.json({ message: error.message }, { status: 500 });
  }

}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = session.user;
  if(!user.isProUser){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeys = await APIKey.find({userId: user.id });
  if (!apiKeys) {
    return NextResponse.json({ message: 'No QR codes found' }, { status: 404 });
  }

  return NextResponse.json(apiKeys);
}