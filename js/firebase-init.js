// ===========================================================
// MAMATA — Firebase init (uses Firebase compat SDK, loaded via CDN in HTML)
// ===========================================================
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---- Collections reference shortcuts ----
const col = {
  products:   db.collection("products"),
  orders:     db.collection("orders"),
  users:      db.collection("users"),
  affiliates: db.collection("affiliates"),
  posts:      db.collection("posts"),
  comments:   db.collection("comments"),
  chats:      db.collection("chats"),      // one doc per conversation thread
  messages:   db.collection("messages"),   // messages, filtered by chatId
  settings:   db.collection("settings"),   // e.g. settings/commission
};
