import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDitge2btU_ZNC26X6F1eAcmofyJ5lp_O4",
  authDomain: "sypto-f3e0e.firebaseapp.com",
  projectId: "sypto-f3e0e",
  storageBucket: "sypto-f3e0e.firebasestorage.app",
  messagingSenderId: "590424608768",
  appId: "1:590424608768:web:bb3b10aac43510dbe688e5",
  measurementId: "G-4XBZSLK2P6"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
