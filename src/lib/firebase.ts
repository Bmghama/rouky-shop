import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";

const getBrowserEnv = () => {
  // Fix TS: `import.meta.env` peut ne pas être reconnu selon la config TS.
  const meta = import.meta as { env?: Record<string, string> };
  if (typeof meta !== "undefined" && meta.env) return meta.env;
  return {} as Record<string, string>;
};

const getEnvVar = (key: string, viteKey: string, fallback: string) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  const browserEnv = getBrowserEnv();
  if (browserEnv && browserEnv[viteKey]) {
    return browserEnv[viteKey] as string;
  }

  return fallback;
};

const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY', "AIzaSyC8_CcAsCq6ZgSscO-EfrIx3cqb6CctTlQ"),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN', "rouky-shop.firebaseapp.com"),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID', "rouky-shop"),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET', "rouky-shop.firebasestorage.app"),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', "283612958900"),
  appId: getEnvVar('FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID', "1:283612958900:web:e88f1e6c167f3eb20347e1"),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', 'VITE_FIREBASE_MEASUREMENT_ID', "G-4DVVN2K6R9")
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit };
