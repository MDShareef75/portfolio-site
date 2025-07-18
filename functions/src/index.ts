/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as admin from 'firebase-admin';
import * as logger from "firebase-functions/logger";
import { Resend } from 'resend';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Resend for email notifications (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper function to send emails
async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      logger.warn('Resend API key not configured, logging email instead');
      logger.info(`EMAIL TO: ${to}, SUBJECT: ${subject}, CONTENT: ${htmlContent}`);
      return;
    }
    
    await resend.emails.send({
      from: 'noreply@atomsinnovation.com',
      to,
      subject,
      html: htmlContent
    });
    
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    // Log the email content for manual follow-up
    logger.info(`FAILED EMAIL TO: ${to}, SUBJECT: ${subject}, CONTENT: ${htmlContent}`);
  }
}

export const visitorCount = onRequest(async (req, res) => {
  // Get the visitor's IP address
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const ipRef = db.collection('visitor_ips').doc(ip);
  const countRef = db.collection('meta').doc('visitorCount');

  const ipDoc = await ipRef.get();
  const now = Date.now();

  let shouldIncrement = false;

  if (!ipDoc.exists) {
    shouldIncrement = true;
  } else {
    const lastVisit = ipDoc.data()?.lastVisit || 0;
    // 24 hours = 86400000 ms
    if (now - lastVisit > 86400000) {
      shouldIncrement = true;
    }
  }

  if (shouldIncrement) {
    await ipRef.set({ lastVisit: now, userAgent, timestamp: now });
    await countRef.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
    logger.info(`Visitor count incremented for IP: ${ip}, userAgent: ${userAgent}`);
  } else {
    // Always update the last seen userAgent and timestamp
    await ipRef.set({ lastVisit: now, userAgent, timestamp: now }, { merge: true });
  }

  // Always return the current count
  const countDoc = await countRef.get();
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ count: countDoc.data()?.count || 0 });
});

// Referral System Functions

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const checkRateLimit = (ip: string, maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimitMap.has(key) || now > rateLimitMap.get(key)!.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const current = rateLimitMap.get(key)!;
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

// Generate unique referral code
const generateUniqueReferralCode = async (): Promise<string> => {
  let code: string;
  let exists = true;
  
  while (exists) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `ATOM${randomNum}`;
    
    const codeDoc = await db.collection('referralCodes').doc(code).get();
    exists = codeDoc.exists;
  }
  
  return code!;
};

