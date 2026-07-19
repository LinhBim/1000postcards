import type { Metadata } from 'next';
import { Inter, Playfair_Display, Architects_Daughter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import layoutStyles from './layout.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const architectsDaughter = Architects_Daughter({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-handwriting' 
});

export const metadata: Metadata = {
  title: 'Postcards & Memories',
  description: 'A personal art gallery and journal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${architectsDaughter.variable}`}>
        <header className={layoutStyles.header}>
          <div className={`container ${layoutStyles.headerContent}`}>
            <Link href="/" className={layoutStyles.logo}>
              Postcards.
            </Link>
            <nav className={layoutStyles.nav}>
              <Link href="/">Home</Link>
              <Link href="/archives">Archives</Link>
              <Link href="/blog">Behind The Postcards</Link>
            </nav>
          </div>
        </header>
        <main className={layoutStyles.main}>
          {children}
        </main>
        <footer className={layoutStyles.footer}>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Postcards & Memories. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
