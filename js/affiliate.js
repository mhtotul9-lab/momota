// ===========================================================
// MAMATA — Affiliate dashboard
// ===========================================================

function loadAffiliateDashboard() {
  const joinPanel = document.getElementById("affiliateJoin");
  const dashPanel = document.getElementById("affiliateDash");
  const gate = document.getElementById("affiliateGate");
  if (!joinPanel) return;

  auth.onAuthStateChanged(user => {
    if (!user) {
      gate.style.display = "block";
      joinPanel.style.display = "none";
      dashPanel.style.display = "none";
      return;
    }
    gate.style.display = "none";

    col.affiliates.where("uid", "==", user.uid).limit(1).get().then(snap => {
      if (snap.empty) {
        joinPanel.style.display = "block";
        dashPanel.style.display = "none";
      } else {
        joinPanel.style.display = "none";
        dashPanel.style.display = "block";
        renderDashboard(snap.docs[0].data());
      }
    });
  });
}

function joinAffiliateProgram(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  const username = document.getElementById("affUsername").value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!username) { toast("সঠিক ইউজারনেম দিন (শুধু ইংরেজি অক্ষর/সংখ্যা)", "error"); return; }

  col.affiliates.where("username", "==", username).limit(1).get().then(snap => {
    if (!snap.empty) { toast("এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে", "error"); return; }
    col.affiliates.add({
      uid: user.uid, username,
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
      commissionType: "percent", commissionValue: 8,
      totalEarnings: 0, pendingPayout: 0, referralCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => { toast("স্বাগতম, আপনি এখন একজন অ্যাফিলিয়েট! 🎉", "success"); loadAffiliateDashboard(); });
  });
}

function renderDashboard(aff) {
  document.getElementById("affLink").value = `${window.location.origin}${window.location.pathname.replace("affiliate.html", "")}?ref=${aff.username}`;
  document.getElementById("affEarnings").textContent = bdt(aff.totalEarnings || 0);
  document.getElementById("affPending").textContent = bdt(aff.pendingPayout || 0);
  document.getElementById("affCount").textContent = aff.referralCount || 0;
  document.getElementById("affRate").textContent = aff.commissionType === "percent" ? `${aff.commissionValue}%` : bdt(aff.commissionValue);
}

function copyAffLink() {
  const input = document.getElementById("affLink");
  input.select();
  navigator.clipboard.writeText(input.value).then(() => toast("লিংক কপি হয়েছে!", "success"));
}

document.addEventListener("DOMContentLoaded", loadAffiliateDashboard);
