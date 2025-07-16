import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per 15 minutes

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

function sanitizeString(input: any, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .slice(0, maxLength);
}

function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  return isNaN(num) || num < 0 ? null : Math.min(num, 10000000); // Cap at 10M
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

    const { email, budget, delivery, projectType, tier, features, minPrice, maxPrice } = await request.json();

    // Email validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Sanitize all inputs
    const sanitizedBudget = sanitizeNumber(budget);
    const sanitizedDelivery = sanitizeString(delivery, 50);
    const sanitizedProjectType = sanitizeString(projectType, 100);
    const sanitizedTier = sanitizeString(tier, 200);
    const sanitizedMinPrice = sanitizeNumber(minPrice);
    const sanitizedMaxPrice = sanitizeNumber(maxPrice);
    
    // Sanitize features array
    const sanitizedFeatures = Array.isArray(features) 
      ? features.map(f => sanitizeString(f, 100)).filter(f => f.length > 0)
      : [];

    await resend.emails.send({
      from: 'noreply@atomsinnovation.com',
      to: 'contact@atomsinnovation.com',
      subject: 'New Price Calculator Submission',
      html: `
        <h2>New Price Calculator Submission</h2>
        <p><strong>Client Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Budget:</strong> ₹${sanitizedBudget || 'Not specified'}</p>
        <p><strong>Delivery Time:</strong> ${sanitizedDelivery || 'Not specified'}</p>
        <p><strong>Project Type:</strong> ${sanitizedProjectType || 'Not specified'}</p>
        <p><strong>Project Tier:</strong> ${sanitizedTier || 'Not specified'}</p>
        <p><strong>Selected Features:</strong> ${sanitizedFeatures.length ? sanitizedFeatures.join(', ') : 'None'}</p>
        <p><strong>Estimated Price Range:</strong> ₹${sanitizedMinPrice || 0} – ₹${sanitizedMaxPrice || 0}</p>
        <p><small>Submitted at: ${new Date().toISOString()}</small></p>
        <p><small>IP: ${clientIp}</small></p>
      `,
    });
    
    return NextResponse.json({ message: 'Price calculation request sent successfully!' });
  } catch (error) {
    // Log error securely (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Price calculator error:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to send price calculation request. Please try again later.' }, 
      { status: 500 }
    );
  }
} 