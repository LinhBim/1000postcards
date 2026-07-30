'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { getLanguageFontClass } from '@/lib/utils';

type Props = {
  initialData?: any;
  isNew?: boolean;
};

export default function PostEditor({ initialData, isNew }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const [slug, setSlug] = useState(initialData?.slug || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isPostcard, setIsPostcard] = useState(initialData?.isPostcard || false);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [backImage, setBackImage] = useState(initialData?.backImage || '');
  const [vibe, setVibe] = useState(initialData?.vibe?.join(', ') || '');
  const [language, setLanguage] = useState(initialData?.language || 'auto');
  const [titleFont, setTitleFont] = useState(initialData?.titleFont || 'auto');
  const [status, setStatus] = useState<'published' | 'ready-to-write' | 'draft'>(initialData?.status || 'published');
  const [isLocked, setIsLocked] = useState(initialData?.isLocked || false);

  useEffect(() => {
    if (initialData?.content && !initialData.content.trim().startsWith('<')) {
      import('marked').then((marked) => {
        setContent(marked.parse(initialData.content) as string);
      });
    }
  }, [initialData]);

  const handleSave = async (submitStatus: 'published' | 'ready-to-write' | 'draft') => {
    if (!title || !slug) {
      alert("Title and Slug are required.");
      return;
    }
    setLoading(true);

    const postData = {
      slug,
      title,
      content,
      date,
      isPostcard,
      coverImage,
      backImage,
      vibe: vibe.split(',').map((v: string) => v.trim()).filter(Boolean),
      language,
      titleFont,
      status: submitStatus,
      isLocked
    };

    const url = isNew ? '/api/posts' : `/api/posts/${initialData.slug}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Saved successfully!');
        router.push('/admin');
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (err) {
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.slug) return;
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${initialData.slug}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully!');
        router.push('/admin');
      } else {
        alert('Failed to delete');
        setLoading(false);
      }
    } catch (err) {
      alert('Error deleting post');
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'postcard');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBack(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'postcard');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setBackImage(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploadingBack(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Title</label>
              <button 
                type="button" 
                onClick={() => setIsLocked(!isLocked)}
                title={isLocked ? "Unlock Post" : "Lock Post (Hide from public)"}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  color: isLocked ? '#c62828' : '#888', fontWeight: 'bold' 
                }}
              >
                {isLocked ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                )}
                {isLocked ? "Locked" : "Unlocked"}
              </button>
            </div>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              style={{ ...inputStyle, fontSize: '1.8rem', padding: '1rem', borderColor: isLocked ? '#ffcdd2' : '#ccc', backgroundColor: isLocked ? '#fff5f5' : '#fff' }} 
              className={getLanguageFontClass(title, titleFont)}
            />
          </div>

          <div>
            <label style={labelStyle}>Content (Markdown / HTML)</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Column: Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
          
          {/* Removed Draft checkbox */}
          <div>
            <label style={labelStyle}>Slug (URL part)</label>
            <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} disabled={!isNew} />
          </div>

          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label><input type="radio" checked={!isPostcard} onChange={() => setIsPostcard(false)} /> Standard Blog</label>
              <label><input type="radio" checked={isPostcard} onChange={() => setIsPostcard(true)} /> Postcard</label>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
              <option value="auto">Auto-detect (Default)</option>
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Title Font</label>
            <select value={titleFont} onChange={e => setTitleFont(e.target.value)} style={inputStyle}>
              <option value="auto">Auto-detect by language (Default)</option>
              <option value="gamja">Gamja Flower (English Default)</option>
              <option value="patrick">Patrick Hand (Vietnamese/French Default)</option>
              <option value="playfair">Playfair Display (Serif)</option>
              <option value="inter">Inter (Sans-serif)</option>
              <option value="architects">Architects Daughter (Handwriting)</option>
              <option value="jost">Jost (Sans-serif)</option>
            </select>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center' }}>
              <span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Live Title Preview:</span>
              <div className={getLanguageFontClass(title, titleFont)} style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                {title || 'Postcard Title'}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Vibe Tags (comma separated)</label>
            <input type="text" value={vibe} onChange={e => setVibe(e.target.value)} placeholder="e.g. colorful, calm, memory" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Cover Image URL (Front)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} style={inputStyle} />
              <label style={{ ...btnStyle, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                {uploadingCover ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {coverImage && <img src={coverImage} alt="Cover Preview" style={{ width: '100%', marginTop: '1rem', borderRadius: '4px' }} />}
          </div>

          <div>
            <label style={labelStyle}>Back Image URL (Optional)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={backImage} onChange={e => setBackImage(e.target.value)} style={inputStyle} />
              <label style={{ ...btnStyle, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                {uploadingBack ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleBackUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {backImage && <img src={backImage} alt="Back Preview" style={{ width: '100%', marginTop: '1rem', borderRadius: '4px' }} />}
          </div>
          
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <button type="button" onClick={() => handleSave('published')} disabled={loading} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Saving...' : 'Save & Publish'}
        </button>
        <button type="button" onClick={() => handleSave('ready-to-write')} disabled={loading} style={{ background: '#ffa500', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Ready to Write
        </button>
        <button type="button" onClick={() => handleSave('draft')} disabled={loading} style={{ background: '#888', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Draft
        </button>
        <button type="button" onClick={() => router.push('/admin')} style={{ background: '#eee', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer' }}>
          Cancel
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>
            Delete Post
          </button>
        )}
      </div>

    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' };
const inputStyle = { width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' };
const btnStyle = { background: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem' };
