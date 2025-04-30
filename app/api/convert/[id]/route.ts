/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import FileConversion from "@/lib/models/FileConversion";
import { Types } from "mongoose";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const query = session?.user?.id 
      ? { userId: session.user.id, _id: new Types.ObjectId(params.id) }
      : { ipAddress: ip, _id: new Types.ObjectId(params.id) };

    const conversion = await FileConversion.findOne(query).lean();

    return NextResponse.json({ success: true, data: conversion });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}