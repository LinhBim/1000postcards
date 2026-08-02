import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content', 'blog');

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

export function getBlogPosts({ includeLocked = false }: { includeLocked?: boolean } = {}): BlogPost[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter(file => file.endsWith('.md'))
    .map((file, index) => {
      const fullPath = path.join(contentDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      const title = data.title || 'Untitled';
      const slug = data.slug || file.replace('.md', '');
      const isPostcard = data.isPostcard !== undefined ? data.isPostcard : /^\d+\s*[|-]/.test(title);
      
      if (slug.includes('252') || slug.includes('43')) {
        console.log(`DEBUG POST: ${slug}`);
        console.log(`- title: ${title}`);
        console.log(`- data.isPostcard: ${data.isPostcard}`);
        console.log(`- regex test: ${/^\d+\s*[|-]/.test(title)}`);
        console.log(`- final isPostcard: ${isPostcard}`);
      }
      
      const mdImgMatch = content.match(/!\[.*?\]\((.*?)\)/);
      const htmlImgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      const coverImage = mdImgMatch ? mdImgMatch[1] : (htmlImgMatch ? htmlImgMatch[1] : null);
      
      let number = data.number !== undefined ? String(data.number) : null;
      let vibe: string[] = [];

      if (data.vibe) {
        if (Array.isArray(data.vibe)) {
          vibe = data.vibe;
        } else if (typeof data.vibe === 'string') {
          vibe = data.vibe.split(',').map(v => v.trim()).filter(Boolean);
        }
      }

      if (isPostcard) {
        if (!number) {
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
        
        // Cấp tag mặc định nếu file chưa ghi tag
        if (vibe.length === 0) {
          const vibes = ['breathing', 'colorful', 'fun'];
          vibe = [vibes[index % vibes.length]];
        }
      }

      const fileStats = fs.statSync(fullPath);

      let status: 'published' | 'ready-to-write' | 'draft' | 'public' = 'published' as any;
      if (data.status) {
        status = data.status;
      } else if (data.isDraft) {
        status = 'draft';
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
      
      if (status === 'public' || plainText === '') {
        excerpt = 'Waiting to be written...';
      } else {
        excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
      }

      return {
        slug: slug,
        title: title,
        date: data.date || '2019-01-01',
        content,
        isPostcard,
        coverImage,
        backImage: data.backImage || null,
        number,
        vibe,
        language: data.language || 'auto',
        status: status,
        titleFont: data.titleFont || 'auto',
        isLocked: data.isLocked === true,
        updatedAt: fileStats.mtime.toISOString(),
        excerpt,
      };
    })
    .filter(post => includeLocked || !post.isLocked)
    .sort((a, b) => {
      const numA = a.number ? parseInt(a.number, 10) : null;
      const numB = b.number ? parseInt(b.number, 10) : null;
      
      if (numA !== null && numB !== null) {
        if (numA !== numB) return numB - numA;
      } else if (numA !== null) {
        return -1;
      } else if (numB !== null) {
        return 1;
      }
      
      // Fallback to date sorting if no numbers or numbers are equal
      return a.date < b.date ? 1 : -1;
    });
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find(post => post.slug === slug);
}
