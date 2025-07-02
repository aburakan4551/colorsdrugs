// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyBCTEmastiOgvmTDu1EHxA0bkDAws00bIU",
  authDomain: "colorstests-573ef.firebaseapp.com",
  databaseURL: "https://colorstests-573ef-default-rtdb.firebaseio.com",
  projectId: "colorstests-573ef",
  storageBucket: "colorstests-573ef.firebasestorage.app",
  messagingSenderId: "94361461929",
  appId: "1:94361461929:web:b34ad287c782710415f5b8"
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
