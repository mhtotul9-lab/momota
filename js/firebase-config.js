// ===========================================================
// MAMATA — Firebase Configuration
// ===========================================================
// 1) Go to https://console.firebase.google.com → your project
//    → Project settings → General → "Your apps" → Web app (</>)
// 2) Copy the config object shown there and paste the values below.
// 3) Enable in the Firebase console:
//      - Build > Authentication > Sign-in method > Email/Password (and/or Phone, Google)
//      - Build > Firestore Database > Create database (start in production mode)
//      - Build > Hosting (optional, if you host on Firebase instead of Vercel)
// ===========================================================

const firebaseConfig = {
  apiKey: "AIzaSyAf2ztjFQ8-dVqqhwhZGPfvvxTAavFbzJY",
  authDomain: "fyt-game.firebaseapp.com",
  databaseURL: "https://fyt-game-default-rtdb.firebaseio.com",
  projectId: "fyt-game",
  storageBucket: "fyt-game.firebasestorage.app",
  messagingSenderId: "701909288134",
  appId: "1:701909288134:web:ecb27f3e90e602389c43c7",
  measurementId: "G-GLBMVYTRPK"
};

// Admin emails allowed to access /admin panel (add your own admin login email(s))
const ADMIN_EMAILS = [
  "admin@mamata.app"
];
