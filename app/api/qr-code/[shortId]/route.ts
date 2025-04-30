/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import QRCode from "@/lib/models/QRCode";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import QRScan from "@/lib/models/QRScan";
import ipinfo from "ipinfo";

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

    // Get location information using ipinfo
    let locationInfo = {};
    try {
      const ipInfo = await ipinfo(ip);
      locationInfo = {
        city: ipInfo.city,
        country: ipInfo.country,
        region: ipInfo.region,
        timezone: ipInfo.timezone,
      };
    } catch (error) {
      console.error('Error getting IP info:', error);
      // Fallback to just storing the IP if geolocation fails
      locationInfo = { ip };
    }

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
      location: locationInfo,
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
