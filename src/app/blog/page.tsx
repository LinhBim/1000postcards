import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/blog';
import styles from './page.module.css';

export default function BlogIndex() {
  const allPosts = getBlogPosts(); // Bỏ filter, gộp chung tất cả các bài viết
  
  // Lọc chỉ giữ lại những bài đã có nội dung (không chứa chuỗi mẫu đang chờ viết)
  const posts = allPosts.filter(post => !post.content.includes('đang chờ được viết...'));

  return (
    <div className={styles.fullWidthContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Behind The Postcards</h1>
        <p className={styles.subtitle}>Thoughts, reflections, and stories behind the postcards.</p>
      </div>

      <div className={styles.gridContainer}>
        {posts.map(post => (
          <div key={post.slug} className={styles.itemWrapper}>
            <Link href={`/blog/${post.slug}`} className={styles.card}>
              {post.coverImage && (
                <div className={styles.cardBgImageWrapper}>
                  <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    fill
                    className={styles.cardBgImage}
                    unoptimized
                  />
                </div>
              )}
              <div className={styles.cardContent}>
                <h2 className={styles.postTitle}>{post.title}</h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
