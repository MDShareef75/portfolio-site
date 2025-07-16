import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per 15 minutes

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' }, 
        { status: 429 }
      );
    }

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
        <p><small>IP: ${clientIp}</small></p>
      `,
    });
    
    return NextResponse.json({ message: 'Message sent successfully!' });
  } catch (error) {
    // Log error securely (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Contact form error:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' }, 
      { status: 500 }
    );
  }
} 