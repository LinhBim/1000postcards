'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { getLanguageFontClass, getBodyLanguageFontClass } from '@/lib/utils';
import FlipImage from '@/components/FlipImage';
import styles from './page.module.css';

const FeelingAnimation = () => {
  const letters = ['F', 'e', 'e', 'l', 'i', 'n', 'g'];
  
  const formedPositions = [
    { x: -75, y: -10, rotate: -15 },
    { x: -50, y: -20, rotate: -10 },
    { x: -25, y: -25, rotate: -5 },
    { x: 0, y: -28, rotate: 0 },
    { x: 25, y: -25, rotate: 5 },
    { x: 50, y: -20, rotate: 10 },
    { x: 75, y: -10, rotate: 15 },
  ];

  const edges = [
    [ {x: -120, y: -40}, {x: 120, y: 40}, {x: -30, y: -130} ],
    [ {x: 40, y: -120}, {x: -40, y: 120}, {x: 120, y: -40} ],
    [ {x: 120, y: 30}, {x: -120, y: -30}, {x: 30, y: 120} ],
    [ {x: 80, y: 100}, {x: -80, y: -100}, {x: -120, y: 40} ],
    [ {x: -50, y: 120}, {x: 50, y: -120}, {x: -100, y: -80} ],
    [ {x: -120, y: 50}, {x: 120, y: -50}, {x: 80, y: -100} ],
    [ {x: -60, y: -110}, {x: 60, y: 110}, {x: 100, y: 80} ]
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          style={{ position: 'absolute', fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}
          animate={{
            x: [
              formedPositions[i].x, formedPositions[i].x, 
              edges[i][0].x, edges[i][1].x, 
              formedPositions[i].x, formedPositions[i].x, 
              edges[i][2].x, 
              formedPositions[i].x, formedPositions[i].x
            ],
            y: [
              formedPositions[i].y, formedPositions[i].y, 
              edges[i][0].y, edges[i][1].y, 
              formedPositions[i].y, formedPositions[i].y, 
              edges[i][2].y, 
              formedPositions[i].y, formedPositions[i].y
            ],
            rotate: [
              formedPositions[i].rotate, formedPositions[i].rotate, 
              edges[i][0].x, edges[i][1].y, 
              formedPositions[i].rotate, formedPositions[i].rotate, 
              edges[i][2].x, 
              formedPositions[i].rotate, formedPositions[i].rotate
            ]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.15, 0.25, 0.40, 0.50, 0.65, 0.75, 0.85, 1]
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
};

const ClickTheVibe = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1' }}>
    <span>CLICK THE</span>
    <span>VIBE !</span>
  </div>
);

const ClickAnotherVibe = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1', paddingLeft: '15px' }}>
    <span>CLICK</span>
    <span>ANOTHER</span>
    <span>VIBE !</span>
  </div>
);

const DraggablePostcard = ({ post, t, i, containerRef, vibeButtonRef, isDragging, setIsDragging, setPreviewPost }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [win, setWin] = useState({ w: 1000, h: 800 });

  useEffect(() => {
    setWin({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const vibeButton = vibeButtonRef.current;
    if (!container || !vibeButton) return;
    const H = container.clientHeight;
    const W = container.clientWidth;
    
    const initialX = (W / 2) + (t.x / 100 * win.w);
    const initialY = (H / 2) + 25 + (t.y / 100 * win.h);
    
    x.set(0);
    y.set(0);
    
  }, [win, t, containerRef, vibeButtonRef, x, y]);

  return (
    <motion.div
      key={`${post.slug}-${t.bumpKey}`}
      id={`card-${post.slug}`}
      drag
      dragConstraints={containerRef}
      dragElastic={0}
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 150);
      }}
      style={{
        x,
        y,
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
      <div 
        className={styles.item} 
        onClick={(e) => {
          if (isDragging) return;
          setPreviewPost(post);
        }}
        style={{ cursor: 'pointer' }}
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
          <span className={`${styles.overlayText} ${getBodyLanguageFontClass(post.content || '')}`}>Preview</span>
        </div>
      </div>
      
    </motion.div>
  );
};

export default function HomeClient({ postcards }: { postcards: any[] }) {
  const VIBES = Array.from(new Set(postcards.flatMap(p => {
    if (Array.isArray(p.vibe)) return p.vibe;
    if (typeof p.vibe === 'string') return [p.vibe];
    return [];
  }))).filter(Boolean);
  
  const [currentVibe, setCurrentVibe] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayedCards, setDisplayedCards] = useState<any[]>([]);
  const [shownCardsByVibe, setShownCardsByVibe] = useState<Record<string, string[]>>({});
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'scattered' | 'ordered'>('scattered');
  const [transforms, setTransforms] = useState<any[]>([]);
  const [pickCount, setPickCount] = useState(0);
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [consecutivePicks, setConsecutivePicks] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const vibeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClickVibe = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLayoutMode('scattered');
    
    setTimeout(() => {
      let nextVibe;
      do {
        nextVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
      } while (nextVibe === currentVibe && VIBES.length > 1);
      
      setCurrentVibe(nextVibe);
      const allCardsForVibe = postcards.filter(p => Array.isArray(p.vibe) ? p.vibe.includes(nextVibe) : p.vibe === nextVibe);
      let previouslyShown = shownCardsByVibe[nextVibe] || [];
      
      let unseenCards = allCardsForVibe.filter(p => !previouslyShown.includes(p.slug));
      
      // If all cards have been seen, reset the pool
      if (unseenCards.length === 0) {
        unseenCards = [...allCardsForVibe];
        previouslyShown = [];
      }
      
      const countToPick = Math.min(12, unseenCards.length);
      const shuffledUnseen = [...unseenCards].sort(() => Math.random() - 0.5);
      const cardsToPick = shuffledUnseen.slice(0, countToPick);
      
      setShownCardsByVibe(prev => ({ 
        ...prev, 
        [nextVibe]: [...previouslyShown, ...cardsToPick.map(c => c.slug)] 
      }));
      
      setDisplayedCards(cardsToPick);
      setHasStarted(true);
      setIsSpinning(false);
    }, 1500);
  };

  useEffect(() => {
    if (displayedCards.length > 0) {
      const newTransforms = displayedCards.map((_, index) => {
        let xOffset = 0;
        let yOffset = 0;
        
        let isValid = false;
        while (!isValid) {
          xOffset = Math.random() * 90 - 45; 
          yOffset = Math.random() * 80 - 35; 
          
          const inExclusionZone = (xOffset > -22 && xOffset < 22) && (yOffset < 15);
          if (!inExclusionZone) isValid = true;
        }
        
        if (index === 0) {
          xOffset = Math.random() * 15 - 35; 
          yOffset = Math.random() * 15 - 25; 
        } else if (index === 1) {
          xOffset = Math.random() * 15 + 20; 
          yOffset = Math.random() * 15 - 25; 
        }

        return {
          x: xOffset,
          y: yOffset,
          rotate: Math.random() * 60 - 30,
          bumpKey: 0
        };
      });
      setTransforms(newTransforms);
    }
  }, [currentVibe]);

  const handlePickAnother = () => {
    if (!previewPost) return;
    
    if (pickCount >= 2) {
      const writtenPosts = postcards.filter(p => p.status !== 'public');
      if (writtenPosts.length > 0) {
        const randomPost = writtenPosts[Math.floor(Math.random() * writtenPosts.length)];
        setPreviewPost(randomPost);
      } else {
        const randomPost = postcards[Math.floor(Math.random() * postcards.length)];
        setPreviewPost(randomPost);
      }
      setPickCount(0);
    } else {
      const otherPosts = postcards.filter(p => p.slug !== previewPost.slug);
      if (otherPosts.length > 0) {
        const randomPost = otherPosts[Math.floor(Math.random() * otherPosts.length)];
        setPreviewPost(randomPost);
        if (randomPost.status === 'public') {
          setPickCount(prev => prev + 1);
        } else {
          setPickCount(0);
        }
      }
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={styles.homeWrapper} style={{ pointerEvents: 'none' }}>
      <motion.div 
        className={styles.vibeSection}
        style={{ position: 'relative', zIndex: 100, pointerEvents: 'none' }}
        animate={{ marginTop: hasStarted ? 16 : 64, marginBottom: 16 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <motion.div
          animate={{ height: hasStarted ? 260 : 500 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', pointerEvents: 'none' }}
        >
          <motion.button 
            ref={vibeButtonRef}
            className={`${styles.vibeButton} ${isSpinning ? styles.spinning : ''}`}
            style={{ pointerEvents: 'auto' }}
            onClick={handleClickVibe}
            animate={{ scale: hasStarted ? 0.52 : 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <div className={styles.vibeButtonBorder}></div>
            <div className={styles.vibeTextWrapper}>
              <span className={styles.vibeText}>
                {isSpinning ? <FeelingAnimation /> : (hasStarted ? <ClickAnotherVibe /> : <ClickTheVibe />)}
              </span>
            </div>
          </motion.button>
        </motion.div>
        
        <motion.div 
          className={styles.vibeResultContainer}
          style={{ pointerEvents: 'none' }}
          animate={{ scale: currentVibe ? 0.9 : 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {currentVibe && !isSpinning && (
            <h2 className={styles.vibeResult}>Vibe: <span>#{currentVibe}</span></h2>
          )}
        </motion.div>
        
        {currentVibe && !isSpinning && displayedCards.length > 0 && (
          <motion.div className={styles.controls} style={{ pointerEvents: 'auto' }}>
            <button 
              className={styles.controlBtn}
              onClick={() => setLayoutMode(layoutMode === 'scattered' ? 'ordered' : 'scattered')}
            >
              {layoutMode === 'scattered' ? 'Make it organized' : 'Shuffle'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {displayedCards.length > 0 && !isSpinning && (
        <>
          {layoutMode === 'scattered' ? (
            <div className={styles.scatteredContainer} ref={containerRef}>
              <AnimatePresence>
                {displayedCards.map((post, i) => (
                  <DraggablePostcard 
                    key={post.slug}
                    post={post}
                    t={transforms[i] || { x: 0, y: 0, rotate: 0, bumpKey: 0 }}
                    i={i}
                    containerRef={containerRef}
                    vibeButtonRef={vibeButtonRef}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    setPreviewPost={setPreviewPost}
                  />
                ))}
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
                {[...displayedCards].sort((a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0)).map((post) => (
                  <div key={post.slug} className={styles.itemWrapper}>
                    <div className={styles.item} onClick={() => setPreviewPost(post)} style={{ cursor: 'pointer' }}>
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
                        <span className={`${styles.overlayText} ${getBodyLanguageFontClass(post.content || '')}`}>Read Story</span>
                      </div>
                    </div>
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

      {/* Preview Popup Modal */}
      <AnimatePresence>
        {previewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalBackdrop}
            onClick={() => setPreviewPost(null)}
            style={{ pointerEvents: 'auto' }}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
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
                <h2 className={`${styles.modalTitle} ${getLanguageFontClass(previewPost.title)}`}>{previewPost.title}</h2>
                <div className={`${styles.modalExcerpt} ${getBodyLanguageFontClass(previewPost.excerpt || '')}`}>
                  {previewPost.excerpt || `*Postcard No. ${previewPost.number} is waiting to be written...*`}
                </div>
                {previewPost.status !== 'public' ? (
                  <Link 
                    href={`/blog/${previewPost.slug}`} 
                    className={styles.modalButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </Link>
                ) : (
                  <button onClick={handlePickAnother} className={styles.modalButton}>
                    Pick another one
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
