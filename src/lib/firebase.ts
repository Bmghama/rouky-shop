import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8_CcAsCq6ZgSscO-EfrIx3cqb6CctTlQ",
  authDomain: "rouky-shop.firebaseapp.com",
  projectId: "rouky-shop",
  storageBucket: "rouky-shop.firebasestorage.app",
  messagingSenderId: "283612958900",
  appId: "1:283612958900:web:e88f1e6c167f3eb20347e1",
  measurementId: "G-4DVVN2K6R9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit };
