import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { message, email } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Save to local JSON file
    const messagesFilePath = path.join(process.cwd(), 'content', 'messages.json');
    let messages = [];
    if (fs.existsSync(messagesFilePath)) {
      const fileData = fs.readFileSync(messagesFilePath, 'utf8');
      try {
        messages = JSON.parse(fileData);
      } catch (e) {
        messages = [];
      }
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      email: email || 'Anonymous',
      createdAt: new Date().toISOString()
    };

    messages.unshift(newMessage); // Prepend to show newest first
    try {
      fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
    } catch (fsError) {
      console.warn('Could not write to local file (likely on Vercel read-only filesystem):', fsError);
    }

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
            email: newMessage.email,
            message: `You have received a new message!\n\nFrom: ${newMessage.email}\n\nMessage:\n${newMessage.message}`
          })
        });

        if (!response.ok) {
          console.error('Web3Forms failed:', await response.text());
        }
      } catch (emailError) {
        console.error('Failed to send email via Web3Forms:', emailError);
        // Continue even if email fails, since we saved it locally
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
  // Allow admin to fetch messages
  try {
    const messagesFilePath = path.join(process.cwd(), 'content', 'messages.json');
    if (!fs.existsSync(messagesFilePath)) {
      return NextResponse.json([]);
    }
    const fileData = fs.readFileSync(messagesFilePath, 'utf8');
    const messages = JSON.parse(fileData);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('API /messages GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
