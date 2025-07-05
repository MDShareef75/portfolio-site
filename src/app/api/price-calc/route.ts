import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, budget, delivery, projectType, tier, features, minPrice, maxPrice } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'noreply@atomsinnovation.com',
      to: 'contact@atomsinnovation.com',
      subject: 'New Price Calculator Submission',
      html: `
        <h2>New Price Calculator Submission</h2>
        <p><strong>Client Email:</strong> ${email}</p>
        <p><strong>Budget:</strong> ₹${budget}</p>
        <p><strong>Delivery Time:</strong> ${delivery}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Project Tier:</strong> ${tier}</p>
        <p><strong>Selected Features:</strong> ${features && features.length ? features.join(', ') : 'None'}</p>
        <p><strong>Estimated Price Range:</strong> ₹${minPrice} – ₹${maxPrice}</p>
      `,
    });
    return NextResponse.json({ message: 'Mail sent successfully' });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Failed to send mail' }, { status: 500 });
  }
} 