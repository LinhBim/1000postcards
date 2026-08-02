import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import { getBlogPosts } from '@/lib/blog';

export async function GET(req: Request) {
  // Simple auth to prevent accidental runs on production
  // We'll just allow it since the user will run it locally
  
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Migration can only be run locally' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    
    // Check if posts already exist to prevent duplicate migrations
    const existingCount = await Post.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Database already contains ${existingCount} posts. Please clear the database if you want to re-run the migration.` 
      });
    }

    // getBlogPosts currently reads from local Markdown files!
    const allMarkdownPosts = getBlogPosts({ includeLocked: true });
    
    let migratedCount = 0;
    const errors = [];

    for (const post of allMarkdownPosts) {
      try {
        // Find cover image from markdown if it exists (first image)
        const mdImgMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
        const htmlImgMatch = post.content.match(/<img.*?src=["'](.*?)["'].*?>/);
        const extractedCoverImage = mdImgMatch ? mdImgMatch[1] : (htmlImgMatch ? htmlImgMatch[1] : undefined);
        
        // Use frontmatter coverImage if available, else extracted
        const finalCoverImage = post.coverImage || extractedCoverImage;

        // Clean content (remove cover image if we extracted it)
        let finalContent = post.content;
        if (mdImgMatch) finalContent = finalContent.replace(mdImgMatch[0], '');
        if (htmlImgMatch) finalContent = finalContent.replace(htmlImgMatch[0], '');

        const newDbPost = new Post({
          slug: post.slug,
          title: post.title,
          content: finalContent.trim(),
          date: post.date,
          vibe: post.vibe || [],
          language: post.language || 'auto',
          titleFont: post.titleFont || 'auto',
          status: post.status || 'published',
          isPostcard: post.isPostcard !== false,
          isLocked: post.isLocked === true,
          coverImage: finalCoverImage,
          backImage: post.backImage
        });

        await newDbPost.save();
        migratedCount++;
      } catch (err: any) {
        console.error(`Error migrating post ${post.slug}:`, err);
        errors.push({ slug: post.slug, error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully migrated ${migratedCount} posts to MongoDB.`,
      errors
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
