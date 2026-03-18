// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNL9v970d26ilA7lOkTwuesgXTA0coPkk",
    authDomain: "extrapaga-3046b.firebaseapp.com",
    projectId: "extrapaga-3046b",
    storageBucket: "extrapaga-3046b.firebasestorage.app",
    messagingSenderId: "48311362822",
    appId: "1:48311362822:web:febfffe736620c89666a87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);