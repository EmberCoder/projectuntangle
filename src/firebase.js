import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence, updateProfile } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

/**
 * FIXED: Wrap analytics initialization in an async function.
 * This prevents the 'Component analytics has not been registered yet' error
 * caused by top-level execution during the bundling phase.
 */
export const initAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.warn('Firebase Analytics is unavailable:', error);
    return null;
  }
};

const ONBOARDING_KEY = 'serenity_onboarding_status';

export const getOnboardingStatus = (email) => {
  if (!email) return 'incomplete';

  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const statuses = raw ? JSON.parse(raw) : {};
    return statuses[email.toLowerCase()] || 'incomplete';
  } catch {
    return 'incomplete';
  }
};

export const setOnboardingStatus = (email, status) => {
  if (!email) return;

  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const statuses = raw ? JSON.parse(raw) : {};
    statuses[email.toLowerCase()] = status;
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(statuses));
  } catch {
    // Ignore storage issues in restricted environments.
  }
};

export const clearOnboardingStatus = (email) => {
  if (!email) return;

  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const statuses = raw ? JSON.parse(raw) : {};
    delete statuses[email.toLowerCase()];
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(statuses));
  } catch {
    // Ignore storage issues in restricted environments.
  }
};

// Initialize other services
export const auth = getAuth(app);
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const saveProfilePhoto = async (user, photoUrl) => {
  await setDoc(doc(db, 'users', user.uid), { profilePhotoUrl: photoUrl }, { merge: true });
  return photoUrl;
};

export const getProfilePhotoUrl = async (user) => {
  if (!user) return null;

  const profileSnapshot = await getDoc(doc(db, 'users', user.uid));
  return profileSnapshot.exists() ? profileSnapshot.data().profilePhotoUrl || null : null;
};

export const getCurrentUserDisplayName = () => {
  const currentName = auth.currentUser?.displayName?.trim();
  if (currentName) return currentName;

  const savedName = localStorage.getItem('profileDisplayName')?.trim();
  return savedName || 'Your Name';
};

export const saveProfileDisplayName = async (user, name) => {
  if (!user) return 'Your Name';

  const safeName = name.trim() || 'Your Name';

  try {
    await updateProfile(user, { displayName: safeName });
    await user.reload();
    localStorage.setItem('profileDisplayName', safeName);
    return auth.currentUser?.displayName || safeName;
  } catch (error) {
    console.error('Failed to update display name:', error);
    localStorage.setItem('profileDisplayName', safeName);
    return safeName;
  }
};