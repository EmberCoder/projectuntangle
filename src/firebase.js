import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const ONBOARDING_KEY = 'serenity_onboarding_status';

export const getOnboardingStatus = (email) => {
  if (!email) return 'incomplete';

  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const statuses = raw ? JSON.parse(raw) : {};
    const status = statuses[email.toLowerCase()];
    return status || 'incomplete';
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
    // ignore storage issues in restricted environments
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
    // ignore storage issues in restricted environments
  }
};

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);