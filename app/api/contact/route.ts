/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomerEnquiry from '@/lib/models/CustomerEnquiry';
import { getServerSession } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') {
    return NextResponse.json({message: "Not Found"}, { status: 404 })
  }
    try {
      const body = await request.json();
      const { name, email, message, subject } = body;
      
      if (!name || !email || !message) {
        return NextResponse.json({ message: "All fields are required" }, {status: 400});
      }

      const contact = await CustomerEnquiry.create({
        name,
        email,
        subject,
        message,
      });
      
      // await contact.save()

      return NextResponse.json(contact);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, {status: 500});
    }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user

  if (!user || user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const queries = await CustomerEnquiry.find().limit(200).lean()

  return NextResponse.json(queries)
}