import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const broadcasts = await db.collection('Broadcast').find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const mappedBroadcasts = broadcasts.map(b => ({
      ...b,
      id: b._id.toString()
    }));

    return NextResponse.json({ broadcasts: mappedBroadcasts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, type } = await request.json();

    if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('Broadcast').insertOne({
      title,
      content,
      type: type || 'INFO',
      createdAt: new Date()
    });

    const broadcast = {
      id: result.insertedId.toString(),
      title,
      content,
      type: type || 'INFO',
      createdAt: new Date()
    };

    return NextResponse.json({ success: true, broadcast });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    
    // We import ObjectId from mongodb, but to avoid adding imports, we can require it
    const { ObjectId } = require('mongodb');
    
    await db.collection('Broadcast').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content } = await request.json();

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, title, and content required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const { ObjectId } = require('mongodb');
    
    await db.collection('Broadcast').updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, content } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update broadcast' }, { status: 500 });
  }
}
