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

export const visitorCount = onRequest(async (req, res) => {
  // Get the visitor's IP address
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';

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
    await ipRef.set({ lastVisit: now });
    await countRef.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
    logger.info(`Visitor count incremented for IP: ${ip}`);
  }

  // Always return the current count
  const countDoc = await countRef.get();
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ count: countDoc.data()?.count || 0 });
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
