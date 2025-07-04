import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'

// Only initialize once
if (!getApps().length) {
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json')
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()
const docRef = db.collection('meta').doc('visitorCount')

export async function GET(req: NextRequest) {
  // Atomically increment the count
  const doc = await docRef.get()
  let count = 1
  if (doc.exists) {
    count = (doc.data()?.count || 0) + 1
    await docRef.update({ count })
  } else {
    await docRef.set({ count })
  }
  return NextResponse.json({ count })
} 