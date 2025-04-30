/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import QRCode from "@/lib/models/QRCode";
import geoip from "geoip-lite";
import { UAParser }from "ua-parser-js";
import { headers } from "next/headers";
import QRScan from "@/lib/models/QRScan";

export async function GET(
  req: NextRequest,
  { params } : { params: Promise<{ shortId: string }> }
) {
  try {
    await dbConnect();
    const { shortId } = await params;
    const qrCode = await QRCode.findOne({ shortId: shortId });

    if (!qrCode) {
      return NextResponse.json(
        { success: false, message: "QR code not found" },
        { status: 404 }
      );
    }

    // Get request information
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0];
    const userAgent = (await headers()).get("user-agent") || "unknown";
    
    // Parse user agent
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Get location information
    const geo = geoip.lookup(ip);

    // Record scan
    await QRScan.create({
      qrCodeId: qrCode._id,
      ipAddress: ip,
      userAgent,
      device: {
        type: device.type || "unknown",
        browser: browser.name || "unknown",
        os: os.name || "unknown",
      },
      location: {
        city: geo?.city,
        country: geo?.country,
      },
    });

    // Increment scan count
    await QRCode.findByIdAndUpdate(qrCode._id, { $inc: { scans: 1 } });

    return NextResponse.json({
      success: true,
      data: {
        content: qrCode.content,
        scans: qrCode.scans + 1,
      },
    });
  } catch (error: any) {
    console.error('QR code scan error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET_stats(
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