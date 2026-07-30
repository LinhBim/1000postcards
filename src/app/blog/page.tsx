import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/blog';
import styles from './page.module.css';
import { getLanguageFontClass, detectLanguage } from '@/lib/utils';
import BlogTabs from './BlogTabs';

export const dynamic = 'force-dynamic';

export default async function BlogIndex() {
  const allPosts = getBlogPosts();
  
  // Chỉ hiển thị các bài viết đã Published
  const posts = allPosts.filter(post => post.status === 'published');

  const getLang = (post: typeof posts[0]) => {
    if (post.language && post.language !== 'auto') return post.language;
    return detectLanguage((post.title || '') + ' ' + (post.content || ''));
  };

  const enPosts = posts.filter(post => getLang(post) === 'en');
  const viPosts = posts.filter(post => getLang(post) === 'vi');
  const frPosts = posts.filter(post => getLang(post) === 'fr');

  return (
    <div className={styles.fullWidthContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Behind The Postcards</h1>
        <p className={styles.subtitle}>Thoughts, reflections, and stories behind the postcards.</p>
      </div>

      <BlogTabs enPosts={enPosts} viPosts={viPosts} frPosts={frPosts} />
    </div>
  );
}
