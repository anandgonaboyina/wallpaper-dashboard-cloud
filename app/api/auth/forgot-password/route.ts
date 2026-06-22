import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username or Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by either username or email
    const user = await db.collection('User').findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: 'No account found with an associated email' }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { resetCode, resetCodeExpiry: expiry } }
    );

    // Send email via Brevo REST API
    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
      return NextResponse.json({ error: 'Email service is not configured properly in server environment' }, { status: 500 });
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { email: BREVO_SENDER_EMAIL, name: 'Productive Dashboard' },
        to: [{ email: user.email, name: user.username }],
        subject: 'Your Productive Dashboard Password Reset Code',
        htmlContent: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; text-align: center; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid #27272a; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
            <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              You requested a password reset for your Productive Dashboard account (<b>${user.username}</b>).
            </p>
            
            <div style="background-color: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #3f3f46; margin-bottom: 32px;">
              <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Your 6-digit code</p>
              <h1 style="margin: 0; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #3b82f6;">${resetCode}</h1>
            </div>
            
            <hr style="border: none; border-top: 1px solid #27272a; margin: 0 0 24px 0;">
            
            <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 0;">
              This code is valid for <b>15 minutes</b>.<br>
              If you did not request this, please ignore this email to keep your account safe.
            </p>
          </div>
        `
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Brevo API Error:', errorText);
      return NextResponse.json({ error: 'Failed to send recovery email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Recovery code sent successfully to your email!' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
