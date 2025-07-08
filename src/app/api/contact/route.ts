import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
  const { name, email, subject, message } = await request.json();

    // Validation
  if (!email || !name || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().slice(0, 100);
    const sanitizedSubject = subject ? subject.trim().slice(0, 200) : 'No Subject';
    const sanitizedMessage = message.trim().slice(0, 2000);

    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'noreply@atomsinnovation.com',
      to: 'contact@atomsinnovation.com',
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Subject:</strong> ${sanitizedSubject}</p>
        <p><strong>Message:</strong><br/>${sanitizedMessage.replace(/\n/g, '<br/>')}</p>
        <hr>
        <p><small>Sent from: ${request.headers.get('origin') || 'Unknown'}</small></p>
        <p><small>Time: ${new Date().toISOString()}</small></p>
      `,
    });
    
    return NextResponse.json({ message: 'Mail sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send mail. Please try again later.' }, { status: 500 });
  }
} 