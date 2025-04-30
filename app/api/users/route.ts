/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserFromRequest } from '@/lib/utils';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import FileConversion from '@/lib/models/FileConversion';
import { Types } from 'mongoose';
import QRCode from '@/lib/models/QRCode';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user

  if (!user || user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
    const users = await User.find().lean()
    const conversions = await FileConversion.find().lean()
    const qrCodes = await QRCode.find().lean();

    return NextResponse.json({       
      users,
      conversions,
      qrCodes,
      conversionCount: conversions.length,
      qrCodeCount: qrCodes.length,  
    });
}