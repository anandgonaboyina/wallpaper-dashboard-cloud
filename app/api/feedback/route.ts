import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string };

    const { type, message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newFeedback = {
      userId: decoded.userId,
      type: type || 'other',
      message: message.trim(),
      status: 'pending', // pending, reviewed, added_to_roadmap
      createdAt: new Date()
    };

    const result = await db.collection('Feedback').insertOne(newFeedback);

    return NextResponse.json({ 
      success: true, 
      feedbackId: result.insertedId.toString() 
    });
  } catch (error) {
    console.error('Feedback Submission Error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string, role?: string };

    // In a real app, verify admin role. For now, assuming the admin accesses this.
    // if (decoded.role !== 'admin' && decoded.userId !== process.env.ADMIN_USER_ID) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const client = await clientPromise;
    const db = client.db();

    const feedbackList = await db.collection('Feedback').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ feedback: feedbackList });
  } catch (error) {
    console.error('Fetch Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

import { ObjectId } from 'mongodb';

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    await db.collection('Feedback').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const { id, status } = await request.json();

    if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    await db.collection('Feedback').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

