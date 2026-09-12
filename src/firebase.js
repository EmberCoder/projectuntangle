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

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();