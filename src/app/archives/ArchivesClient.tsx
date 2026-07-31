'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { getLanguageFontClass, getBodyLanguageFontClass } from '@/lib/utils';
import FlipImage from '@/components/FlipImage';

export default function ArchivesClient({ postcards, allVibes = [] }: { postcards: any[], allVibes?: string[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [consecutivePicks, setConsecutivePicks] = useState(0);
  const [shuffledVibes, setShuffledVibes] = useState([...allVibes]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleBlobClick = () => {
    const newShuffled = [...allVibes].sort(() => Math.random() - 0.5);
    setShuffledVibes(newShuffled);
  };

  useEffect(() => {
    const handleShuffle = () => {
      const newShuffled = [...allVibes].sort(() => Math.random() - 0.5);
      setShuffledVibes(newShuffled);
    };
    
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('shuffleVibes', handleShuffle);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('shuffleVibes', handleShuffle);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [allVibes]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePickAnotherOne = () => {
    const publishedOnly = postcards.filter(p => p.status === 'published');
    const allAvailable = postcards;
    
    let chosenPost = null;
    if (consecutivePicks >= 2 && publishedOnly.length > 0) {
      chosenPost = publishedOnly[Math.floor(Math.random() * publishedOnly.length)];
      setConsecutivePicks(0);
    } else {
      chosenPost = allAvailable[Math.floor(Math.random() * allAvailable.length)];
      if (chosenPost.status === 'public') {
        setConsecutivePicks(prev => prev + 1);
      } else {
        setConsecutivePicks(0);
      }
    }
    setPreviewPost(chosenPost);
  };

  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredPostcards = postcards.filter((post) => {
    if (!searchQuery) return true;
    
    const query = removeAccents(searchQuery.toLowerCase());
    
    // Tìm theo số
    if (post.number && post.number.includes(query)) return true;
    
    // Tìm theo title
    if (post.title && removeAccents(post.title.toLowerCase()).includes(query)) return true;
    
    // Tìm theo vibe
    if (post.vibe) {
      if (Array.isArray(post.vibe)) {
        return post.vibe.some((v: string) => removeAccents(v.toLowerCase()).includes(query));
      } else if (typeof post.vibe === 'string') {
        return removeAccents(post.vibe.toLowerCase()).includes(query);
      }
    }
    
    return false;
  });

  return (
    <>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.archivesPathWrapper}>
            <div className={styles.archivesPath}></div>
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={styles.archivesPathSvg} style={{ overflow: 'visible' }}>
              <path id="wavyPath" d="M 20.0 61.7 Q 39.9 66.6, 49.9 66.5 Q 59.9 66.5, 69.8 70.3 Q 79.8 74.0, 89.8 71.2 Q 99.8 68.4, 109.8 67.1 Q 119.7 65.7, 129.7 64.8 Q 139.7 64.0, 149.6 62.3 Q 159.6 60.5, 169.6 61.2 Q 179.6 61.8, 189.6 58.9 Q 199.5 56.0, 209.5 54.9 Q 219.5 53.8, 229.4 51.1 Q 239.4 48.4, 249.4 46.6 Q 259.4 44.8, 269.4 42.6 Q 279.3 40.4, 289.3 38.0 Q 299.3 35.7, 309.3 33.0 Q 319.3 30.2, 329.3 26.9 Q 339.2 23.6, 349.2 20.3 Q 359.2 17.0, 369.1 15.0 Q 379.1 13.0, 389.1 11.6 Q 399.1 10.3, 409.1 7.1 Q 419.0 4.0, 429.0 0.9 Q 439.0 -2.3, 448.9 -3.2 Q 458.9 -4.2, 468.9 -6.6 Q 478.9 -8.9, 488.9 -9.1 Q 498.8 -9.3, 508.8 -8.1 Q 518.8 -6.9, 528.8 -3.9 Q 538.7 -0.9, 548.7 2.5 Q 558.7 5.9, 568.7 9.4 Q 578.6 12.9, 588.6 17.8 Q 598.6 22.8, 608.6 26.6 Q 618.6 30.5, 628.5 34.8 Q 638.5 39.1, 648.5 42.4 Q 658.5 45.7, 668.5 48.7 Q 678.4 51.7, 688.4 53.1 Q 698.4 54.5, 708.3 57.7 Q 718.3 60.9, 728.3 64.3 Q 738.3 67.6, 748.3 66.8 Q 758.2 66.1, 778.2 64.3 Q 798.1 62.6, 808.1 62.8 Q 818.1 62.9, 828.0 63.1 Q 838.0 63.3, 848.0 61.7 Q 858.0 60.1, 868.0 58.0 Q 877.9 56.0, 887.9 55.3 Q 897.9 54.5, 907.9 52.7 Q 917.9 50.8, 927.8 50.3 Q 937.8 49.8, 947.8 45.8 Q 957.8 41.7, 967.8 41.0 Q 977.7 40.3, 987.7 36.9 T 997.7 33.5" fill="transparent" />
              <text fill="var(--accent-color)" fontSize="14" fontFamily="var(--font-heading)" letterSpacing="2">
                <textPath href="#wavyPath" startOffset="0%" dy="0">
                  {Array(10).fill(shuffledVibes).flat().map((vibe, i) => (
                    <tspan 
                      key={`${vibe}-${i}`} 
                      onClick={() => setSearchQuery(vibe)}
                      style={{ cursor: 'pointer' }}
                    >
                      {vibe}
                      {'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                    </tspan>
                  ))}
                </textPath>
              </text>
            </svg>
          </div>
          <h1 className={styles.title}>Archives</h1>
        </div>
        <div className={styles.blobWrapper} onClick={handleBlobClick} style={{ cursor: 'pointer', position: 'absolute' }}>
          <Image 
            src="/images/ui/_Image4.png" 
            alt="Background Blob"
            fill
            className={styles.blobImage}
            unoptimized
          />
          <svg viewBox="0 0 120 120" className={styles.blobSvg} style={{ overflow: 'visible' }}>
            <path id="blobCurve" d="M -15 60 A 75 75 0 0 1 135 60" fill="transparent" />
            <text fill="#e45d35" fontSize="32" fontWeight="800" letterSpacing="6" fontFamily="var(--font-heading)">
              <textPath href="#blobCurve" startOffset="50%" textAnchor="middle">
                V i b e
              </textPath>
            </text>
          </svg>
        </div>
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

      <div className={styles.fullWidthContainer}>
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
              {post.status === 'published' ? (
                <div 
                  className={styles.item}
                  onClick={() => setPreviewPost(post)}
                  style={{ cursor: 'pointer' }}
                >
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
                    <span className={`${styles.overlayText} ${getBodyLanguageFontClass(post.content || '')}`}>Preview</span>
                  </div>
                </div>
              ) : (
                <div 
                  className={styles.item}
                  onClick={() => setPreviewPost(post)}
                  style={{ cursor: 'pointer' }}
                >
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
                    <span className={`${styles.overlayText} ${getBodyLanguageFontClass(post.content || '')}`}>Preview</span>
                  </div>
                </div>
              )}
              {post.number && (
                <div className={styles.cardNumber}>
                  <span>No. {post.number}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        </div>
      </div>
      
      {filteredPostcards.length === 0 && (
        <p className={styles.noResults}>No postcards match your search.</p>
      )}

      {/* Preview Popup Modal */}
      <AnimatePresence>
        {previewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalBackdrop}
            onClick={() => setPreviewPost(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeButton} onClick={() => setPreviewPost(null)}>×</button>
              
              <div className={styles.modalImageContainer}>
                <FlipImage 
                  frontSrc={previewPost.coverImage} 
                  backSrc={previewPost.backImage}
                  alt={previewPost.title} 
                  fill
                  className={styles.modalImage}
                />
              </div>
              
              <div className={styles.modalTextContainer}>
                <h2 className={`${styles.modalTitle} ${getLanguageFontClass(previewPost.title, previewPost.titleFont)}`}>{previewPost.title}</h2>
                <p className={`${styles.modalExcerpt} ${getBodyLanguageFontClass(previewPost.content || '')}`}>{previewPost.excerpt || "Waiting to be written..."}</p>
                
                {previewPost.status === 'published' ? (
                  <Link href={`/blog/${previewPost.slug}`} target="_blank" className={styles.modalButton}>
                    Read more
                  </Link>
                ) : (
                  <button onClick={handlePickAnotherOne} className={styles.modalButton}>
                    Pick another one
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className={styles.scrollTopButton}
            title="Back to top"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.1em', marginTop: '-4px' }}>N</span>
              <svg width="20" height="40" viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                <path d="M12 2L2 46L12 36V2Z" fill="currentColor" stroke="none"/>
                <path d="M12 2L22 46L12 36V2Z" fill="none"/>
              </svg>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
