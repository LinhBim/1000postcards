'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminVibesStatistics() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('count_desc');
  const [expandedVibes, setExpandedVibes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVibe = (vibe: string) => {
    setExpandedVibes(prev => ({
      ...prev,
      [vibe]: !prev[vibe]
    }));
  };

  // Group posts by vibe
  const vibeGroups: Record<string, any[]> = {};
  posts.forEach(post => {
    if (post.vibe && Array.isArray(post.vibe)) {
      post.vibe.forEach((vibe: string) => {
        const cleanVibe = vibe.trim();
        if (cleanVibe) {
          if (!vibeGroups[cleanVibe]) {
            vibeGroups[cleanVibe] = [];
          }
          vibeGroups[cleanVibe].push(post);
        }
      });
    }
  });

  // Convert to array for sorting and filtering
  let vibeList = Object.keys(vibeGroups).map(vibe => ({
    name: vibe,
    count: vibeGroups[vibe].length,
    posts: vibeGroups[vibe]
  }));

  // Filter
  if (search) {
    vibeList = vibeList.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Sort
  vibeList.sort((a, b) => {
    if (sortType === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortType === 'name_desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortType === 'count_desc') {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    }
    if (sortType === 'count_asc') {
      if (a.count !== b.count) return a.count - b.count;
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  if (loading) {
    return <div>Loading vibe statistics...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Vibe Statistics ({vibeList.length} Unique Vibes)</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Search vibes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        
        <select 
          value={sortType} 
          onChange={(e) => setSortType(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="count_desc">Sort: Posts Count (High to Low)</option>
          <option value="count_asc">Sort: Posts Count (Low to High)</option>
          <option value="name_asc">Sort: Alphabetical (A-Z)</option>
          <option value="name_desc">Sort: Alphabetical (Z-A)</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd', width: '50px' }}></th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd', width: '60px' }}>#</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Vibe Tag</th>
            <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Number of Posts</th>
          </tr>
        </thead>
        <tbody>
          {vibeList.map((vibeItem, index) => (
            <React.Fragment key={vibeItem.name}>
              <tr 
                onClick={() => toggleVibe(vibeItem.name)} 
                style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fcfcfc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                  {expandedVibes[vibeItem.name] ? '▼' : '▶'}
                </td>
                <td style={{ padding: '1rem', color: '#888', fontWeight: 'bold' }}>
                  {index + 1}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  #{vibeItem.name}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#eee', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {vibeItem.count} posts
                  </span>
                </td>
              </tr>
              {expandedVibes[vibeItem.name] && (
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td colSpan={4} style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {vibeItem.posts.map(post => (
                        <Link 
                          key={post.slug} 
                          href={`/admin/posts/${post.slug}`}
                          target="_blank"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            padding: '1rem', 
                            background: '#fff', 
                            border: '1px solid #eee', 
                            borderRadius: '8px', 
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {post.coverImage ? (
                            <div style={{ width: '40px', height: '56px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                              <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '40px', height: '56px', flexShrink: 0, borderRadius: '4px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '0.8rem' }}>
                              No Img
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {post.title}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                              {post.isPostcard ? `Postcard No. ${post.number}` : 'Blog Post'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: post.status === 'published' ? '#2e7d32' : '#546e7a', marginTop: '4px', fontWeight: '500' }}>
                              {post.status.toUpperCase()}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {vibeList.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No vibes found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
