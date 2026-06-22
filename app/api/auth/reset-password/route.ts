import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, resetCode, newPassword } = await request.json();

    if (!username || !resetCode || !newPassword) {
      return NextResponse.json({ error: 'Username, reset code, and new password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('User').findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.resetCode || user.resetCode !== resetCode) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
    }

    if (new Date() > new Date(user.resetCodeExpiry)) {
      return NextResponse.json({ error: 'Reset code has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear the reset code
    await db.collection('User').updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetCode: "", resetCodeExpiry: "" }
      }
    );

    return NextResponse.json({ success: true, message: 'Password has been successfully reset!' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
