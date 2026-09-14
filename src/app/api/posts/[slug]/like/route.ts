import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(MONGODB_URI as string);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectToDatabase();
    
    const post = await Post.findOneAndUpdate(
      { slug: slug },
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
