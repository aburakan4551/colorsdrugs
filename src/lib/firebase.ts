// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBCTEmastiOgvmTDu1EHxA0bkDAws00bIU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "colorstests-573ef.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://colorstests-573ef-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "colorstests-573ef",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "colorstests-573ef.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "94361461929",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:94361461929:web:b34ad287c782710415f5b8"
};

// Initialize Firebase only in browser environment
let app: any = null;
let auth: any = null;
let db: any = null;

if (typeof window !== 'undefined') {
  // Initialize Firebase only if not already initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export Firebase services
export { auth, db };

// Export the app instance
export default app;
