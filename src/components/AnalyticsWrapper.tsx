'use client';

import { useState, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

type Props = {
  gaId?: string;
};

export default function AnalyticsWrapper({ gaId }: Props) {
  const [consent, setConsent] = useState<'granted' | 'denied' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('cookie_consent');
    if (saved === 'granted' || saved === 'denied') {
      setConsent(saved);
    }
  }, []);

  const handleConsent = (value: 'granted' | 'denied') => {
    localStorage.setItem('cookie_consent', value);
    setConsent(value);
  };

  // Only render banner after mounting to avoid hydration mismatch
  if (!isMounted) return null;

  return (
    <>
      {/* Cần ID GA thật để load, nếu chưa có thì có thể tạm thời ko render hoặc render log */}
      {consent === 'granted' && gaId && <GoogleAnalytics gaId={gaId} />}

      {consent === null && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '90%',
          width: '400px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
            We use cookies to analyze website traffic and optimize your experience. Do you accept?
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => handleConsent('granted')}
              style={{
                background: 'var(--text-color)',
                color: 'var(--bg-color)',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem'
              }}
            >
              Yes
            </button>
            <button 
              onClick={() => handleConsent('denied')}
              style={{
                background: 'transparent',
                color: 'var(--text-color)',
                border: '1px solid var(--text-color)',
                padding: '0.5rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem'
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
}
