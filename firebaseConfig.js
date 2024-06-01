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

let timeout;

function startTimeout() {
  // Clears the previous timeout and sets a new one
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    auth.signOut(); // this will trigger onAuthStateChanged
  }, 190000); // 90 seconds auto logout
}

// Listen for changes in auth state (login and logout events)
onAuthStateChanged(auth, (user) => {
  if (user) {
    startTimeout(); // Start or reset the timeout whenever the user logs in
  } else {
    clearTimeout(timeout); // Ensure to clear the timeout if the user logs out manually or the session ends
  }
});

export { auth, startTimeout };
