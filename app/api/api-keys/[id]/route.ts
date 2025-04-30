/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import APIKey from "@/lib/models/APIKey";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = session.user;
  if(!user.isProUser){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
   const { id } = await params;
   if (!id) {
        return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }
    const apiKey = await APIKey.findOne({ userId: new Types.ObjectId(user._id), id: new Types.ObjectId(id)}).lean();
    if (!apiKey) {
        return NextResponse.json({ message: "API key not found" }, { status: 404 });
    }

   return NextResponse.json(apiKey); 
}


export async function DELETE(
  request: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = session.user;
  if(!user.isProUser){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
    try {
      const { id } = await params;

      if (!id) {
          return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
      }

      const apiKeys = await APIKey.find({ userId: user.id });
      const apiKey = apiKeys.find((key: any) => key.id === id);
      if (!apiKey) {
          return NextResponse.json({ message: "API key not found" }, { status: 404 });
      }

      await APIKey.findByIdAndDelete(new Types.ObjectId(id))

      return NextResponse.json({ message: "API key revoked successfully" }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}