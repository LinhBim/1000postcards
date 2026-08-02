import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { getLanguageFontClass, getBodyLanguageFontClass } from '@/lib/utils';
import FlipImage from '@/components/FlipImage';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getBlogPosts();
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
  let contentWithoutCover = post.content;
  if (post.isPostcard && post.coverImage) {
    if (contentWithoutCover.includes('<img')) {
      contentWithoutCover = contentWithoutCover.replace(/<p><img[^>]+><\/p>/, '');
      contentWithoutCover = contentWithoutCover.replace(/<img[^>]+>/, '');
    } else {
      contentWithoutCover = contentWithoutCover.replace(/!\[.*?\]\(.*?\)/, '');
    }
  }

  // Tự động detect xem bài viết có dấu không để gán font
  const titleFontClass = getLanguageFontClass(post.title, post.titleFont);
  const bodyFontClass = getBodyLanguageFontClass(post.content || '');

  if (post.isPostcard) {
    return (
      <div className={`${styles.splitScreen} ${bodyFontClass}`}>
        <div className={styles.leftPane}>
          {post.coverImage && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <FlipImage 
                frontSrc={post.coverImage} 
                backSrc={post.backImage}
                alt={post.title} 
                fill
                className={styles.splitImage}
              />
            </div>
          )}
        </div>
        <div className={styles.rightPane}>
          <div className={styles.handwritingContent}>
            <h1 style={{ marginBottom: '1.5rem' }} className={titleFontClass}>
              {post.title}
            </h1>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{contentWithoutCover}</ReactMarkdown>
          </div>

          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h3 className={styles.suggestionsTitle}>More postcards to read</h3>
              <div className={styles.suggestionsGrid}>
                {suggestions.map((s) => (
                  <Link key={s.slug} href={`/blog/${s.slug}`} target="_blank" className={styles.suggestionCard}>
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
    <div className={`container ${styles.postWrapper} ${bodyFontClass}`}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={`${styles.title} ${titleFontClass}`}>{post.title}</h1>
          <p className={styles.date}>{post.date}</p>
        </header>
        <div className={styles.content}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
      </article>
      <div className={styles.backAction} style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/blog" className={styles.backLink}>&larr; Back to Journal</Link>
      </div>
    </div>
  );
}
