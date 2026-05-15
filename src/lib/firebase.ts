import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";

// Aide à la résolution d'environnement (Frontend Vite vs Backend Node)
const getEnvVar = (key: string, viteKey: string, fallback: string) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore (import.meta.env n'est pas toujours typé pour Node)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
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

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully with Project ID:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization error. Please check your environment variables:", firebaseConfig);
  console.error(error);
}

export const db = getFirestore(app);
export { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit };
