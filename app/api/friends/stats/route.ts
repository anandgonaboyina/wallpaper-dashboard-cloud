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

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const friendship = await db.collection('Friendship').findOne({
      status: 'ACCEPTED',
      $or: [
        { senderId: user.userId, receiverId: friendId },
        { senderId: friendId, receiverId: user.userId }
      ]
    });

    if (!friendship) return NextResponse.json({ error: 'Not friends' }, { status: 403 });

    const friendDashboard = await db.collection('DashboardStorage').findOne({ userId: friendId });

    if (!friendDashboard) return NextResponse.json({ data: null });

    let parsedData;
    if (friendDashboard.data && typeof friendDashboard.data === 'string') {
      parsedData = JSON.parse(friendDashboard.data).state || {};
    } else {
      const { displaySettings, generalSettings, ...coreData } = friendDashboard;
      parsedData = {
        ...coreData,
        ...(displaySettings || {}),
        ...(generalSettings || {})
      };
    }
    
    const { ObjectId } = require('mongodb');
    let userQuery;
    try {
      userQuery = { _id: new ObjectId(friendId) };
    } catch {
      userQuery = { _id: friendId };
    }
    const friendAccount = await db.collection('User').findOne(userQuery);

    const publicStats = {
      username: friendAccount?.username || friendId,
      history: parsedData.history || {},
      healthData: parsedData.healthData || {},
      tasksCompleted: (parsedData.tasks || []).filter((t: any) => t.completed).length,
      tasks: parsedData.tasks || [],
      deadlines: parsedData.deadlines || [],
      timetableGrid: parsedData.timetableGrid || null,
      lastLogin: friendAccount?.lastLogin || null,
      createdAt: friendAccount?.createdAt || null
    };

    return NextResponse.json({ stats: publicStats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
