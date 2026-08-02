import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectToDatabase();
    const post = await Post.findOne({ slug }).lean();
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, date, coverImage, backImage, vibe, language, titleFont, status, isPostcard, isLocked } = body;

    await connectToDatabase();

    const existingPost = await Post.findOne({ slug });
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let finalContent = content.replace(/&nbsp;/g, ' ').replace(/\xA0/g, ' ');

    existingPost.title = title;
    existingPost.content = finalContent;
    if (date) existingPost.date = date;
    if (vibe) existingPost.vibe = vibe;
    if (language) existingPost.language = language;
    if (titleFont) existingPost.titleFont = titleFont;
    if (status) existingPost.status = status;
    if (isPostcard !== undefined) existingPost.isPostcard = isPostcard;
    if (isLocked !== undefined) existingPost.isLocked = isLocked;
    if (coverImage !== undefined) existingPost.coverImage = coverImage;
    if (backImage !== undefined) existingPost.backImage = backImage;

    await existingPost.save();

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    await connectToDatabase();
    
    const result = await Post.findOneAndDelete({ slug });
    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
