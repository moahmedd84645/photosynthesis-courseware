// Firebase Modular SDK v10 Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7eylJHWzcLsBhmp5FTrmbOHZGiYElZYg",
  authDomain: "photosynthesis-mastery.firebaseapp.com",
  projectId: "photosynthesis-mastery",
  storageBucket: "photosynthesis-mastery.firebasestorage.app",
  messagingSenderId: "496724114646",
  appId: "1:496724114646:web:7cafe3fbc1486b3cb81d77",
  measurementId: "G-HPEQ2EY80V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
};
