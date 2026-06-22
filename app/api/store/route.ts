import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { calculateAndAwardBadges } from '@/lib/badgeCalculator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const authenticate = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    return decoded;
  } catch (err) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const record = await db.collection('DashboardStorage').findOne({ userId: user.userId });
    
    if (!record) {
      return NextResponse.json({ data: null, lastModified: 0 });
    }
    
    let returnedData;
    // Backwards compatibility for old stringified format
    if (record.data && typeof record.data === 'string') {
      returnedData = JSON.parse(record.data);
    } else {
      const { _id, userId, lastModified, updatedAt, version, displaySettings, generalSettings, ...coreData } = record;
      const reconstructedState = {
        ...coreData,
        ...(displaySettings || {}),
        ...(generalSettings || {})
      };
      returnedData = {
        state: reconstructedState,
        version: version || 2
      };
    }
    
    return NextResponse.json({ 
      data: returnedData,
      lastModified: record.lastModified ? Number(record.lastModified) : 0
    });
  } catch (error) {
    console.error('Error reading store from DB:', error);
    return NextResponse.json({ error: 'Failed to read store' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const incomingLastModified = body.lastModified || Date.now();

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('DashboardStorage').findOne({ userId: user.userId });

    let existingCloudData = null;
    if (existing) {
      if (existing.data && typeof existing.data === 'string') {
        existingCloudData = JSON.parse(existing.data);
      } else {
        const { _id, userId, lastModified, updatedAt, version, displaySettings, generalSettings, ...coreData } = existing;
        const reconstructedState = {
          ...coreData,
          ...(displaySettings || {}),
          ...(generalSettings || {})
        };
        existingCloudData = { state: reconstructedState, version: version || 2 };
      }
    }

    if (existing && existing.lastModified && Number(existing.lastModified) > incomingLastModified && !body.forceSync) {
      return NextResponse.json({ 
        conflict: true, 
        cloudData: existingCloudData,
        cloudLastModified: Number(existing.lastModified)
      }, { status: 409 });
    }
    
    // Group settings efficiently
    const { state, version } = body.data || {};
    
    const displaySettings: Record<string, any> = {};
    const generalSettings: Record<string, any> = {};
    const coreData: Record<string, any> = {};

    Object.keys(state || {}).forEach(key => {
      if (key.startsWith('show') || key.startsWith('hide') || key.startsWith('is')) {
        displaySettings[key] = state[key];
      } else if (typeof state[key] === 'string' || typeof state[key] === 'number') {
        generalSettings[key] = state[key];
      } else {
        coreData[key] = state[key]; // Arrays and nested objects
      }
    });

    const MAX_STORAGE_BYTES = 51200; // 50KB free limit per user
    const payloadSize = Buffer.byteLength(JSON.stringify(body), 'utf8');

    if (payloadSize > MAX_STORAGE_BYTES) {
      await db.collection('User').updateOne(
        { _id: new ObjectId(user.userId) },
        { $set: { 
          deletionScheduledAt: new Date(), 
          deletionReason: `Storage quota exceeded (${(payloadSize/1024).toFixed(1)}KB / 50KB limit). Please export and clear old notes within 7 days to prevent account deletion.` 
        }}
      );

      let notes = coreData.notes || [];
      const existingWarning = notes.find((n: any) => n.id === 'quota-warning');
      if (!existingWarning) {
        notes.push({
          id: 'quota-warning',
          text: `⚠️ STORAGE LIMIT EXCEEDED ⚠️\n\nYour dashboard data is ${(payloadSize/1024).toFixed(1)}KB, exceeding the 50KB free tier limit.\n\nTo ensure fair database usage across 5000+ active users, your account is scheduled for deletion in 7 days.\n\nPlease use the "Export Notes" button in the Notes Manager to backup your data, then safely delete old notes to drop below 50KB. Once below the limit, this deletion will automatically cancel.`,
          color: 'bg-red-400',
          x: 50,
          y: 50,
          isPinned: true
        });
        coreData.notes = notes;
      }
    } else {
      // User is under quota, check if we need to cancel an existing quota warning
      const dbUser = await db.collection('User').findOne({ _id: new ObjectId(user.userId) });
      if (dbUser && dbUser.deletionScheduledAt && dbUser.deletionReason && dbUser.deletionReason.includes('Storage quota exceeded')) {
        await db.collection('User').updateOne(
          { _id: new ObjectId(user.userId) },
          { $unset: { deletionScheduledAt: "", deletionReason: "" } }
        );
        if (coreData.notes) {
          coreData.notes = coreData.notes.filter((n: any) => n.id !== 'quota-warning');
        }
      }
    }

    const newLastModified = Date.now();
    const updateDoc = {
      version: version || 2,
      username: user.username,
      lastModified: newLastModified,
      updatedAt: new Date(),
      displaySettings,
      generalSettings,
      ...coreData
    };

    // Use updateOne with $set to only mutate fields efficiently, keeping it perfectly decoupled
    await db.collection('DashboardStorage').updateOne(
      { userId: user.userId },
      { 
        $set: updateDoc,
        $setOnInsert: { userId: user.userId }
      },
      { upsert: true }
    );
    
    // Trigger automatic badge distribution asynchronously without blocking response
    calculateAndAwardBadges().catch(console.error);

    return NextResponse.json({ success: true, lastModified: newLastModified });
  } catch (error) {
    console.error('Error writing store to DB:', error);
    return NextResponse.json({ error: 'Failed to write store' }, { status: 500 });
  }
}
