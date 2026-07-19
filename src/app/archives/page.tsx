
import { getBlogPosts } from '@/lib/blog';
import ArchivesClient from './ArchivesClient';

export default function Archives() {
  const allPosts = getBlogPosts();
  const postcards = allPosts.filter(post => post.isPostcard && post.coverImage);
  
  postcards.sort((a, b) => {
    const numA = a.number ? parseInt(a.number, 10) : 0;
    const numB = b.number ? parseInt(b.number, 10) : 0;
    return numB - numA;
  });

  return (
    <ArchivesClient postcards={postcards} />
  );
}
