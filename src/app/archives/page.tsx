import { getBlogPosts } from '@/lib/blog';
import ArchivesClient from './ArchivesClient';

import { cookies } from 'next/headers';

export default async function ArchivesPage() {
  const allPosts = await getBlogPosts();
  let postcards = allPosts.filter(post => post.isPostcard && post.coverImage && post.status !== 'draft');
  
  postcards.sort((a, b) => {
    const numA = a.number ? parseInt(a.number, 10) : 0;
    const numB = b.number ? parseInt(b.number, 10) : 0;
    return numB - numA;
  });

  const safePostcards = postcards.map(p => ({
    slug: p.slug,
    title: p.title,
    coverImage: p.coverImage,
    backImage: p.backImage,
    number: p.number,
    vibe: p.vibe,
    status: p.status,
    excerpt: p.excerpt
  }));

  const allVibes = Array.from(new Set(safePostcards.flatMap(p => {
    if (Array.isArray(p.vibe)) return p.vibe;
    if (typeof p.vibe === 'string') return [p.vibe];
    return [];
  }))).filter(Boolean);

  return (
    <ArchivesClient postcards={safePostcards} allVibes={allVibes} />
  );
}

export const dynamic = 'force-dynamic';

