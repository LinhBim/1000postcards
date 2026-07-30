import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'postcard' or 'blog'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine target directory
    const targetDir = type === 'blog' 
      ? path.join(process.cwd(), 'public', 'images', 'blog')
      : path.join(process.cwd(), 'public', 'images', 'postcards');
      
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize filename to avoid issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
    const uniqueName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(targetDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = type === 'blog'
      ? `/images/blog/${uniqueName}`
      : `/images/postcards/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
