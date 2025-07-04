import { NextResponse } from 'next/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // IMPORTANT: Replace with your verified sending email
      to: 'contact@atomsinnovation.com',
      subject: 'New Subscriber to Your Blog',
      html: `<p>A new user has subscribed with the email: <strong>${email}</strong></p>`
    });

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Resend error:', error);
    // Don't expose the error to the client
    return NextResponse.json({ message: 'Subscribed successfully' });
  }
} 