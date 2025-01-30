
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAoxVziFmF1MWOmK6y-mYXXRxI4-vwAA6s",
  authDomain: "bible-game-mobile.firebaseapp.com",
  projectId: "bible-game-mobile",
  storageBucket: "bible-game-mobile.firebasestorage.app",
  messagingSenderId: "4928746886",
  appId: "1:4928746886:web:bcb52c4c2d966008aae807"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };
