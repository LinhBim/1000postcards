'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { getLanguageFontClass } from '@/lib/utils';

type Post = {
  slug: string;
  title: string;
  coverImage?: string | null;
  titleFont?: string;
  [key: string]: any;
};

type Props = {
  enPosts: Post[];
  viPosts: Post[];
  frPosts: Post[];
};

export default function BlogTabs({ enPosts, viPosts, frPosts }: Props) {
  const [activeTab, setActiveTab] = useState<'en' | 'vi' | 'fr'>('en');

  const tabs = [
    { id: 'en', label: 'English', shortLabel: 'Eng.', posts: enPosts },
    { id: 'vi', label: 'Vietnamese', shortLabel: 'Vie.', posts: viPosts },
    { id: 'fr', label: 'French', shortLabel: 'Fr.', posts: frPosts },
  ].filter(tab => tab.posts.length > 0);

  // If active tab has no posts, switch to the first available tab
  if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
    setActiveTab(tabs[0].id as any);
  }

  const activePosts = tabs.find(t => t.id === activeTab)?.posts || [];

  return (
    <div>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className={styles.desktopLabel}>{tab.label}</span>
            <span className={styles.mobileLabel}>{tab.shortLabel}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.gridContainer}>
        {activePosts.map((post, index) => {
          const stampImages = ['_Image28.png', '_Image29.png', '_Image30.png'];
          const stampUrl = `/images/ui/${stampImages[index % stampImages.length]}`;
          
          return (
            <div key={post.slug} className={styles.itemWrapper}>
              <Link href={`/blog/${post.slug}`} target="_blank" className={styles.card}>
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
                <div 
                  className={styles.stampOverlay} 
                  style={{ backgroundImage: `url(${stampUrl})` }}
                />
                <div className={`${styles.cardContent} ${getLanguageFontClass(post.title, post.titleFont)}`}>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
