import { getBlogPosts } from '@/lib/blog';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allPosts = await getBlogPosts();
  let postcards = allPosts.filter(post => post.isPostcard && post.coverImage);
  
  // Unconditionally filter out drafts
  postcards = postcards.filter(post => post.status !== 'draft');

  // Lấy toàn bộ vibes (sau khi đã lọc draft)
  const allVibes = Array.from(new Set(postcards.flatMap(p => {
    if (Array.isArray(p.vibe)) return p.vibe;
    if (typeof p.vibe === 'string') return [p.vibe];
    return [];
  }))).filter(Boolean);
  
  // Clean up data before sending to client
  const safePostcards = postcards.map(p => ({
    slug: p.slug,
    title: p.title,
    coverImage: p.coverImage,
    number: p.number,
    vibe: p.vibe,
    status: p.status,
    excerpt: p.excerpt,
    backImage: p.backImage
  }));

  return <HomeClient postcards={safePostcards} allVibes={allVibes} />;
}
