'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function AboutAdminPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContent(data.content);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        alert('About page updated!');
      } else {
        alert('Failed to update');
      }
    } catch (err) {
      alert('Error saving about page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit About Me</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        You can use markdown and HTML here. If you want to insert a profile picture, just click the "Insert Image" button in the toolbar.
      </p>
      
      <RichTextEditor value={content} onChange={setContent} />
      
      <button 
        onClick={handleSave} 
        disabled={saving}
        style={{ marginTop: '1.5rem', background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {saving ? 'Saving...' : 'Save About Page'}
      </button>
    </div>
  );
}
