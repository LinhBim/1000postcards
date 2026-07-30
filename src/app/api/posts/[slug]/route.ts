import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { revalidatePath } from 'next/cache';

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, date, coverImage, backImage, vibe, language, titleFont, status, isPostcard, isLocked } = body;

    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
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

    let fullContent = content.replace(/&nbsp;/g, ' ').replace(/\xA0/g, ' ');
    if (coverImage) {
      // Remove any existing cover image pattern at the top
      fullContent = fullContent.replace(/^!\[.*?\]\(.*?\)\n\n?/, '');
      fullContent = `![Cover Image](${coverImage})\n\n${fullContent}`;
    }

    const fileContent = matter.stringify(fullContent, frontmatter);
    fs.writeFileSync(filePath, fileContent, 'utf8');

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
    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
