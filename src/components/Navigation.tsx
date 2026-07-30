'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import layoutStyles from '@/app/layout.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/archives', label: 'Archives', active: pathname.startsWith('/archives') },
    { href: '/blog', label: 'Behind The Postcards', active: pathname.startsWith('/blog') },
    { href: '/about', label: 'About', active: pathname.startsWith('/about') },
  ];

  return (
    <nav className={layoutStyles.navWrapper}>
      {/* Desktop Navigation (visible on > 900px) */}
      <div className={layoutStyles.desktopNav}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.active ? layoutStyles.active : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Vibe Button (visible on <= 900px on /archives page) */}
      {pathname.startsWith('/archives') && (
        <button
          className={layoutStyles.mobileVibeButton}
          onClick={() => window.dispatchEvent(new CustomEvent('shuffleVibes'))}
          aria-label="Shuffle Vibes"
          title="Shuffle Vibes"
        >
          <Image 
            src="/images/ui/_Image4.png" 
            alt="Vibe Blob"
            width={45}
            height={45}
            className={layoutStyles.mobileVibeImage}
            unoptimized
          />
          <svg viewBox="0 0 120 120" className={layoutStyles.mobileVibeSvg}>
            <path id="mobileBlobCurve" d="M -15 60 A 75 75 0 0 1 135 60" fill="transparent" />
            <text fill="#e45d35" fontSize="32" fontWeight="800" letterSpacing="6" fontFamily="var(--font-heading)">
              <textPath href="#mobileBlobCurve" startOffset="50%" textAnchor="middle">
                V i b e
              </textPath>
            </text>
          </svg>
        </button>
      )}

      {/* Mobile Hamburger Button (visible on <= 900px) */}
      <button
        className={`${layoutStyles.hamburgerButton} ${isOpen ? layoutStyles.open : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span className={layoutStyles.bar}></span>
        <span className={layoutStyles.bar}></span>
        <span className={layoutStyles.bar}></span>
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className={layoutStyles.mobileDropdown}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.active ? layoutStyles.active : ''}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
