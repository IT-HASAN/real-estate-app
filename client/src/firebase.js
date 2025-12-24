// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-o-auth.firebaseapp.com",
  projectId: "real-estate-o-auth",
  storageBucket: "real-estate-o-auth.firebasestorage.app",
  messagingSenderId: "595341665614",
  appId: "1:595341665614:web:4cadfdc76b04e70ab96a1f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);