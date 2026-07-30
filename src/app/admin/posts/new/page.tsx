'use client';

import PostEditor from '../PostEditor';

export default function NewPostPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Create New Post</h2>
      <PostEditor isNew={true} />
    </div>
  );
}
