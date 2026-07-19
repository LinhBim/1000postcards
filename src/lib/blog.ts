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
  number: string | null;
  vibe: string[];
};

export function getBlogPosts(): BlogPost[] {
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
      const isPostcard = /^\d+\s*\|/.test(title);
      
      const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
      const coverImage = imgMatch ? imgMatch[1] : null;
      
      let number = null;
      let vibe: string[] = [];

      if (data.vibe) {
        if (Array.isArray(data.vibe)) {
          vibe = data.vibe;
        } else if (typeof data.vibe === 'string') {
          vibe = data.vibe.split(',').map(v => v.trim()).filter(Boolean);
        }
      }

      if (isPostcard) {
        const numMatch = title.match(/^(\d+)\s*\|/);
        if (numMatch) {
          number = numMatch[1];
        }
        
        // Cấp tag mặc định nếu file chưa ghi tag
        if (vibe.length === 0) {
          const vibes = ['breathing', 'colorful', 'fun'];
          vibe = [vibes[index % vibes.length]];
        }
      }

      return {
        slug: data.slug || file.replace('.md', ''),
        title: title,
        date: data.date || '2019-01-01',
        content,
        isPostcard,
        coverImage,
        number,
        vibe,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find(post => post.slug === slug);
}
