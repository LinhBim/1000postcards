import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await getBlogPosts({ includeLocked: true });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, content, date, isPostcard, coverImage, backImage, vibe, language, titleFont, status, isLocked } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Missing slug or title' }, { status: 400 });
    }

    await connectToDatabase();

    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return NextResponse.json({ error: 'Post with this slug already exists' }, { status: 400 });
    }

    // Clean content
    let finalContent = content.replace(/&nbsp;/g, ' ').replace(/\xA0/g, ' ');

    const newPost = new Post({
      slug,
      title,
      content: finalContent,
      date: date || new Date().toISOString().split('T')[0],
      vibe: vibe || [],
      language: language || 'auto',
      titleFont: titleFont || 'auto',
      status: status || 'published',
      isPostcard: isPostcard !== undefined ? isPostcard : true,
      isLocked: isLocked === true,
      coverImage: coverImage || null,
      backImage: backImage || null
    });

    await newPost.save();

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
