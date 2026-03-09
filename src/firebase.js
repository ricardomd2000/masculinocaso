import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCLbl03LWFSZct-i0X9iUL7UxtevjBYRfM",
    authDomain: "scapecerebeloydorso.firebaseapp.com",
    projectId: "scapecerebeloydorso",
    storageBucket: "scapecerebeloydorso.firebasestorage.app",
    messagingSenderId: "333880833025",
    appId: "1:333880833025:web:02521ff53b3b4b06547c00",
    measurementId: "G-95WLTQHHTC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
