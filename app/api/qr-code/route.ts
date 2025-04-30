/* eslint-disable @typescript-eslint/no-explicit-any */
// import QRCode from 'qrcode';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import * as qr from "qrcode";
import { nanoid } from "nanoid";
import dbConnect from '@/lib/db';
import QRCode from '@/lib/models/QRCode';
import * as QrCode from "qrcode";
import { uploadFileString } from '@/lib/cloundinary';
import { UploadApiResponse } from 'cloudinary';
const DAILY_LIMIT = 20;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Check daily limit for non-authenticated users
    if (!session) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const codesGeneratedToday = await QRCode.countDocuments({
        ipAddress: ip,
        createdAt: { $gte: today },
      });

      if (codesGeneratedToday >= DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, message: "Daily QR code generation limit reached" },
          { status: 429 }
        );
      }
    }
    const body = await req.json();
    const { content, title, options } = body;
    console.log('Received content:', content);
    console.log('Received title:', title);

    if (!content || !title) {
      return NextResponse.json(
        { success: false, message: "Content and title are required" },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrOptions: QrCode.QRCodeToStringOptions = {
      errorCorrectionLevel: "H",
      type: "svg",
      // quality: 0.92,
      margin: options?.margin || 4,
      color: {
        dark: options?.color || "#000000",
        light: options?.backgroundColor || "#ffffff",
      },
      width: options?.size || 300,
    };

    const qrSvg = await QrCode.toString(content, qrOptions);
    const shortId = nanoid(10);
    const qrCodeUrl = await qr.toDataURL(content);
    const cloudinaryUrl: UploadApiResponse = await uploadFileString(qrCodeUrl);

    const qrCode = await QRCode.create({
      userId: session?.user?.id,
      ipAddress: ip,
      content,
      title,
      shortId,
      scans: 0,
      url: cloudinaryUrl.url,
    });

    return NextResponse.json({qrCode, qrSvg, qrCodeUrl});
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const query = session?.user?._id 
      ? { userId: session.user._id }
      : { ipAddress: ip };

    const qrCodes = await QRCode.find(query).select("_id content title shortId scans url content ipAddress userId createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: qrCodes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}