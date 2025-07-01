// Firebase Authentication service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from './firebase-data';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  createdAt: string;
  lastLoginAt: string;
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0];
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      firstName,
      lastName,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile);
    
    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time
    const userRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);
    await setDoc(userRef, { 
      lastLoginAt: new Date().toISOString() 
    }, { merge: true });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Check if user is admin
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid);
    return userProfile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
