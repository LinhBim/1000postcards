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
