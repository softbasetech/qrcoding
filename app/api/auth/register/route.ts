/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDb } from '@/lib/connect';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password: pass, displayName } = body;

    if (!username || !email || !pass) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await getDb();

    const exist = await User.findOne({ email })
    const usernamExist = await User.findOne({ username })
    if(exist) {
      return NextResponse.json(
        { error: 'Email already exist, login instead.' },
        { status: 400 }
      );
    }

    if(usernamExist) {
      return NextResponse.json(
        { error: 'Username not available, use a different username.' },
        { status: 400 }
      );
    }
    

    // Generate a unique ID
    const hash = await hashPassword(pass)

    const user = await User.create({ 
      username, 
      role: "user", 
      email,
      password: hash,
      displayName,
      dailyConversionsRemaining: 5,
      lastConversionReset: new Date(),
      isPro: false,
    });

    // Send welcome email
    // try {
    //   await sendEmail({
    //     to: email,
    //     subject: 'Welcome to Programming Education Platform',
    //     template: 'welcome',
    //     data: { name },
    //   });
    // } catch (emailError) {
    //   console.error('Failed to send welcome email:', emailError);
    //   // Continue with registration even if email fails
    // }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
