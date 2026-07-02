
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const record = await db.collection('DashboardStorage').findOne({});
  return NextResponse.json(record);
}
