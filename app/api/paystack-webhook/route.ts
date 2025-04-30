/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import PaystackLog from '@/lib/models/PaystackLog';
import Payment from '@/lib/models/Payment';
import User from '@/lib/models/User';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { event } = body;
  
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(JSON.stringify(body)).digest('hex');
    if (hash !== request.headers.get('x-paystack-signature')) {
      return NextResponse.json('Invalid signature');
    }

    try{
    // Log the webhook
    await PaystackLog.create({
      event: event.event,
      data: event.data,
      refrence: event.data.reference,
    });
    // await log.save();

    // Handle successful charge
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ providerReference: reference });

      if (payment) {
        // Update payment status
        await Payment.updateOne(new Types.ObjectId(payment._id), { status: 'success'})

        // Update user subscription status
        if (payment.metadata?.subscriptionType === 'pro') {
          await User.updateOne(new Types.ObjectId(payment.userId), { isPro: true })
        }
      } {
        await Payment.create({
          amount: event.amount,
          currency: 'GHS',
          provider: '',
          providerReference: reference,
          status: 'success',
          metadata: {},
          userId: event.metadata.userId,
        });
      }
    }
    return NextResponse.json({},{status: 200})
  } catch (error: any) {
  return NextResponse.json({ message: error.message }, { status: 500 });
  }


}