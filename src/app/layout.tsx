import type { Metadata } from 'next';
import { Inter, Playfair_Display, Architects_Daughter, Patrick_Hand, Jost, Montserrat, Gamja_Flower } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import Link from 'next/link';
import layoutStyles from './layout.module.css';
import Navigation from '@/components/Navigation';
import ThemeToggle from '@/components/ThemeToggle';
import AnalyticsWrapper from '@/components/AnalyticsWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const gamjaFlower = Gamja_Flower({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-gamja-flower' 
});
const architectsDaughter = Architects_Daughter({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-handwriting' 
});

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-patrick-hand',
  adjustFontFallback: false,
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-montserrat',
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
      <body className={`${inter.variable} ${playfair.variable} ${architectsDaughter.variable} ${patrickHand.variable} ${jost.variable} ${montserrat.variable} ${gamjaFlower.variable}`}>
        <div style={{ overflowX: 'hidden', width: '100%', position: 'relative' }}>
          <header className={layoutStyles.header}>
            <div className={`container ${layoutStyles.headerContent}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/" className={layoutStyles.logo}>
                  Postcards.
                </Link>
                <ThemeToggle />
              </div>
              <Navigation />
            </div>
          </header>
          <main className={layoutStyles.main}>
            <div className="container">
              {children}
            </div>
          </main>
          <footer className={layoutStyles.footer}>
            <div className="container">
              <p>&copy; {new Date().getFullYear()} Postcards & Memories. All rights reserved.</p>
              <div style={{ marginTop: '1rem' }}>
                <Link href="/admin" className={layoutStyles.adminLink}>admin</Link>
              </div>
            </div>
          </footer>
        </div>
        <AnalyticsWrapper gaId="G-N91FGRJR0X" />
      </body>
    </html>
  );
}
