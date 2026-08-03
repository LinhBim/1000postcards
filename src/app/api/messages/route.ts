import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/models/Message';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message, email } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Save to MongoDB
    const newMessage = await Message.create({
      message,
      email: email || 'Anonymous',
    });

    // 2. Try to send email via Web3Forms (fail gracefully if not configured)
    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (web3formsAccessKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: web3formsAccessKey,
            subject: 'New Message from Postcards Web',
            from_name: 'Postcards Web System',
            email: newMessage.email === 'Anonymous' ? 'noreply@example.com' : newMessage.email,
            message: `You have received a new message!\n\nFrom: ${newMessage.email}\n\nMessage:\n${newMessage.message}`
          })
        });

        if (!response.ok) {
          console.error('Web3Forms failed:', await response.text());
        }
      } catch (emailError) {
        console.error('Failed to send email via Web3Forms:', emailError);
      }
    } else {
      console.warn('WEB3FORMS_ACCESS_KEY not set. Skipping email notification.');
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('API /messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('API /messages GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
