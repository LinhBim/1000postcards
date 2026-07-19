import { getBlogPosts } from '@/lib/blog';
import HomeClient from './HomeClient';

export default function Home() {
  const allPosts = getBlogPosts();
  const postcards = allPosts.filter(post => post.isPostcard && post.coverImage);
  
  // Clean up data before sending to client
  const safePostcards = postcards.map(p => ({
    slug: p.slug,
    title: p.title,
    coverImage: p.coverImage,
    number: p.number,
    vibe: p.vibe
  }));

  return <HomeClient postcards={safePostcards} />;
}
