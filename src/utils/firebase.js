/**
 * Firebase Configuration & Initialization
 * ─────────────────────────────────────────
 * Project: dscapstone-d89c4
 *
 * Credentials are loaded from .env (VITE_FIREBASE_* variables).
 *
 * FIRESTORE RULES (set in Firebase Console → Firestore → Rules):
 * For development, use:
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /{document=**} { allow read, write: if true; }
 *     }
 *   }
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Always configured — credentials live in .env
export const isFirebaseConfigured = true;

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase connected to project:', firebaseConfig.projectId);
} catch (err) {
  console.error('❌ Firebase initialization failed:', err);
}

export { db };
export default app;

// ── Firestore Collection References ──────────────────────────────────────────
// These are the Firestore collection names used throughout the app.
export const COLLECTIONS = {
  EVENTS:        'events',
  BOOKINGS:      'bookings',
  USERS:         'users',
  WAITING_QUEUES:'waitingQueues',
  SEAT_QUEUES:   'seatQueues',
  APP_META:      'appMeta',   // stores initialization flag
};
