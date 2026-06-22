import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: Request) {
  try {
    const { username, email, password, otp } = await request.json();

    if (!username || !email || !password || !otp) {
      return NextResponse.json({ error: 'Username, email, password, and OTP are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('User').findOne({
      $or: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
    }

    // Verify OTP
    const otpRecord = await db.collection('Otp').findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    if (new Date() > new Date(otpRecord.expiry)) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection('User').insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    const token = jwt.sign({ userId: result.insertedId.toString(), username }, JWT_SECRET, {
      expiresIn: '365d',
    });

    // Delete the OTP record so it can't be reused
    await db.collection('Otp').deleteOne({ email });

    return NextResponse.json({ success: true, token, username });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
