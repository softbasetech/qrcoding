import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import FileConversion from "@/lib/models/FileConversion";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get total users and pro users
    const [totalUsers, totalProUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPro: true }),
    ]);

    // Get total conversions
    const totalConversions = await FileConversion.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("id name email isPro createdAt");

    // Get recent conversions with user details
    const recentConversions = await FileConversion.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "userId",
        select: "name",
      });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProUsers,
        totalConversions,
        recentUsers: recentUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          isPro: user.isPro,
          createdAt: user.createdAt,
        })),
        recentConversions: recentConversions.map(conversion => ({
          id: conversion._id,
          userId: conversion.userId._id,
          userName: conversion.userId.name,
          sourceFormat: conversion.sourceFormat,
          targetFormat: conversion.targetFormat,
          createdAt: conversion.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 