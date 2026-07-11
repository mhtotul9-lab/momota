// ===========================================================
// MAMATA — Authentication (Firebase Email/Password)
// ===========================================================

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("suName").value.trim();
  const email = document.getElementById("suEmail").value.trim();
  const phone = document.getElementById("suPhone").value.trim();
  const password = document.getElementById("suPassword").value;
  const btn = document.getElementById("suBtn");
  btn.disabled = true; btn.textContent = "অপেক্ষা করুন...";

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      const referredBy = getActiveReferral();
      return cred.user.updateProfile({ displayName: name }).then(() =>
        col.users.doc(cred.user.uid).set({
          name, email, phone, referredBy: referredBy || null,
          isAffiliate: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
    })
    .then(() => { toast("অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🌸", "success"); window.location.href = "index.html"; })
    .catch(err => { toast(friendlyAuthError(err), "error"); btn.disabled = false; btn.textContent = "অ্যাকাউন্ট তৈরি করুন"; });
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("liEmail").value.trim();
  const password = document.getElementById("liPassword").value;
  const btn = document.getElementById("liBtn");
  btn.disabled = true; btn.textContent = "অপেক্ষা করুন...";

  auth.signInWithEmailAndPassword(email, password)
    .then(() => { toast("লগইন সফল হয়েছে", "success"); window.location.href = "index.html"; })
    .catch(err => { toast(friendlyAuthError(err), "error"); btn.disabled = false; btn.textContent = "লগইন করুন"; });
}

function handleLogout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।",
    "auth/invalid-email": "সঠিক ইমেইল দিন।",
    "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই।",
    "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
    "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
  };
  return map[err.code] || ("ত্রুটি: " + err.message);
}
