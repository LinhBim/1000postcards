import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const aboutFilePath = path.join(process.cwd(), 'content', 'about.md');

export async function GET() {
  try {
    if (!fs.existsSync(aboutFilePath)) {
      return NextResponse.json({ success: true, content: '' });
    }
    const content = fs.readFileSync(aboutFilePath, 'utf8');
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read about file' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { content } = await request.json();
    
    const contentDir = path.join(process.cwd(), 'content');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    fs.writeFileSync(aboutFilePath, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update about file' }, { status: 500 });
  }
}
