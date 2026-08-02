import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary automatically uses CLOUDINARY_URL env var
// cloudinary.config(); // Not strictly needed if CLOUDINARY_URL is present, but good practice
if (process.env.CLOUDINARY_URL) {
  // It automatically picks up the URL
}

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
    
    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    const folderName = type === 'blog' ? 'postcards-blog/blog' : 'postcards-blog/postcards';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '').split('.')[0].toLowerCase();

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: folderName,
      public_id: `${Date.now()}-${sanitizedName}`,
      resource_type: 'auto',
    });

    return NextResponse.json({ success: true, url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file to Cloudinary' }, { status: 500 });
  }
}
