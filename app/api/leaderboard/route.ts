import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string };
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch all users
    const users = await db.collection('User').find({}, {
      projection: { password: 0, email: 0 }
    }).toArray();

    // 2. Fetch friendships of current user
    const friendships = await db.collection('Friendship').find({
      $or: [
        { senderId: decoded.userId },
        { receiverId: decoded.userId }
      ],
      status: 'ACCEPTED'
    }).toArray();

    const friendIds = new Set(friendships.map(f => 
      f.senderId === decoded.userId ? f.receiverId : f.senderId
    ));

    // 3. Fetch all stores to get history
    const stores = await db.collection('DashboardStorage').find({}, {
      projection: { userId: 1, history: 1, data: 1 }
    }).toArray();

    const userHistories: Record<string, Record<string, number>> = {};
    stores.forEach(store => {
      let history = {};
      if (store.history) {
        history = store.history;
      } else if (store.data && typeof store.data === 'string') {
        try {
          const parsed = JSON.parse(store.data);
          if (parsed.history) history = parsed.history;
        } catch (e) {}
      } else if (store.data && store.data.history) {
        history = store.data.history;
      }
      userHistories[store.userId] = history;
    });

    const getLocalDateString = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    const todayStr = getLocalDateString(new Date());
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return getLocalDateString(d);
    });
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return getLocalDateString(d);
    });

    const leaderboard = users.map((u, index) => {
      const uIdStr = u._id.toString();
      const history = userHistories[uIdStr] || {};
      
      const todayFocused = history[todayStr] || 0;
      const last7DaysFocused = last7Days.reduce((acc, date) => acc + (history[date] || 0), 0);
      const last30DaysFocused = last30Days.reduce((acc, date) => acc + (history[date] || 0), 0);

      const isMe = uIdStr === decoded.userId;
      const isFriend = friendIds.has(uIdStr);
      
      let displayName = `User${index + 1000}`;
      if (isMe) {
        displayName = `${u.username} (You)`;
      } else if (isFriend) {
        displayName = u.username;
      } else if (u.alias) {
        displayName = u.alias;
      }

      return {
        id: uIdStr,
        displayName,
        isMe,
        todayFocused,
        last7DaysFocused,
        last30DaysFocused,
        badges: u.badges || { today: 0, week: 0, month: 0 }
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
