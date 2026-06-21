import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const authenticate = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
  } catch (err) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const records = await db.collection('HealthRecord').find({ userId: user.userId }).sort({ date: 1 }).toArray();

    const healthData: Record<string, any> = {};
    records.forEach(r => {
      healthData[r.date] = {
        water: r.water || 0,
        stretch: r.stretch || 0,
        reading: r.reading || 0,
        academic: r.academic || 0,
        english: r.english || 0,
      };
    });

    return NextResponse.json({ data: healthData });
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { dateKey, metric, incrementValue } = body;

    if (!dateKey || !metric || incrementValue === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('HealthRecord').findOneAndUpdate(
      { userId: user.userId, date: dateKey },
      { 
        $inc: { [metric]: incrementValue },
        $setOnInsert: {
          water: 0,
          stretch: 0,
          reading: 0,
          academic: 0,
          english: 0
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating health data:', error);
    return NextResponse.json({ error: 'Failed to update health data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const client = await clientPromise;
    const db = client.db();

    if (action === 'deleteAll') {
      await db.collection('HealthRecord').deleteMany({ userId: user.userId });
      return NextResponse.json({ success: true });
    }

    if (action === 'olderThan') {
      const days = parseInt(searchParams.get('days') || '60', 10);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const formattedDate = cutoffDate.toISOString().split('T')[0];

      await db.collection('HealthRecord').deleteMany({
        userId: user.userId,
        date: { $lt: formattedDate }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting health data:', error);
    return NextResponse.json({ error: 'Failed to delete health data' }, { status: 500 });
  }
}
