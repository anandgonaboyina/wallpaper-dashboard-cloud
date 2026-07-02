import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch all custom quotes from MongoDB
    let quotes: any[] = await db.collection('Quotes').find().sort({ _id: -1 }).toArray();

    return NextResponse.json({ quotes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    if (body.quotes && Array.isArray(body.quotes)) {
      // Bulk insert from JSON upload
      const validQuotes = body.quotes.filter((q: any) => q.text && q.author);
      if (validQuotes.length > 0) {
        await db.collection('Quotes').insertMany(validQuotes);
      }
      return NextResponse.json({ success: true, count: validQuotes.length });
    } else {
      // Single insert
      const { text, author } = body;
      if (!text || !author) {
        return NextResponse.json({ error: 'Text and author required' }, { status: 400 });
      }
      const result = await db.collection('Quotes').insertOne({ text, author });
      return NextResponse.json({ success: true, quote: { _id: result.insertedId, text, author } });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add quote' }, { status: 500 });
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
    
    await db.collection('Quotes').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
