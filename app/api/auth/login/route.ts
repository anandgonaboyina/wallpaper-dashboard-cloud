import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username/Email and password required' }, { status: 400 });
    }

    // HARDCODED ADMIN CREDENTIALS FOR TESTING
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ userId: 'admin_id_test', username: 'admin', role: 'admin' }, JWT_SECRET, {
        expiresIn: '365d',
      });
      return NextResponse.json({ success: true, token, username: 'admin', role: 'admin' });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('User').findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, {
      expiresIn: '365d',
    });

    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return NextResponse.json({ success: true, token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
