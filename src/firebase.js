import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnhjb-gwaPOUghPdWOpDbAeI8yXNVt7bg",
  authDomain: "serenity-b4b72.firebaseapp.com",
  projectId: "serenity-b4b72",
  storageBucket: "serenity-b4b72.firebasestorage.app",
  messagingSenderId: "749474732425",
  appId: "1:749474732425:web:143a6e2fd1b20f2382a958",
  measurementId: "G-WFLEV3WFNR"
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