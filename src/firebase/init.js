// src/firebase/init.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  FacebookAuthProvider,
  GoogleAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu6IwDM-_vaYjBCqnqTp-N5USiVxR8XDw",
  authDomain: "miniban-125e0.firebaseapp.com",
  databaseURL: "https://miniban-125e0-default-rtdb.firebaseio.com",
  projectId: "miniban-125e0",
  storageBucket: "miniban-125e0.firebasestorage.app",
  messagingSenderId: "693272717506",
  appId: "1:693272717506:web:d1a4c9ee8c33bd5258335b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Persist auth state in localStorage so reloads keep you signed in
setPersistence(auth, browserLocalPersistence);

// Export OAuth providers
export const facebookProvider = new FacebookAuthProvider();
export const googleProvider   = new GoogleAuthProvider();

// Firestore instance
export const db = getFirestore(app);
export default db;
