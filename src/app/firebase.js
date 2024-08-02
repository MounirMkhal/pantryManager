// app/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { metadata } from './metadata';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdl447m5wU0YXCuj5qSF8PzQeXUrxLINU",
  authDomain: "pantryapp-96403.firebaseapp.com",
  projectId: "pantryapp-96403",
  storageBucket: "pantryapp-96403.appspot.com",
  messagingSenderId: "151112188824",
  appId: "1:151112188824:web:34e5ad2efbd0ce7dcae1ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
