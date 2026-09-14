'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, blog, postcard, draft, published, written
  const [sortType, setSortType] = useState('number_desc'); // updated_desc, updated_asc, created_desc, created_asc, number_desc
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, sortType]);

  const [totalLikes, setTotalLikes] = useState(0);
  const [newLikesCount, setNewLikesCount] = useState(0);
  const [topLiked, setTopLiked] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
      
      const allLikes = data.posts.reduce((sum: number, p: any) => sum + (p.likes || 0), 0);
      setTotalLikes(allLikes);
      
      const lastViewed = parseInt(localStorage.getItem('adminLastViewedLikes') || '0');
      if (allLikes > lastViewed) {
        setNewLikesCount(allLikes - lastViewed);
      }
      
      const sortedByLikes = [...data.posts]
        .filter(p => p.likes > 0)
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);
      setTopLiked(sortedByLikes);
    }
    setLoading(false);
  };

  const markLikesAsRead = () => {
    localStorage.setItem('adminLastViewedLikes', totalLikes.toString());
    setNewLikesCount(0);
  };

  const deletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      fetchPosts();
    } else {
      alert('Failed to delete');
    }
  };

  // 1. Filter Posts
  let filteredPosts = posts.filter(post => {
    // Search by title or slug
    if (search && !post.title.toLowerCase().includes(search.toLowerCase()) && !post.slug.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Category Filters
    if (filterType === 'blog' && post.isPostcard) return false;
    if (filterType === 'postcard' && !post.isPostcard) return false;
    if (filterType === 'draft' && post.status !== 'draft') return false;
    if (filterType === 'published' && post.status !== 'published') return false;
    if (filterType === 'ready-to-write' && post.status !== 'ready-to-write') return false;

    return true;
  });

  // 2. Sort Posts
  filteredPosts.sort((a, b) => {
    if (sortType === 'updated_desc') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortType === 'updated_asc') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    if (sortType === 'created_desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortType === 'created_asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortType === 'number_desc') {
      const numA = a.number ? parseInt(a.number) : -1;
      const numB = b.number ? parseInt(b.number) : -1;
      if (numA !== numB) return numB - numA; // Descending by number
      // If same number or both are not postcards, sort alphabetically by title
      return a.title.localeCompare(b.title);
    }
    if (sortType === 'likes_desc') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div>Loading...</div>;

  const paginationControls = totalPages > 1 ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem', marginTop: '1rem' }}>
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', border: '1px solid #ddd', background: currentPage === 1 ? '#f5f5f5' : '#fff', color: currentPage === 1 ? '#aaa' : '#333', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px' }}
      >
        Previous
      </button>
      
      <span style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', border: '1px solid #ddd', background: currentPage === totalPages ? '#f5f5f5' : '#fff', color: currentPage === totalPages ? '#aaa' : '#333', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px' }}
      >
        Next
      </button>
    </div>
  ) : null;

  return (
    <div>
      {newLikesCount > 0 && (
        <div style={{ background: 'var(--accent-color)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>❤️ Great news!</strong> You received {newLikesCount} new {newLikesCount === 1 ? 'like' : 'likes'} on your postcards!
          </div>
          <button onClick={markLikesAsRead} style={{ background: '#fff', color: 'var(--accent-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Mark as Read
          </button>
        </div>
      )}

      {/* Like Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#555' }}>Total Likes ❤️</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{totalLikes}</div>
        </div>
        
        {topLiked.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#555' }}>Top Liked Postcards 🏆</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {topLiked.map(p => (
                <li key={p.slug} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Link href={`/admin/posts/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>{p.title}</Link>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>❤️ {p.likes}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>All Posts ({filteredPosts.length})</h2>
        <Link 
          href="/admin/posts/new" 
          style={{ background: 'var(--accent-color)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          + Create New Post
        </Link>
      </div>

      {/* Toolbar: Search, Filter, Sort */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Search by title or slug..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="all">Filter: All Posts</option>
          <option value="blog">Filter: Blog Only</option>
          <option value="postcard">Filter: Postcard Only</option>
          <option value="draft">Filter: Drafts</option>
          <option value="ready-to-write">Filter: Ready to Write</option>
          <option value="published">Filter: Published</option>
        </select>

        <select 
          value={sortType} 
          onChange={(e) => setSortType(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="updated_desc">Sort: Recently Updated</option>
          <option value="updated_asc">Sort: Oldest Updated</option>
          <option value="created_desc">Sort: Recently Created</option>
          <option value="created_asc">Sort: Oldest Created</option>
          <option value="number_desc">Sort: Number (High to Low) + Alphabet</option>
          <option value="likes_desc">Sort: Most Liked</option>
        </select>
      </div>

      {paginationControls}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Title</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Status</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Type</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Likes</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Language</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Date</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPosts.map(post => (
            <tr key={post.slug} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {post.coverImage && (
                  <div style={{ width: '60px', height: '80px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '4px', background: '#eee' }}>
                    <img src={post.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {post.isLocked && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <title>Locked (Hidden from public)</title>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                    {post.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#888' }}>{post.slug}</div>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                {post.status === 'draft' 
                  ? <span style={{ background: '#eceff1', color: '#546e7a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Draft</span> 
                  : post.status === 'ready-to-write'
                  ? <span style={{ background: '#fff3e0', color: '#e65100', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Ready to Write</span>
                  : <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Published</span>}
              </td>
              <td style={{ padding: '1rem' }}>
                {post.isPostcard ? <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Postcard (No. {post.number})</span> : <span style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Standard Blog</span>}
              </td>
              <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {post.likes > 0 ? `❤️ ${post.likes}` : '-'}
              </td>
              <td style={{ padding: '1rem' }}>
                {post.language === 'auto' ? 'Auto' : post.language.toUpperCase()}
              </td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                <div style={{ color: '#555' }}>Created: {post.date}</div>
                <div style={{ color: '#888' }}>Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <Link href={`/admin/posts/${post.slug}`} target="_blank" style={{ marginRight: '1rem', color: 'var(--accent-color)', textDecoration: 'none' }}>Edit</Link>
                <button onClick={() => deletePost(post.slug)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {filteredPosts.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No posts found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {paginationControls}
    </div>
  );
}
