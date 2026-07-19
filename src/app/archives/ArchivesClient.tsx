'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function ArchivesClient({ postcards }: { postcards: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPostcards = postcards.filter((post) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Tìm theo số
    if (post.number && post.number.includes(query)) return true;
    
    // Tìm theo title
    if (post.title && post.title.toLowerCase().includes(query)) return true;
    
    // Tìm theo vibe
    if (post.vibe) {
      if (Array.isArray(post.vibe)) {
        return post.vibe.some((v: string) => v.toLowerCase().includes(query));
      } else if (typeof post.vibe === 'string') {
        return post.vibe.toLowerCase().includes(query);
      }
    }
    
    return false;
  });

  return (
    <div className={styles.fullWidthContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Archives</h1>
        <p className={styles.subtitle}>Click on a postcard to read its hidden story.</p>
        
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search by vibe, number, or title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.masonry}>
        <AnimatePresence>
          {filteredPostcards.map(post => (
            <motion.div 
              key={post.slug} 
              className={styles.itemWrapper}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/blog/${post.slug}`} className={styles.item}>
                <Image 
                  src={post.coverImage!} 
                  alt={post.title} 
                  width={600} 
                  height={800} 
                  className={styles.image}
                  style={{ width: '100%', height: 'auto' }}
                  unoptimized
                />
                <div className={styles.overlay}>
                  <span className={styles.overlayText}>Read Story</span>
                </div>
              </Link>
              {post.number && (
                <div className={styles.cardNumber}>
                  <span>No. {post.number}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredPostcards.length === 0 && (
        <p className={styles.noResults}>No postcards match your search.</p>
      )}
    </div>
  );
}
