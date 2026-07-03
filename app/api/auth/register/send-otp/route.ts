import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

export async function POST(request: Request) {
  try {
    const { username, email } = await request.json();

    if (!username || !email) {
      return NextResponse.json({ error: 'Username and email are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists (case-insensitive)
    const existingUser = await db.collection('User').findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json({ error: 'Username already taken, please try another' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Email already registered, please try logging in' }, { status: 400 });
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Save to a temporary OTP collection
    await db.collection('Otp').updateOne(
      { email },
      { $set: { otp, expiry, username } },
      { upsert: true }
    );

    // Send email via Brevo REST API
    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
      return NextResponse.json({ error: 'Email service is not configured properly' }, { status: 500 });
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { email: BREVO_SENDER_EMAIL, name: 'Grind Board' },
        to: [{ email, name: username }],
        subject: 'Your Registration Verification Code',
        htmlContent: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; text-align: center; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid #27272a; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
            <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Verify your email</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              Welcome to Grind Board, <b>${username}</b>!
            </p>
            
            <div style="background-color: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #3f3f46; margin-bottom: 32px;">
              <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Your verification code</p>
              <h1 style="margin: 0; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #3b82f6;">${otp}</h1>
            </div>
            
            <hr style="border: none; border-top: 1px solid #27272a; margin: 0 0 24px 0;">
            
            <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 0;">
              This code is valid for <b>15 minutes</b>.<br>
              If you did not attempt to register, please ignore this email.
            </p>
          </div>
        `
      })
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email!' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
