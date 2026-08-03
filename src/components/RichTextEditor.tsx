'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR hydration mismatch
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    // Register custom fonts and sizes inside the dynamic import to ensure document/window exists
    const Quill = (await import('react-quill-new')).Quill;
    
    const Font = Quill.import('formats/font') as any;
    Font.whitelist = ['sans-serif', 'gamja', 'patrick'];
    Quill.register(Font, true);

    const Size = Quill.import('formats/size') as any;
    Size.whitelist = ['small', false, 'large', 'huge'];
    Quill.register(Size, true);

    return RQ;
  },
  { ssr: false, loading: () => <p>Loading Editor...</p> }
);

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const reactQuillRef = useRef<any>(null);

  // Custom Image Handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'blog');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          const quill = reactQuillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.url);
          quill.setSelection(range.index + 1);
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        alert('Upload error');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': [1, 2, 3, false] }],
        [{ 'font': ['sans-serif', 'gamja', 'patrick'] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const ReactQuillAny = ReactQuill as any;

  return (
    <div style={{ background: '#fff', color: '#000' }}>
      <ReactQuillAny 
        ref={reactQuillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        style={{ height: '800px', marginBottom: '40px' }}
      />
    </div>
  );
}
