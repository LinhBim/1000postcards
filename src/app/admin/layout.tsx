'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="container" style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '1.15rem' }}>
      <div style={{ padding: '2rem', backgroundColor: '#fff', color: '#333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Admin Dashboard</h1>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/admin" style={{ fontWeight: pathname === '/admin' ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>Posts</Link>
            <Link href="/admin/messages" style={{ fontWeight: pathname.startsWith('/admin/messages') ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>Messages</Link>
            <Link href="/admin/vibes" style={{ fontWeight: pathname.startsWith('/admin/vibes') ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>Vibes</Link>
            <Link href="/admin/about" style={{ fontWeight: pathname.startsWith('/admin/about') ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>About Me</Link>
            <Link href="/admin/analytics" style={{ fontWeight: pathname.startsWith('/admin/analytics') ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>Analytics</Link>
            <Link href="/admin/settings" style={{ fontWeight: pathname.startsWith('/admin/settings') ? 'bold' : 'normal', color: 'inherit', textDecoration: 'none' }}>Settings</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
