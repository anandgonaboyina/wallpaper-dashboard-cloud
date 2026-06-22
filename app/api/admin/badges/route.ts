import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string, role?: string };
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'admin' && decoded.username !== ADMIN_USERNAME) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, badgeType } = body;

    if (!userId || !['today', 'week', 'month'].includes(badgeType)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const incQuery: Record<string, number> = {};
    incQuery[`badges.${badgeType}`] = 1;

    await db.collection('User').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: incQuery }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to award badge:', error);
    return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 });
  }
}
