'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type FlipImageProps = {
  frontSrc: string;
  backSrc?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fill?: boolean;
};

export default function FlipImage({ frontSrc, backSrc, alt = 'Postcard Image', className = '', imageClassName = '', fill = false }: FlipImageProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset to front whenever the source changes (e.g. picking another postcard)
  useEffect(() => {
    setIsFlipped(false);
  }, [frontSrc]);

  return (
    <div className={`flip-image-container ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: fill ? '100%' : 'auto' }}>
      {/* 3D Flip Container */}
      <div 
        style={{ 
          perspective: '1000px', 
          width: '100%', 
          height: fill ? '100%' : 'auto',
          position: 'relative',
          flex: fill ? 1 : 'none'
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: fill ? 'absolute' : 'relative',
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div 
            style={{ 
              width: '100%', 
              height: fill ? '100%' : 'auto',
              position: fill ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <img src={frontSrc} alt={`${alt} Front`} className={imageClassName} style={{ width: '100%', height: fill ? '100%' : 'auto', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Back */}
          <div 
            style={{ 
              width: '100%', 
              height: fill ? '100%' : '100%',
              position: 'absolute', 
              top: 0, 
              left: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--postcard-bg)', // Default background for blank back
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: backSrc ? 'none' : '1px solid #eaeaea',
              borderRadius: '4px'
            }}
            className={imageClassName}
          >
            {backSrc ? (
              <img src={backSrc} alt={`${alt} Back`} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
            ) : (
              <span style={{ color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic' }}>
                Blank
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Toggle Button */}
      <div 
        style={{ 
          marginTop: '12px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center', 
        }}
      >
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s',
            padding: '6px 16px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Flip me!
        </button>
      </div>
    </div>
  );
}
