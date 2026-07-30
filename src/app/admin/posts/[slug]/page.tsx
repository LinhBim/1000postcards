'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PostEditor from '../PostEditor';

export default function EditPostPage() {
  const { slug } = useParams();
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const post = data.posts.find((p: any) => p.slug === slug);
          setPostData(post);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!postData) return <div>Post not found</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Post: {postData.title}</h2>
      <PostEditor initialData={postData} isNew={false} />
    </div>
  );
}
