import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "km_bl1qeuab3oi2fc1stplvp5jt5jpvfypn",
  authDomain: "Futurecapsule.firebaseapp.com",
  projectId: "c8e6dfa",
  storageBucket: "https://firebase.google.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "Futureecapsule"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);



