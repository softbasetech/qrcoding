/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/db";
import QRCode from "@/lib/models/QRCode";
import QRScan from "@/lib/models/QRScan";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    await dbConnect();
    const qrCode = await QRCode.findOne({ shortId: params.shortId });

    if (!qrCode) {
      return NextResponse.json(
        { success: false, message: "QR code not found" },
        { status: 404 }
      );
    }

    const scans = await QRScan.find({ qrCodeId: qrCode._id })
      .sort({ timestamp: -1 })
      .limit(100);

    // Aggregate statistics
    const stats = {
      totalScans: qrCode.scans,
      devices: {},
      browsers: {},
      countries: {},
      recentScans: scans.map(scan => ({
        timestamp: scan.timestamp,
        device: scan.device,
        location: scan.location,
      })),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}