'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', password, newPassword })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Password changed successfully! You will need to login again.');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const PasswordInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    const [show, setShow] = useState(false);
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={show ? "text" : "password"} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
            required
          />
          <button 
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {show ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>
      
      <form onSubmit={handleChangePassword} style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Change Admin Password</h3>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem', padding: '0.5rem', background: '#e8f5e9', borderRadius: '4px' }}>{success}</div>}
        
        <PasswordInput label="Current Password" value={password} onChange={setPassword} />
        <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
        <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
        
        <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem', fontFamily: 'inherit' }}>
          Update Password
        </button>
      </form>
    </div>
  );
}
