'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function HomeClient({ postcards }: { postcards: any[] }) {
  // Tự động thu thập toàn bộ các tag độc nhất từ tất cả postcards
  const VIBES = Array.from(new Set(postcards.flatMap(p => {
    if (Array.isArray(p.vibe)) return p.vibe;
    if (typeof p.vibe === 'string') return [p.vibe];
    return [];
  }))).filter(Boolean);
  const [currentVibe, setCurrentVibe] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'scattered' | 'ordered'>('scattered');
  const [transforms, setTransforms] = useState<{x: number, y: number, rotate: number}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickVibe = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCurrentVibe(null);
    setLayoutMode('scattered');
    
    setTimeout(() => {
      let nextVibe;
      do {
        nextVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
      } while (nextVibe === currentVibe && VIBES.length > 1);
      
      setCurrentVibe(nextVibe);
      setIsSpinning(false);
    }, 1500);
  };

  const displayedCards = currentVibe 
    ? postcards.filter(p => Array.isArray(p.vibe) ? p.vibe.includes(currentVibe) : p.vibe === currentVibe) 
    : [];

  useEffect(() => {
    if (displayedCards.length > 0) {
      // Generate random transforms for scattered layout
      const newTransforms = displayedCards.map(() => {
        return {
          x: Math.random() * 60 - 30, // -30vw to 30vw from center
          y: Math.random() * 50 - 25, // -25vh to 25vh from center
          rotate: Math.random() * 60 - 30, // -30 to 30 degrees
        };
      });
      setTransforms(newTransforms);
    }
  }, [currentVibe]);

  // Handle preventing click navigation if we were dragging
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={styles.homeWrapper}>
      <div className={styles.vibeSection}>
        <button 
          className={`${styles.vibeButton} ${isSpinning ? styles.spinning : ''}`}
          onClick={handleClickVibe}
        >
          <div className={styles.vibeTextWrapper}>
            <span className={styles.vibeText}>
              {isSpinning ? 'Feeling...' : (currentVibe ? 'Click another vibe' : 'Click the Vibe')}
            </span>
          </div>
        </button>
        <div className={styles.vibeResultContainer}>
          {currentVibe && !isSpinning && (
            <h2 className={styles.vibeResult}>Vibe: <span>#{currentVibe}</span></h2>
          )}
        </div>
        
        {currentVibe && !isSpinning && displayedCards.length > 0 && (
          <div className={styles.controls}>
            <button 
              className={styles.controlBtn}
              onClick={() => setLayoutMode(layoutMode === 'scattered' ? 'ordered' : 'scattered')}
            >
              {layoutMode === 'scattered' ? 'Make it organized' : 'Shuffle'}
            </button>
          </div>
        )}
      </div>

      {displayedCards.length > 0 && !isSpinning && (
        <>
          {layoutMode === 'scattered' ? (
            <div className={styles.scatteredContainer} ref={containerRef}>
              <AnimatePresence>
                {displayedCards.map((post, i) => {
                  const t = transforms[i] || { x: 0, y: 0, rotate: 0 };
                  
                  return (
                    <motion.div
                      key={post.slug}
                      drag
                      whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={() => {
                        setTimeout(() => setIsDragging(false), 150);
                      }}
                      style={{
                        left: `calc(50% - 125px + ${t.x}vw)`,
                        top: `calc(50% - 150px + ${t.y}vh)`
                      }}
                      initial={{ opacity: 0, scale: 0.5, rotate: t.rotate }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: t.rotate,
                        zIndex: i + 10
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className={styles.scatteredItemWrapper}
                    >
                      <Link 
                        href={`/blog/${post.slug}`} 
                        className={styles.item} 
                        onClick={(e) => {
                          if (isDragging) e.preventDefault();
                        }}
                        draggable={false}
                      >
                        <Image 
                          src={post.coverImage} 
                          alt={post.title} 
                          width={600} 
                          height={800} 
                          className={styles.image}
                          style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
                          unoptimized
                        />
                        <div className={styles.overlay}>
                          <span className={styles.overlayText}>Read Story</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              className={styles.fullWidthContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.masonry}>
                {displayedCards.map((post) => (
                  <div key={post.slug} className={styles.itemWrapper}>
                    <Link href={`/blog/${post.slug}`} className={styles.item}>
                      <Image 
                        src={post.coverImage} 
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
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
      
      {displayedCards.length === 0 && currentVibe && !isSpinning && (
        <p className={styles.noResults}>No postcards found for this vibe yet.</p>
      )}
    </div>
  );
}
