import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'anand1234';

const authenticateAdmin = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role === 'admin') return true;
    return false;
  } catch (err) {
    return false;
  }
};

export async function POST(request: Request) {
  try {
    if (!authenticateAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Missing userId or newPassword' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // The user id here is likely a string if it's the _id from UI or the custom ID
    // Let's check how users are stored. Typically _id is ObjectId. 
    // In our auth/register it's an ObjectId but maybe converted to string in response.
    // Wait, let's use the findOne filter that matches _id if valid ObjectId or username.
    // But since it's from the admin page, `user._id` is passed.
    
    const { ObjectId } = require('mongodb');
    let query;
    try {
      query = { _id: new ObjectId(userId) };
    } catch {
      query = { _id: userId }; // If it was custom ID
    }

    const user = await db.collection('Users').findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('Users').updateOne(query, {
      $set: { password: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
