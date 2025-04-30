/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import Paystack from '@paystack/paystack-sdk';
import Payment from '@/lib/models/Payment';
import { authOptions } from '@/app/utils/authOptions';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    try {

    // Initialize Paystack transaction
    const amount = 14552; // GHS 145.52 in pesewas (smallest GHS unit)
    const email = user.email;

    const response = await paystack.transaction.initialize({
        email,
        amount,
        currency: 'GHS',
        callback_url: `${process.env.APP_URL || "https://qrcoding.vercel.com"}/dashboard/subscription?success=true`,
        metadata: {
        userId: user.id,
        // customerId
        }
    });

    // Record the payment attempt
    await Payment.create({
        userId: user.id,
        amount: 14552,
        currency: 'GHS',
        status: 'pending',
        provider: 'paystack',
        providerReference: response.data.reference,
        metadata: {
        // customerId,
        subscriptionType: 'pro'
        }
    });

    // Send the Paystack authorization URL response
    return NextResponse.json({
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: response.data.reference
    });
    } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, {status: 400});
    }
}