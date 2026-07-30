import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = getBlogPosts({ includeLocked: true });
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

    const contentDir = path.join(process.cwd(), 'content', 'blog');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const filePath = path.join(contentDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post with this slug already exists' }, { status: 400 });
    }

    const frontmatter = {
      title,
      date: date || new Date().toISOString().split('T')[0],
      vibe: vibe || [],
      language: language || 'auto',
      titleFont: titleFont || 'auto',
      status: status || 'published',
      isPostcard: isPostcard !== undefined ? isPostcard : true,
      isLocked: isLocked === true,
      ...(backImage && { backImage })
    };

    // Construct markdown string
    // If it's a postcard, the coverImage must be embedded in the content as the first thing (current design)
    // Actually, our blog logic extracts coverImage from the first `![...](url)` tag.
    let fullContent = content.replace(/&nbsp;/g, ' ').replace(/\xA0/g, ' ');
    if (coverImage) {
      fullContent = `![Cover Image](${coverImage})\n\n${fullContent}`;
    }

    const fileContent = matter.stringify(fullContent, frontmatter);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
