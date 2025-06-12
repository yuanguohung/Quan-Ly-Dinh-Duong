// firebaseConfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACCOHMs0kFZFhca5ZtO_rexlLVEaAah4s",
  authDomain: "nutritiontracker-8c86c.firebaseapp.com",
  projectId: "nutritiontracker-8c86c",
  storageBucket: "nutritiontracker-8c86c.firebasestorage.app",
  messagingSenderId: "196835336278",
  appId: "1:196835336278:web:c86a9ca1f65ec539ff1bf7",
  measurementId: "G-NDPE5CE89P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app); // Export the auth instance