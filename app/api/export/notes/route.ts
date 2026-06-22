import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string };
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const storage = await db.collection('DashboardStorage').findOne({ userId: decoded.userId });
    
    let notes = [];
    if (storage) {
      try {
        if (storage.data && typeof storage.data === 'string') {
          const parsed = JSON.parse(storage.data);
          notes = parsed.state?.notes || parsed.notes || [];
        } else if (storage.notes) {
          notes = storage.notes;
        } else if (storage.data) {
          notes = storage.data.state?.notes || storage.data.notes || [];
        }
      } catch (e) {
        console.error('Error parsing notes:', e);
      }
    }

    const jsonContent = JSON.stringify(notes, null, 2);
    
    return new Response(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dashboard-notes-${decoded.username}-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (error) {
    console.error('Export notes error:', error);
    return NextResponse.json({ error: 'Failed to export notes' }, { status: 500 });
  }
}
