import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Setting from '@/models/Setting';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if about content exists in DB
    const aboutSetting = await Setting.findOne({ key: 'about_content' });
    
    if (aboutSetting) {
      return NextResponse.json({ success: true, content: aboutSetting.value });
    }
    
    // Fallback to local markdown file if not found in DB
    const aboutFilePath = path.join(process.cwd(), 'content', 'about.md');
    if (fs.existsSync(aboutFilePath)) {
      const content = fs.readFileSync(aboutFilePath, 'utf8');
      return NextResponse.json({ success: true, content });
    }

    return NextResponse.json({ success: true, content: '' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read about content' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { content } = await request.json();
    
    await connectToDatabase();
    
    await Setting.findOneAndUpdate(
      { key: 'about_content' },
      { value: content },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
  }
}
