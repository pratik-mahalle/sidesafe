import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAg0sl524ZqQt8w5x7dNZBrUahSqr0mbgE",
  authDomain: "safeshield-891d7.firebaseapp.com",
  projectId: "safeshield-891d7",
  storageBucket: "safeshield-891d7.firebasestorage.app",
  messagingSenderId: "27017776092",
  appId: "1:27017776092:web:2569160b3da949d9549d19",
  measurementId: "G-ZLTS2FBDFQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// For development, you can connect to Firestore emulator
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { app };