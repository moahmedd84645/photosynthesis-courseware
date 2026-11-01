// Firebase Modular SDK v10 with Google Auth Provider
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged, 
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs,
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
const googleProvider = new GoogleAuthProvider();

export async function markStationComplete(stationNumber, score = 100) {
  try {
    const stationKey = `station_${stationNumber}`;
    localStorage.setItem(`${stationKey}_completed`, 'true');
    localStorage.setItem(`${stationKey}_score`, score.toString());
    
    // Save to ProgressManager key as well
    try {
      const pmData = JSON.parse(localStorage.getItem('energyJourney_progress') || '{}');
      pmData.completedSections = pmData.completedSections || [];
      if (!pmData.completedSections.includes(stationKey)) {
        pmData.completedSections.push(stationKey);
      }
      pmData.quizScores = pmData.quizScores || {};
      pmData.quizScores[stationKey] = { score, total: 100, percentage: score, date: new Date().toISOString() };
      localStorage.setItem('energyJourney_progress', JSON.stringify(pmData));
    } catch (e) {
      console.warn('Local progress update fallback', e);
    }

    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        [`completedStations.${stationNumber}`]: true,
        [`stationScores.${stationNumber}`]: score,
        lastActive: new Date().toISOString()
      }).catch(async (err) => {
        // If document doesn't exist yet, create it
        await setDoc(userRef, {
          completedStations: { [stationNumber]: true },
          stationScores: { [stationNumber]: score },
          lastActive: new Date().toISOString()
        }, { merge: true });
      });
    }
  } catch (err) {
    console.warn("Could not save to Firestore, stored locally:", err);
  }
}

if (typeof window !== 'undefined') {
  window.markStationComplete = markStationComplete;
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
};
