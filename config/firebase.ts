import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration - only API key from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "detective-ai-game-generator.firebaseapp.com",
  projectId: "detective-ai-game-generator",
  storageBucket: "detective-ai-game-generator.firebasestorage.app",
  messagingSenderId: "581515172624",
  appId: "1:581515172624:web:dbe65e0227709944ef6395",
  measurementId: "G-636ES78QB4"
};

// Validate that API key is present
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API key is missing. Please check your environment variables.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, storage };