// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance
export default app;
