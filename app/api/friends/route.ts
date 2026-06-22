import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
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

    const received = await db.collection('Friendship').find({ receiverId: user.userId }).toArray();
    const sent = await db.collection('Friendship').find({ senderId: user.userId }).toArray();

    const allUserIds = new Set([
      ...received.map(f => f.senderId),
      ...sent.map(f => f.receiverId)
    ]);

    const users = await db.collection('User').find({
      _id: { $in: Array.from(allUserIds).map(id => new ObjectId(id)) }
    }).project({ _id: 1, username: 1, lastLogin: 1, profilePicture: 1 }).toArray();

    const storages = await db.collection('DashboardStorage').find({
      userId: { $in: Array.from(allUserIds) }
    }).project({ userId: 1, lastModified: 1 }).toArray();

    const storageMap = new Map(storages.map(s => [s.userId, s.lastModified]));

    const userMap = new Map(users.map(u => {
      const idStr = u._id.toString();
      const lastMod = storageMap.get(idStr);
      let lastActive = null;
      if (lastMod) {
        lastActive = Number(lastMod);
      } else if (u.lastLogin) {
        lastActive = new Date(u.lastLogin).getTime();
      }
      return [idStr, { 
        id: idStr, 
        username: u.username,
        profilePicture: u.profilePicture || null,
        lastActive
      }];
    }));

    const pendingRequests = received
      .filter(f => f.status === 'PENDING')
      .map(f => ({ id: f._id.toString(), user: userMap.get(f.senderId) }));
      
    const sentRequests = sent
      .filter(f => f.status === 'PENDING')
      .map(f => ({ id: f._id.toString(), user: userMap.get(f.receiverId) }));
    
    const acceptedFriends = [
      ...received.filter(f => f.status === 'ACCEPTED').map(f => ({ id: f._id.toString(), user: userMap.get(f.senderId) })),
      ...sent.filter(f => f.status === 'ACCEPTED').map(f => ({ id: f._id.toString(), user: userMap.get(f.receiverId) }))
    ];

    return NextResponse.json({ pendingRequests, sentRequests, acceptedFriends });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId } = await request.json();
    if (!receiverId || receiverId === user.userId) return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('Friendship').findOne({
      $or: [
        { senderId: user.userId, receiverId },
        { senderId: receiverId, receiverId: user.userId }
      ]
    });

    if (existing) return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });

    const result = await db.collection('Friendship').insertOne({
      senderId: user.userId,
      receiverId,
      status: 'PENDING',
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, friendship: { id: result.insertedId } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { friendshipId, status } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const friendship = await db.collection('Friendship').findOne({ _id: new ObjectId(friendshipId) });
    if (!friendship || friendship.receiverId !== user.userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (status === 'REJECTED') {
      await db.collection('Friendship').deleteOne({ _id: new ObjectId(friendshipId) });
    } else {
      await db.collection('Friendship').updateOne(
        { _id: new ObjectId(friendshipId) },
        { $set: { status: 'ACCEPTED' } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = authenticate(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('id');

    if (!friendshipId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const friendship = await db.collection('Friendship').findOne({ _id: new ObjectId(friendshipId) });
    if (!friendship || (friendship.senderId !== user.userId && friendship.receiverId !== user.userId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await db.collection('Friendship').deleteOne({ _id: new ObjectId(friendshipId) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete friend' }, { status: 500 });
  }
}
