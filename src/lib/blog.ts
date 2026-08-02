import connectToDatabase from '@/lib/db';
import PostModel from '@/models/Post';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  content: string;
  isPostcard: boolean;
  coverImage: string | null;
  backImage: string | null;
  number: string | null;
  vibe: string[];
  language: string;
  status: 'published' | 'draft' | 'ready-to-write' | 'public';
  titleFont?: string;
  isLocked: boolean;
  updatedAt: string;
  excerpt: string;
};

export async function getBlogPosts({ includeLocked = false }: { includeLocked?: boolean } = {}): Promise<BlogPost[]> {
  try {
    await connectToDatabase();
    
    // Find posts, conditionally filtering by isLocked
    const query = includeLocked ? {} : { isLocked: false };
    const postsFromDb = await PostModel.find(query).sort({ _id: -1 }).lean();

    const posts = postsFromDb.map((post: any) => {
      const slug = post.slug;
      const title = post.title;
      const content = post.content || '';
      const isPostcard = post.isPostcard;
      
      let number = null;
      if (isPostcard) {
        const numMatch = title.match(/^(\d+)\s*[|-]/);
        if (numMatch) {
          number = numMatch[1];
        } else {
          const numMatchSlug = slug.match(/^(\d+)-/);
          if (numMatchSlug) {
            number = numMatchSlug[1];
          }
        }
      }

      // Generate excerpt
      let excerpt = '';
      const plainText = content
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/<[^>]*>?/gm, '') // Remove HTML
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[#*`_~>\[\]\(\)]/g, '') // Remove basic MD chars
        .replace(/\s+/g, ' ')
        .trim();
      
      if (post.status === 'public' || plainText === '') {
        excerpt = 'Waiting to be written...';
      } else {
        excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
      }

      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        content: post.content,
        isPostcard: post.isPostcard,
        coverImage: post.coverImage || null,
        backImage: post.backImage || null,
        number,
        vibe: post.vibe || [],
        language: post.language || 'auto',
        status: post.status || 'published',
        titleFont: post.titleFont || 'auto',
        isLocked: post.isLocked || false,
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : new Date().toISOString(),
        excerpt,
      } as BlogPost;
    });

    // Sort the posts just like we did before
    return posts.sort((a, b) => {
      const numA = a.number ? parseInt(a.number, 10) : null;
      const numB = b.number ? parseInt(b.number, 10) : null;
      
      if (numA !== null && numB !== null) {
        if (numA !== numB) return numB - numA;
      } else if (numA !== null) {
        return -1;
      } else if (numB !== null) {
        return 1;
      }
      
      return a.date < b.date ? 1 : -1;
    });
  } catch (error) {
    console.error('Failed to fetch blog posts from DB:', error);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts({ includeLocked: true });
  return posts.find(post => post.slug === slug);
}
