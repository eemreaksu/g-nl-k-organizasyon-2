import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "decathlon-org-2026ae",
  appId: "1:762785787645:web:41c07713e3f5fb58031894",
  storageBucket: "decathlon-org-2026ae.firebasestorage.app",
  apiKey: "AIzaSyBPefQ9zOKYXQjXl2gncq6RnrzR5gsa5Os",
  authDomain: "decathlon-org-2026ae.firebaseapp.com",
  messagingSenderId: "762785787645"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
