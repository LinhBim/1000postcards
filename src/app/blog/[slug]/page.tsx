import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Lọc lấy các bài postcard khác với bài hiện tại
  const allPostcards = posts.filter(p => p.isPostcard && p.slug !== post.slug && p.coverImage);
  
  // Tách ra 2 mảng: cùng vibe và khác vibe
  const sameVibe = allPostcards.filter(p => p.vibe === post.vibe);
  const otherVibe = allPostcards.filter(p => p.vibe !== post.vibe);

  // Hàm đảo ngẫu nhiên mảng
  const shuffle = (array: any[]) => [...array].sort(() => 0.5 - Math.random());

  // Lấy ngẫu nhiên tối đa 5 bài cùng vibe
  const shuffledSameVibe = shuffle(sameVibe);
  let suggestions = shuffledSameVibe.slice(0, 5);

  // Nếu thiếu thì lấy thêm các bài khác vibe bù vào
  if (suggestions.length < 5) {
    const shuffledOtherVibe = shuffle(otherVibe);
    suggestions = [...suggestions, ...shuffledOtherVibe.slice(0, 5 - suggestions.length)];
  }

  // Nếu là Postcard, loại bỏ hình ảnh đầu tiên khỏi nội dung (vì nó đã hiển thị to ở nửa trái)
  const contentWithoutCover = post.isPostcard && post.coverImage 
    ? post.content.replace(/!\[.*?\]\(.*?\)/, '') 
    : post.content;

  if (post.isPostcard) {
    return (
      <div className={styles.splitScreen}>
        <div className={styles.leftPane}>
          {post.coverImage && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image 
                src={post.coverImage} 
                alt={post.title} 
                fill
                className={styles.splitImage}
                unoptimized
              />
            </div>
          )}
        </div>
        <div className={styles.rightPane}>
          <div className={styles.handwritingContent}>
            <ReactMarkdown>{contentWithoutCover}</ReactMarkdown>
          </div>

          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h3 className={styles.suggestionsTitle}>More postcards to read</h3>
              <div className={styles.suggestionsGrid}>
                {suggestions.map((s) => (
                  <Link key={s.slug} href={`/blog/${s.slug}`} className={styles.suggestionCard}>
                    <Image 
                      src={s.coverImage} 
                      alt={s.title} 
                      width={300} 
                      height={400} 
                      className={styles.suggestionImage}
                      unoptimized
                    />
                    <div className={styles.suggestionOverlay}>
                      <span>{s.number ? `No. ${s.number}` : 'Read'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className={styles.backAction}>
            <Link href="/archives" className={styles.backLink}>&larr; Back to Archives</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.postWrapper}`}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.date}>{post.date}</p>
        </header>
        <div className={styles.content}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
      <div className={styles.backAction} style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/blog" className={styles.backLink}>&larr; Back to Journal</Link>
      </div>
    </div>
  );
}
