'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './MessageModal.module.css';

interface MessageModalProps {
  onClose: () => void;
  web3FormsKey?: string;
}

export default function MessageModal({ onClose, web3FormsKey }: MessageModalProps) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    try {
      // 1. Save to database via our API
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, email }),
      });

      if (!res.ok) {
        throw new Error('Failed to save message');
      }

      // 2. Send email via Web3Forms directly from the browser
      if (web3FormsKey) {
        const fallbackEmail = email.trim() ? email : 'noreply@1000postcards.vercel.app';
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: web3FormsKey,
            subject: 'New Message from Postcards Web',
            from_name: 'Postcards Web System',
            email: fallbackEmail,
            message: `You have received a new message!\n\nFrom: ${fallbackEmail}\n\nMessage:\n${message}`
          })
        }).catch(err => console.error('Web3Forms email error:', err));
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong');
    }
  };

  return (
    <div className={`${styles.overlay} font-jost`} onClick={onClose}>
      <motion.div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        {status === 'success' ? (
          <div className={styles.successState}>
            <h3>Message Sent!</h3>
            <p>Thank you for writing to me.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.title}>Send me a message</h3>
            
            <div className={styles.inputGroup}>
              <label htmlFor="message">Message *</label>
              <textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email (optional)</label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Leave your email if you want a reply"
                className={styles.input}
              />
            </div>

            {status === 'error' && (
              <div className={styles.error}>{errorMsg}</div>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status === 'loading' || !message.trim()}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
