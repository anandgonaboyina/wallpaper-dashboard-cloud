import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: Request) {
  try {
    const { username, email, password, confirmPassword, otp } = await request.json();

    if (!username || !email || !password || !confirmPassword || !otp) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
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
      alias: "",
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