// Referral Code Generation Endpoint
export const generateReferralCode = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 10, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { email, phone, upi, password } = req.body;

    // Validation
    if (!email || !phone || !password) {
      res.status(400).json({ error: 'Email, phone, and password are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!phoneRegex.test(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    const existingReferrer = await db.collection('referrers')
      .where('email', '==', email.toLowerCase())
      .get();

    let isExistingUser = false;
    let referrerDoc = null;

    if (!existingReferrer.empty) {
      isExistingUser = true;
      referrerDoc = existingReferrer.docs[0];
      
      // For existing users, verify password
      if (referrerDoc.data().password !== password) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    } else {
      // For new users, check if phone already exists
      const existingPhone = await db.collection('referrers')
        .where('phone', '==', phone)
        .get();

      if (!existingPhone.empty) {
        res.status(400).json({ error: 'Phone number already registered with different email' });
        return;
      }
    }

    // Check referral code limit (max 10 per user)
    const userCodes = await db.collection('referralCodes')
      .where('referrerEmail', '==', email.toLowerCase())
      .get();

    if (userCodes.size >= 10) {
      res.status(400).json({ error: 'Maximum referral codes limit reached (10)' });
      return;
    }

    // Generate unique referral code
    const referralCode = await generateUniqueReferralCode();

    // Create referrer if first time or update existing
    if (!isExistingUser) {
      await db.collection('referrers').doc(email.toLowerCase()).set({
        email: email.toLowerCase(),
        phone,
        upi: upi || phone,
        password, // Store password (in production, this should be hashed)
        referralCodes: [referralCode],
        totalRewards: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing referrer
      await db.collection('referrers').doc(email.toLowerCase()).update({
        referralCodes: admin.firestore.FieldValue.arrayUnion(referralCode),
      });
    }

    // Create referral code document
    await db.collection('referralCodes').doc(referralCode).set({
      code: referralCode,
      referrerEmail: email.toLowerCase(),
      used: false,
      clientEmail: null,
      rewardPaid: false,
      issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Referral code generated: ${referralCode} for ${email}`);

    res.json({
      success: true,
      referralCode,
      message: 'Referral code generated successfully!'
    });

  } catch (error) {
    logger.error('Error generating referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate Referral Code (separate endpoint for step validation)
export const validateReferralCode = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { referralCode } = req.body;

    // Validation
    if (!referralCode) {
      res.status(400).json({ error: 'Referral code is required' });
      return;
    }

    if (!/^ATOM\d{4}$/.test(referralCode.toUpperCase())) {
      res.status(400).json({ error: 'Invalid referral code format (e.g., ATOM1234)' });
      return;
    }

    // Check if referral code exists and is not used
    const codeDoc = await db.collection('referralCodes').doc(referralCode.toUpperCase()).get();

    if (!codeDoc.exists) {
      res.status(400).json({ error: 'Invalid referral code' });
      return;
    }

    const codeData = codeDoc.data();
    if (codeData?.used) {
      res.status(400).json({ error: 'Referral code already used' });
      return;
    }

    logger.info(`Referral code validated: ${referralCode}`);

    res.json({
      success: true,
      message: 'Referral code is valid and available!'
    });

  } catch (error) {
    logger.error('Error validating referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Signup with Referral Code
export const clientSignup = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { referralCode, name, email, phone, password } = req.body;

    // Validation - referralCode is now optional
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Name, email, phone, and password are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!phoneRegex.test(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if client already exists
    const existingClient = await db.collection('clients')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingClient.empty) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    let codeData = null;
    let hasReferral = false;
    let discount = 0;

    // Handle referral code if provided
    if (referralCode && referralCode.trim()) {
      // Validate referral code format
      if (!/^ATOM\d{4}$/.test(referralCode.toUpperCase())) {
        res.status(400).json({ error: 'Invalid referral code format (e.g., ATOM1234)' });
        return;
      }

      // Check if referral code exists and is not used
      const codeDoc = await db.collection('referralCodes').doc(referralCode.toUpperCase()).get();

      if (!codeDoc.exists) {
        res.status(400).json({ error: 'Invalid referral code' });
        return;
      }

      codeData = codeDoc.data();
      if (codeData?.used) {
        res.status(400).json({ error: 'Referral code already used' });
        return;
      }

      // Prevent self-referral
      if (codeData?.referrerEmail === email.toLowerCase()) {
        res.status(400).json({ error: 'Cannot use your own referral code' });
        return;
      }

      hasReferral = true;
      discount = 25; // 25% discount with referral
    }

    // Create client account
    await db.collection('clients').doc(email.toLowerCase()).set({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password, // Store password (in production, this should be hashed)
      referralCode: hasReferral ? referralCode.toUpperCase() : null,
      discount: discount,
      paymentStatus: 'Pending',
      projectStatus: 'Not Started',
      totalAmount: 0,
      paidAmount: 0,
      active: true, // Client is active by default
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mark referral code as used if provided
    if (hasReferral && referralCode) {
      await db.collection('referralCodes').doc(referralCode.toUpperCase()).update({
        used: true,
        clientEmail: email.toLowerCase(),
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Client signed up: ${email} with referral code: ${referralCode}`);
    } else {
      logger.info(`Client signed up directly: ${email} (no referral)`);
    }

    const message = hasReferral 
      ? 'Account created successfully! You have received 25% discount.'
      : 'Account created successfully!';

    res.json({
      success: true,
      message: message,
      discount: discount
    });

  } catch (error) {
    logger.error('Error in client signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Direct Client Signup (without referral code)
export const directClientSignup = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!phoneRegex.test(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if client already exists
    const existingClient = await db.collection('clients')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingClient.empty) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create client account without referral code
    await db.collection('clients').doc(email.toLowerCase()).set({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password, // Store password (in production, this should be hashed)
      referralCode: null, // No referral code
      discount: 0, // No discount without referral
      paymentStatus: 'Pending',
      projectStatus: 'Not Started',
      totalAmount: 0,
      paidAmount: 0,
      active: true, // Client is active by default
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Client signed up directly: ${email} (no referral)`);

    res.json({
      success: true,
      message: 'Account created successfully!',
      discount: 0
    });

  } catch (error) {
    logger.error('Error in direct client signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Payment Status and Trigger Rewards
export const updatePaymentStatus = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { clientEmail, totalAmount, paidAmount, paymentStatus, projectStatus, active, adminKey } = req.body;

    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get client data
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();

    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const clientData = clientDoc.data();
    const referralCode = clientData?.referralCode;

    // Update client payment status and project status
    const updateData: any = {
      totalAmount,
      paidAmount,
      paymentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Only include projectStatus if it's provided
    if (projectStatus !== undefined) {
      updateData.projectStatus = projectStatus;
    }

    // Only include active status if it's provided
    if (active !== undefined) {
      updateData.active = active;
    }

    await db.collection('clients').doc(clientEmail.toLowerCase()).update(updateData);

    // Check if payment qualifies for reward (1/3rd of discounted amount)
    const discountedAmount = totalAmount * 0.75; // 25% discount
    const qualifyingAmount = discountedAmount / 3; // 1/3rd of discounted amount

    if (paidAmount >= qualifyingAmount && paymentStatus === 'Paid Step 1') {
      // Get referral code data
      const codeDoc = await db.collection('referralCodes').doc(referralCode).get();
      
      if (codeDoc.exists) {
        const codeData = codeDoc.data();
        
        if (!codeData?.rewardEligible && !codeData?.rewardPaid) {
          // Get referrer data
          const referrerDoc = await db.collection('referrers').doc(codeData?.referrerEmail).get();
          
          if (referrerDoc.exists) {
            const referrerData = referrerDoc.data();
            
            // Check if referrer has reached reward limit (max 10)
            if ((referrerData?.totalRewards || 0) < 10) {
              // Mark reward as eligible (NOT paid yet - admin needs to approve)
              await db.collection('referralCodes').doc(referralCode).update({
                rewardEligible: true,
                rewardEligibleAt: admin.firestore.FieldValue.serverTimestamp(),
                clientName: clientData?.name
              });

              // Send email notification to referrer about Step 1 payment
              await sendEmail(
                referrerData?.email,
                '🎉 Good News! Your Referral Has Made Step 1 Payment',
                `
                  <h2>Your Referral Reward is Now Eligible!</h2>
                  <p>Hello,</p>
                  
                  <p>Excellent news! Your referred client has successfully made their Step 1 payment.</p>
                  
                  <div style="background-color: #e8f4f8; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Referral Details:</strong></p>
                    <p><strong>Client Name:</strong> ${clientData?.name}</p>
                    <p><strong>Referral Code:</strong> ${referralCode}</p>
                    <p><strong>Step 1 Payment:</strong> Completed ✅</p>
                    <p><strong>Your Reward:</strong> ₹500 (Pending Admin Approval)</p>
                  </div>
                  
                  <p><strong>Next Steps:</strong></p>
                  <ul>
                    <li>Your ₹500 referral reward is now eligible</li>
                    <li>Our admin team will review and approve the reward within 24-48 hours</li>
                    <li>Once approved, the reward will be transferred to your UPI ID: ${referrerData?.upi}</li>
                  </ul>
                  
                  <p><a href="https://atomsinnovation.com/referrer-status" style="background-color: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check Referral Status</a></p>
                  
                  <p>Thank you for your successful referral!</p>
                  <p><em>Atoms Innovation Team</em></p>
                `
              );

              // Send admin notification email
              await sendEmail(
                'contact@atomsinnovation.com',
                '💰 Referral Reward Eligible - Admin Approval Required',
                `
                  <h2>Referral Reward Awaiting Approval</h2>
                  <p>A client has completed Step 1 payment, making their referrer eligible for a ₹500 reward.</p>
                  
                  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Referral Details:</strong></p>
                    <p><strong>Client:</strong> ${clientData?.name} (${clientEmail})</p>
                    <p><strong>Referrer:</strong> ${referrerData?.email}</p>
                    <p><strong>Referral Code:</strong> ${referralCode}</p>
                    <p><strong>Referrer UPI:</strong> ${referrerData?.upi}</p>
                    <p><strong>Reward Amount:</strong> ₹500</p>
                  </div>
                  
                  <p><strong>Action Required:</strong> Please log into the admin dashboard to approve this referral reward.</p>
                  
                  <p><a href="https://atomsinnovation.com/admin" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Admin Dashboard</a></p>
                  
                  <p><small>Payment completed at: ${new Date().toISOString()}</small></p>
                `
              );

              res.json({
                success: true,
                message: 'Payment updated and referrer notified',
                rewardEligible: true
              });
              return;
            }
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment status updated',
      rewardTriggered: false
    });

  } catch (error) {
    logger.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Approve Referral Reward
export const approveReferralReward = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { referralCode, adminKey } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get referral code data
    const codeDoc = await db.collection('referralCodes').doc(referralCode).get();

    if (!codeDoc.exists) {
      res.status(404).json({ error: 'Referral code not found' });
      return;
    }

    const codeData = codeDoc.data();

    if (!codeData?.rewardEligible) {
      res.status(400).json({ error: 'Reward not eligible or already paid' });
      return;
    }

    if (codeData?.rewardPaid) {
      res.status(400).json({ error: 'Reward already paid' });
      return;
    }

    // Get referrer data
    const referrerDoc = await db.collection('referrers').doc(codeData?.referrerEmail).get();

    if (!referrerDoc.exists) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    const referrerData = referrerDoc.data();

    // Check if referrer has reached reward limit (max 10)
    if ((referrerData?.totalRewards || 0) >= 10) {
      res.status(400).json({ error: 'Referrer has reached maximum reward limit' });
      return;
    }

    // Mark reward as paid
    await db.collection('referralCodes').doc(referralCode).update({
      rewardPaid: true,
      rewardPaidAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: 'admin'
    });

    // Update referrer total rewards
    await db.collection('referrers').doc(codeData?.referrerEmail).update({
      totalRewards: admin.firestore.FieldValue.increment(1),
    });

    // Send confirmation email to referrer
    await sendEmail(
      referrerData?.email,
      '🎉 ₹500 Referral Reward Credited!',
      `
        <h2>Congratulations! Your Referral Reward Has Been Credited</h2>
        <p>Hello,</p>
        
        <p>Great news! Your referral reward has been approved and is ready for payment.</p>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Reward Details:</strong></p>
          <p><strong>Amount:</strong> ₹500</p>
          <p><strong>Referral Code:</strong> ${referralCode}</p>
          <p><strong>Client Name:</strong> ${codeData?.clientName}</p>
          <p><strong>Your UPI ID:</strong> ${referrerData?.upi}</p>
          <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #e8f4f8; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>💰 Your Total Earnings:</strong> ₹${((referrerData?.totalRewards || 0) + 1) * 500}</p>
          <p><strong>Total Successful Referrals:</strong> ${(referrerData?.totalRewards || 0) + 1}</p>
        </div>
        
        <p><strong>Payment Processing:</strong> Your reward will be transferred to your UPI ID within 24-48 hours.</p>
        
        <p>Keep referring more clients to earn additional rewards! Each successful referral earns you ₹500.</p>
        
        <p><a href="https://atomsinnovation.com/referrer-status" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check Referral Status</a></p>
        
        <p>Thank you for being a valuable partner!</p>
        <p><em>Atoms Innovation Team</em></p>
      `
    );

    logger.info(`REWARD APPROVED: ₹500 credited to ${referrerData?.email} for referral code ${referralCode}`);

    res.json({
      success: true,
      message: 'Referral reward approved and credited',
      referrerEmail: referrerData?.email,
      amount: 500,
      totalRewards: (referrerData?.totalRewards || 0) + 1
    });

  } catch (error) {
    logger.error('Error approving referral reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Dashboard Data
export const adminDashboard = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const adminKey = req.query.adminKey as string;

    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get statistics
    const [referrersSnap, clientsSnap, codesSnap, projectsSnap] = await Promise.all([
      db.collection('referrers').get(),
      db.collection('clients').get(),
      db.collection('referralCodes').get(),
      db.collection('projects').get()
    ]);

    const totalReferrers = referrersSnap.size;
    const totalClients = clientsSnap.size;
    const totalCodes = codesSnap.size;
    const totalProjects = projectsSnap.size;
    
    let usedCodes = 0;
    let eligibleRewards = 0;
    let paidRewards = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalClientPayments = 0;

    codesSnap.forEach(doc => {
      const data = doc.data();
      if (data.used) usedCodes++;
      if (data.rewardPaid) paidRewards++;
      if (data.rewardEligibleAt && !data.rewardPaid) eligibleRewards++;
    });

    // Calculate total client payments
    clientsSnap.forEach(doc => {
      const data = doc.data();
      if (data.paidAmount && typeof data.paidAmount === 'number') {
        totalClientPayments += data.paidAmount;
      }
    });

    projectsSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Completed') {
        completedProjects++;
      } else if (data.status === 'In Progress' || data.status === 'Testing') {
        activeProjects++;
      }
    });

    // Get recent activities with bonus status
    const recentReferrers = referrersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, 10);

    const recentClients = clientsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, 10);

    const recentProjects = projectsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, 20);

    // Get referral codes with bonus status for each referrer
    const referrersWithBonusStatus = await Promise.all(
      recentReferrers.map(async (referrer: any) => {
        const referrerCodes = await db.collection('referralCodes')
          .where('referrerEmail', '==', referrer.email)
          .get();
        
        const codesWithStatus = referrerCodes.docs.map(doc => ({
          code: doc.id,
          ...doc.data()
        }));

        return {
          ...referrer,
          referralCodesWithStatus: codesWithStatus
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalReferrers,
        totalClients,
        totalCodes,
        usedCodes,
        eligibleRewards,
        paidRewards,
        totalEarnings: totalClientPayments, // Actual client payments
        totalProjects,
        activeProjects,
        completedProjects
      },
      recentReferrers: referrersWithBonusStatus,
      recentClients,
      recentProjects
    });

  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Portal Authentication
export const clientLogin = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find client by email
    const clientDoc = await db.collection('clients').doc(email.toLowerCase()).get();

    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const clientData = clientDoc.data();
    
    // Verify password matches
    if (clientData?.password !== password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get referrer information
    const referralCodeDoc = await db.collection('referralCodes').doc(clientData?.referralCode).get();
    let referrerInfo = null;
    
    if (referralCodeDoc.exists) {
      const codeData = referralCodeDoc.data();
      const referrerDoc = await db.collection('referrers').doc(codeData?.referrerEmail).get();
      if (referrerDoc.exists) {
        referrerInfo = referrerDoc.data();
      }
    }

    res.json({
      success: true,
      client: {
        id: clientDoc.id,
        ...clientData,
        referrerInfo
      }
    });

  } catch (error) {
    logger.error('Error in client login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate Payment QR Code and Details
export const generatePaymentQR = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { clientEmail, paymentStep, projectId } = req.body;

    if (!clientEmail || !paymentStep || !projectId) {
      res.status(400).json({ error: 'Client email, payment step, and project ID are required' });
      return;
    }

    // Get client and project data
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const clientData = clientDoc.data();
    const projectData = projectDoc.data();

    // Calculate payment amounts (Step 1: 30%, Step 2: 40%, Step 3: 30%)
    const totalAmount = clientData?.totalAmount || 0;
    const stepPercentages = { 1: 0.30, 2: 0.40, 3: 0.30 };
    const stepAmount = Math.round(totalAmount * (stepPercentages[paymentStep as keyof typeof stepPercentages] || 0));

    if (stepAmount <= 0) {
      res.status(400).json({ error: 'Invalid payment amount calculated' });
      return;
    }

    // Generate unique payment ID
    const paymentId = `PAY_${projectId}_STEP${paymentStep}_${Date.now()}`;

    // Create payment record
    await db.collection('payments').doc(paymentId).set({
      paymentId,
      clientEmail: clientEmail.toLowerCase(),
      clientName: clientData?.name,
      projectId,
      projectName: projectData?.name,
      paymentStep: parseInt(paymentStep),
      amount: stepAmount,
      totalProjectAmount: totalAmount,
      status: 'pending',
      qrGenerated: true,
      paymentNote: `AtomsInnovation - ${projectData?.name} - Step ${paymentStep}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
    });

    // UPI Payment URL for QR generation (you can use any UPI app)
    const upiUrl = `upi://pay?pa=atomrex75@okhdfcbank&pn=Atoms Innovation&am=${stepAmount}&cu=INR&tn=${encodeURIComponent(`AtomsInnovation - ${projectData?.name} - Step ${paymentStep}`)}&tr=${paymentId}`;

    logger.info(`Payment QR generated for client: ${clientEmail}, Step: ${paymentStep}, Amount: ₹${stepAmount}`);

    res.json({
      success: true,
      payment: {
        paymentId,
        amount: stepAmount,
        step: paymentStep,
        projectName: projectData?.name,
        upiUrl,
        qrData: upiUrl,
        note: `AtomsInnovation - ${projectData?.name} - Step ${paymentStep}`,
        dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
      }
    });

  } catch (error) {
    logger.error('Error generating payment QR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit Payment Proof
export const submitPaymentProof = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { paymentId, clientEmail, transactionId, paymentScreenshot, paymentMethod, notes } = req.body;

    if (!paymentId || !clientEmail || !transactionId) {
      res.status(400).json({ error: 'Payment ID, client email, and transaction ID are required' });
      return;
    }

    // Get payment record
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const paymentData = paymentDoc.data();
    if (paymentData?.clientEmail !== clientEmail.toLowerCase()) {
      res.status(403).json({ error: 'Unauthorized access to payment' });
      return;
    }

    if (paymentData?.status !== 'pending') {
      res.status(400).json({ error: 'Payment already processed' });
      return;
    }

    // Update payment record with proof
    await db.collection('payments').doc(paymentId).update({
      status: 'proof_submitted',
      transactionId,
      paymentScreenshot: paymentScreenshot || null,
      paymentMethod: paymentMethod || 'UPI',
      clientNotes: notes || '',
      proofSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send notification email to admin
    await sendEmail(
      'contact@atomsinnovation.com',
      '🔔 New Payment Proof Submitted - Action Required',
      `
        <h2>New Payment Proof Submitted</h2>
        <p>A client has submitted payment proof that requires your verification.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Client:</strong> ${paymentData?.clientName} (${clientEmail})</p>
          <p><strong>Project:</strong> ${paymentData?.projectName}</p>
          <p><strong>Payment Step:</strong> ${paymentData?.paymentStep} of 3</p>
          <p><strong>Amount:</strong> ₹${paymentData?.amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod || 'UPI'}</p>
          ${notes ? `<p><strong>Client Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <p><strong>Action Required:</strong> Please log into the admin dashboard to verify and approve this payment.</p>
        
        <p><a href="https://atomsinnovation.com/admin" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Admin Dashboard</a></p>
        
        <p><small>Submitted at: ${new Date().toISOString()}</small></p>
      `
    );
    
    logger.info(`Payment proof submitted: ${paymentId} by ${clientEmail}`);

    res.json({
      success: true,
      message: 'Payment proof submitted successfully. Admin will verify and approve within 24 hours.',
      paymentId
    });

  } catch (error) {
    logger.error('Error submitting payment proof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and Approve Payment (Admin)
export const verifyPayment = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { paymentId, adminKey, approved, adminNotes } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!paymentId || approved === undefined) {
      res.status(400).json({ error: 'Payment ID and approval status are required' });
      return;
    }

    // Get payment record
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const paymentData = paymentDoc.data();
    
    if (paymentData?.status !== 'proof_submitted') {
      res.status(400).json({ error: 'Payment is not in proof submitted status' });
      return;
    }

    const newStatus = approved ? 'verified_approved' : 'verified_rejected';

    // Update payment record
    await db.collection('payments').doc(paymentId).update({
      status: newStatus,
      adminNotes: adminNotes || '',
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: 'admin',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get client data for email notification
    const clientDoc = await db.collection('clients').doc(paymentData?.clientEmail).get();
    const clientData = clientDoc.data();

    if (approved) {
      // Update client's paid amount
      if (clientDoc.exists) {
        const currentPaidAmount = clientData?.paidAmount || 0;
        const newPaidAmount = currentPaidAmount + paymentData?.amount;

        await db.collection('clients').doc(paymentData?.clientEmail).update({
          paidAmount: newPaidAmount,
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Check if this triggers referral reward (only on first payment)
        if (paymentData?.paymentStep === 1 && clientData?.referralCode) {
          // Trigger referral reward logic here
          logger.info(`First payment verified for client with referral: ${clientData.referralCode}`);
        }
      }

      // Send approval email to client
      await sendEmail(
        paymentData?.clientEmail,
        '✅ Payment Verified - Step ' + paymentData?.paymentStep + ' Approved',
        `
          <h2>Payment Verified Successfully!</h2>
          <p>Hello ${paymentData?.clientName},</p>
          
          <p>Great news! Your payment has been verified and approved.</p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Payment Details:</strong></p>
            <p><strong>Project:</strong> ${paymentData?.projectName}</p>
            <p><strong>Payment Step:</strong> ${paymentData?.paymentStep} of 3</p>
            <p><strong>Amount Verified:</strong> ₹${paymentData?.amount}</p>
            <p><strong>Transaction ID:</strong> ${paymentData?.transactionId}</p>
            <p><strong>Verification Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${paymentData?.paymentStep < 3 ? 
            `<p>You can now proceed with Step ${paymentData?.paymentStep + 1} payment when you're ready. Check your client portal for the next payment details.</p>` :
            `<p>🎉 Congratulations! All payments are now complete. Your project will proceed to final delivery.</p>`
          }
          
          ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          
          <p><a href="https://atomsinnovation.com/client-portal" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Client Portal</a></p>
          
          <p>Thank you for your business!</p>
          <p><em>Atoms Innovation Team</em></p>
        `
      );
    } else {
      // Send rejection email to client
      await sendEmail(
        paymentData?.clientEmail,
        '❌ Payment Verification Issue - Step ' + paymentData?.paymentStep,
        `
          <h2>Payment Verification Issue</h2>
          <p>Hello ${paymentData?.clientName},</p>
          
          <p>We've reviewed your payment submission for Step ${paymentData?.paymentStep}, but unfortunately, we couldn't verify it at this time.</p>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Payment Details:</strong></p>
            <p><strong>Project:</strong> ${paymentData?.projectName}</p>
            <p><strong>Payment Step:</strong> ${paymentData?.paymentStep} of 3</p>
            <p><strong>Amount:</strong> ₹${paymentData?.amount}</p>
            <p><strong>Transaction ID:</strong> ${paymentData?.transactionId}</p>
          </div>
          
          ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Please check your transaction details and ensure the payment was made to the correct UPI ID</li>
            <li>Verify the transaction amount matches the required payment</li>
            <li>If you believe this is an error, please contact us immediately</li>
            <li>You can resubmit payment proof with correct details through your client portal</li>
          </ul>
          
          <p><a href="https://atomsinnovation.com/client-portal" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Client Portal</a></p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p><em>Atoms Innovation Team</em></p>
        `
      );
    }

    logger.info(`Payment ${approved ? 'approved' : 'rejected'}: ${paymentId}`);

    res.json({
      success: true,
      message: `Payment ${approved ? 'approved' : 'rejected'} successfully`,
      paymentId,
      newStatus
    });

  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Client Payments
export const getClientPayments = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { clientEmail } = req.body;

    if (!clientEmail) {
      res.status(400).json({ error: 'Client email is required' });
      return;
    }

    // Get all payments for this client
    const paymentsQuery = await db.collection('payments')
      .where('clientEmail', '==', clientEmail.toLowerCase())
      .orderBy('createdAt', 'desc')
      .get();

    const payments = paymentsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    logger.error('Error fetching client payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Client Project Details
export const getClientProjectDetails = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 10, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { clientEmail } = req.body;

    if (!clientEmail) {
      res.status(400).json({ error: 'Client email is required' });
      return;
    }

    // Get client data
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const clientData = clientDoc.data();

    // Get project details for this client
    const projectsQuery = await db.collection('projects')
      .where('clientEmail', '==', clientEmail.toLowerCase())
      .get();

    let projectDetails = null;
    if (!projectsQuery.empty) {
      const projectDoc = projectsQuery.docs[0]; // Get the first project for this client
      const projectData = projectDoc.data();
      
      projectDetails = {
        id: projectDoc.id,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        technology: projectData.technology || [],
        budget: projectData.budget || 0,
        startDate: projectData.startDate,
        dueDate: projectData.dueDate,
        progress: projectData.progress || 0,
        assignedTo: projectData.assignedTo,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt
      };
    }

    logger.info(`Client project details fetched for: ${clientEmail}`);

    res.json({
      success: true,
      client: {
        ...clientData,
        id: clientDoc.id
      },
      project: projectDetails
    });

  } catch (error) {
    logger.error('Error fetching client project details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit Change Request
export const submitChangeRequest = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { clientEmail, title, description } = req.body;

    if (!clientEmail || !title || !description) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Verify client exists
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Create change request
    const requestRef = await db.collection('changeRequests').add({
      clientEmail: clientEmail.toLowerCase(),
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      response: null,
    });

    logger.info(`Change request submitted by ${clientEmail}: ${title}`);

    res.json({
      success: true,
      requestId: requestRef.id,
      message: 'Change request submitted successfully!'
    });

  } catch (error) {
    logger.error('Error submitting change request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Client Change Requests
export const getChangeRequests = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const clientEmail = req.query.clientEmail as string;

    if (!clientEmail) {
      res.status(400).json({ error: 'Client email is required' });
      return;
    }

    // Get change requests for this client
    const requestsSnapshot = await db.collection('changeRequests')
      .where('clientEmail', '==', clientEmail.toLowerCase())
      .orderBy('submittedAt', 'desc')
      .get();

    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate()?.toISOString()
    }));

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    logger.error('Error fetching change requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Referrer Status
export const getReferrerStatus = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';
    
    if (!checkRateLimit(ip, 20, 15 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find referrer by email and verify password
    const referrerDoc = await db.collection('referrers').doc(email.toLowerCase()).get();

    if (!referrerDoc.exists) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    const referrerData = referrerDoc.data();
    
    // Verify password matches
    if (referrerData?.password !== password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get all referral codes for this referrer
    const codesSnapshot = await db.collection('referralCodes')
      .where('referrerEmail', '==', email.toLowerCase())
      .get();

    const codes = codesSnapshot.docs.map(doc => doc.data());
    const usedCodes = codes.filter(code => code.used);
    const eligibleRewards = codes.filter(code => code.rewardEligible && !code.rewardPaid);
    const paidRewards = codes.filter(code => code.rewardPaid);

    // Get recent activity with client details and bonus status
    const recentActivity = [];
    for (const code of codes) {
      if (code.used && code.clientEmail) {
        const clientDoc = await db.collection('clients').doc(code.clientEmail).get();
        const clientData = clientDoc.exists ? clientDoc.data() : null;
        
        // Determine status based on bonus status
        let status = 'used';
        if (code.bonusStatus === 'Paid') {
          status = 'paid';
        } else if (code.bonusStatus === 'Eligible' || code.bonusStatus === 'Processing') {
          status = 'eligible';
        } else if (code.bonusStatus === 'Pending') {
          status = 'pending';
        } else if (code.rewardPaid) {
          status = 'paid';
        } else if (code.rewardEligible) {
          status = 'eligible';
        }
        
        recentActivity.push({
          code: code.code,
          clientName: clientData?.name || 'Unknown',
          status: status,
          bonusStatus: code.bonusStatus || 'Pending',
          date: code.usedAt?.toDate()?.toISOString()?.split('T')[0] || 'Unknown'
        });
      } else if (code.used) {
        recentActivity.push({
          code: code.code,
          status: 'used',
          bonusStatus: code.bonusStatus || 'Pending',
          date: code.usedAt?.toDate()?.toISOString()?.split('T')[0] || 'Unknown'
        });
      }
    }

    // Sort by date descending
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const response = {
      success: true,
      referrer: {
        email: referrerData?.email || email.toLowerCase(),
        phone: referrerData?.phone,
        upi: referrerData?.upi || referrerData?.phone + '@paytm',
        referralCodes: referrerData?.referralCodes || [],
        totalRewards: referrerData?.totalRewards || 0,
        usedCodes: usedCodes.length,
        eligibleRewards: eligibleRewards.length,
        paidRewards: paidRewards.length,
        recentActivity: recentActivity.slice(0, 10) // Last 10 activities
      }
    };

    res.json(response);

  } catch (error) {
    logger.error('Error fetching referrer status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Client Status (Active/Inactive)
export const updateClientStatus = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { clientEmail, active, adminKey } = req.body;

    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!clientEmail || active === undefined) {
      res.status(400).json({ error: 'Client email and active status are required' });
      return;
    }

    // Get client data
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();

    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Update client active status
    await db.collection('clients').doc(clientEmail.toLowerCase()).update({
      active: active,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Client status updated: ${clientEmail} - Active: ${active}`);

    res.json({
      success: true,
      message: `Client ${active ? 'activated' : 'deactivated'} successfully`,
      clientEmail,
      active
    });

  } catch (error) {
    logger.error('Error updating client status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Project
export const createProject = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      name, description, clientEmail, status, priority, technology, 
      budget, startDate, dueDate, progress, assignedTo, adminKey 
    } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name || !clientEmail) {
      res.status(400).json({ error: 'Project name and client are required' });
      return;
    }

    // Get client name
    const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    const clientData = clientDoc.data();

    // Create project
    const projectRef = await db.collection('projects').add({
      name: name.trim(),
      description: description?.trim() || '',
      clientEmail: clientEmail.toLowerCase(),
      clientName: clientData?.name || 'Unknown Client',
      status: status || 'Not Started',
      priority: priority || 'Medium',
      technology: technology || [],
      budget: budget || 0,
      startDate: startDate || '',
      dueDate: dueDate || '',
      progress: progress || 0,
      assignedTo: assignedTo?.trim() || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Project created: ${name} for ${clientEmail}`);

    res.json({
      success: true,
      projectId: projectRef.id,
      message: 'Project created successfully!'
    });

  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Project
export const updateProject = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      projectId, name, description, clientEmail, status, priority, technology, 
      budget, startDate, dueDate, progress, assignedTo, adminKey 
    } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    // Get project document
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get client name if client changed
    let clientName = projectDoc.data()?.clientName;
    if (clientEmail && clientEmail !== projectDoc.data()?.clientEmail) {
      const clientDoc = await db.collection('clients').doc(clientEmail.toLowerCase()).get();
      if (clientDoc.exists) {
        clientName = clientDoc.data()?.name;
      }
    }

    // Update project
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (clientEmail !== undefined) {
      updateData.clientEmail = clientEmail.toLowerCase();
      updateData.clientName = clientName;
    }
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (technology !== undefined) updateData.technology = technology;
    if (budget !== undefined) updateData.budget = budget;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (progress !== undefined) updateData.progress = progress;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo.trim();

    await db.collection('projects').doc(projectId).update(updateData);

    logger.info(`Project updated: ${projectId}`);

    res.json({
      success: true,
      message: 'Project updated successfully!'
    });

  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Project
export const deleteProject = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { projectId, adminKey } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    // Check if project exists
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Delete project
    await db.collection('projects').doc(projectId).delete();

    logger.info(`Project deleted: ${projectId}`);

    res.json({
      success: true,
      message: 'Project deleted successfully!'
    });

  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Referrer Information
export const updateReferrerInfo = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { referrerEmail, phone, upi, adminKey } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get referrer data
    const referrerDoc = await db.collection('referrers').doc(referrerEmail.toLowerCase()).get();

    if (!referrerDoc.exists) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    // Update referrer information
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (phone) updateData.phone = phone;
    if (upi) updateData.upi = upi;

    await db.collection('referrers').doc(referrerEmail.toLowerCase()).update(updateData);

    logger.info(`Referrer updated: ${referrerEmail}`);

    res.json({
      success: true,
      message: 'Referrer information updated successfully'
    });

  } catch (error) {
    logger.error('Error updating referrer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Referral Bonus Status
export const updateReferralBonusStatus = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { referralCode, bonusStatus, adminKey } = req.body;

    // Simple admin authentication
    if (adminKey !== 'ATOMS_ADMIN_2025') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!referralCode || !bonusStatus) {
      res.status(400).json({ error: 'Referral code and bonus status are required' });
      return;
    }

    // Get referral code document
    const codeDoc = await db.collection('referralCodes').doc(referralCode).get();

    if (!codeDoc.exists) {
      res.status(404).json({ error: 'Referral code not found' });
      return;
    }

    const codeData = codeDoc.data();
    const referrerEmail = codeData?.referrerEmail;

    // Update referral code bonus status
    const updateData: any = {
      bonusStatus: bonusStatus,
      bonusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (bonusStatus === 'Paid') {
      updateData.rewardPaid = true;
      updateData.paidAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('referralCodes').doc(referralCode).update(updateData);

    // Update referrer's total rewards if bonus is paid
    if (bonusStatus === 'Paid') {
      const referrerDoc = await db.collection('referrers').doc(referrerEmail).get();
      if (referrerDoc.exists) {
        const currentRewards = referrerDoc.data()?.totalRewards || 0;
        await db.collection('referrers').doc(referrerEmail).update({
          totalRewards: currentRewards + 1
        });
      }
    }

    logger.info(`Referral bonus status updated: ${referralCode} -> ${bonusStatus}`);

    res.json({
      success: true,
      message: 'Referral bonus status updated successfully'
    });

  } catch (error) {
    logger.error('Error updating referral bonus status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
