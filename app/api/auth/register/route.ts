import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, token, username });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
