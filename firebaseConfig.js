// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyCf1jd5vT-BuDPYFKngwUzr4GWNSnSc4T0",
	authDomain: "issexpo.firebaseapp.com",
	projectId: "issexpo",
	storageBucket: "issexpo.appspot.com",
	messagingSenderId: "710985456569",
	appId: "1:710985456569:web:5017fe765fd7699f2af468",
	measurementId: "G-3YDS3S6HX9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
