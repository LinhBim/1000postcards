'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  message: string;
  email: string;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Basic optimistic delete. If we want a real delete, we should make a DELETE /api/messages route.
    // Since this was not explicitly requested, I'll just leave a placeholder for future,
    // or we can implement it if the user wants.
    alert('Delete functionality is not fully implemented yet.');
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
        Visitor Messages
      </h2>

      {messages.length === 0 ? (
        <p style={{ color: '#888' }}>No messages yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '1.5rem',
                backgroundColor: '#fafafa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 'bold' }}>
                  {msg.email}
                </div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#444' }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
