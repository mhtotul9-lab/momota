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
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Admin emails allowed to access /admin panel (add your own admin login email(s))
const ADMIN_EMAILS = [
  "admin@mamata.app"
];
