import { NextResponse } from 'next/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple rate limiting store (in production, use Redis or database)
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

    const { email } = await request.json();

    // Comprehensive email validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Email length validation
    if (trimmedEmail.length > 254) {
      return NextResponse.json({ error: 'Email address too long' }, { status: 400 });
    }

    // Basic domain validation
    const domain = trimmedEmail.split('@')[1];
    if (!domain || domain.length < 3) {
      return NextResponse.json({ error: 'Invalid email domain' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'noreply@atomsinnovation.com',
      to: 'contact@atomsinnovation.com',
      subject: 'New Blog Subscriber',
      html: `
        <h2>New Blog Subscription</h2>
        <p>A new user has subscribed with the email: <strong>${trimmedEmail}</strong></p>
        <p><small>Subscribed at: ${new Date().toISOString()}</small></p>
        <p><small>IP: ${clientIp}</small></p>
      `
    });

    return NextResponse.json({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    // Log error securely (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Subscription error:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' }, 
      { status: 500 }
    );
  }
} 