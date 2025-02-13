
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAzn6d_z3X60zVFpzSjezUu6t53CKqVja4",
  authDomain: "bible-game1.firebaseapp.com",
  projectId: "bible-game1",
  storageBucket: "bible-game1.firebasestorage.app",
  messagingSenderId: "1001847642825",
  appId: "1:1001847642825:web:9f7b546db97ac77cf68b18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };
