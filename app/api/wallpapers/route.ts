import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const wallpapersDir = path.join(process.cwd(), 'public', 'wallpapers');
    if (!fs.existsSync(wallpapersDir)) {
      return NextResponse.json({ backgrounds: [] });
    }
    
    const files = fs.readdirSync(wallpapersDir);
    const backgrounds = files.map(file => {
      const ext = path.extname(file).toLowerCase();
      const type = ['.mp4', '.webm'].includes(ext) ? 'video' : 'image';
      return { type, src: `/wallpapers/${file}`, filename: file };
    });
    
    return NextResponse.json({ backgrounds });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read wallpapers' }, { status: 500 });
  }
}
