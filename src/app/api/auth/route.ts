import { NextResponse } from 'next/server';
import { getAdminPassword, setAdminPassword } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { password, action, newPassword } = await request.json();

    const currentPassword = getAdminPassword();

    // Change password logic
    if (action === 'change_password') {
      // Must provide current password to change it
      if (password !== currentPassword) {
        return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 401 });
      }
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ success: false, error: 'New password must be at least 4 characters' }, { status: 400 });
      }
      setAdminPassword(newPassword);
      return NextResponse.json({ success: true });
    }

    // Login logic
    if (password === currentPassword) {
      // Create a response and set a simple HTTP-only cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout logic
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
