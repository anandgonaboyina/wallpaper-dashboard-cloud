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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] });
    }

    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection('User').find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: new ObjectId(user.userId) },
    }).project({ _id: 1, username: 1, profilePicture: 1 }).limit(10).toArray();

    const mappedUsers = users.map(u => ({ 
      id: u._id.toString(), 
      username: u.username,
      profilePicture: u.profilePicture || null 
    }));

    return NextResponse.json({ users: mappedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
