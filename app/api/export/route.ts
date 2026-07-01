import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');
    
    let token = '';
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };

    const client = await clientPromise;
    const db = client.db();

    const record = await db.collection('DashboardStorage').findOne({ userId: decoded.userId });
    
    if (!record) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    let returnedData;
    if (record.data && typeof record.data === 'string') {
      returnedData = JSON.parse(record.data);
    } else {
      const { _id, userId, lastModified, updatedAt, version, displaySettings, generalSettings, ...coreData } = record;
      const reconstructedState = {
        ...coreData,
        ...(displaySettings || {}),
        ...(generalSettings || {})
      };
      
      // Strip stats so users don't think they are backed up and can be modified
      delete reconstructedState.history;
      delete reconstructedState.healthData;
      delete reconstructedState.stopwatchSessions;
      delete reconstructedState.timerLastSavedChunks;
      
      returnedData = { state: reconstructedState, version: version || 2 };
    }
    
    const jsonString = JSON.stringify(returnedData, null, 2);
    
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dashboard-backup-${encodeURIComponent(decoded.username)}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting store:', error);
    return NextResponse.json({ error: 'Failed to export store' }, { status: 500 });
  }
}
