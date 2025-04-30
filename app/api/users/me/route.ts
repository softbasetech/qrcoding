/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextApiResponse } from 'next';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import FileConversion from '@/lib/models/FileConversion';
import { Types } from 'mongoose';
import QRCode from '@/lib/models/QRCode';


export async function GET(request: NextRequest, res: NextApiResponse) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
    const conversions = await FileConversion.find({ userId: new Types.ObjectId(user._id)});
    const qrCodes = await QRCode.find({ userId: new Types.ObjectId(user._id)});

    return NextResponse.json({       
      user,
      conversions,
      qrCodes,
      conversionCount: conversions.length,
      qrCodeCount: qrCodes.length,  
    });
}