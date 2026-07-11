// ===========================================================
// MAMATA — Admin dashboard
// ===========================================================

function adminGuard(onReady) {
  auth.onAuthStateChanged(user => {
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("adminEmail").textContent = user.email;
    onReady();
  });
}

function switchTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(el => el.style.display = "none");
  document.querySelectorAll("[data-tab-btn]").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + tab).style.display = "block";
  document.querySelector(`[data-tab-btn="${tab}"]`).classList.add("active");
  if (tab === "orders") loadOrdersAdmin();
  if (tab === "affiliates") loadAffiliatesAdmin();
  if (tab === "analytics") loadAnalytics();
  if (tab === "chat") loadChatsAdmin();
}

/* ---------------- ORDERS ---------------- */
const revealedPhones = new Set();

function loadOrdersAdmin() {
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = `<tr><td colspan="6" class="muted center" style="padding:30px;">লোড হচ্ছে...</td></tr>`;
  col.orders.orderBy("createdAt", "desc").limit(100).get().then(snap => {
    if (snap.empty) { tbody.innerHTML = `<tr><td colspan="6" class="center muted" style="padding:30px;">এখনো কোনো অর্ডার নেই।</td></tr>`; return; }
    tbody.innerHTML = snap.docs.map(d => {
      const o = d.data();
      const phoneShown = revealedPhones.has(d.id) ? o.customer.phone : maskPhone(o.customer.phone);
      return `
      <tr>
        <td><code style="font-size:.78rem;">${d.id.slice(0, 8)}</code></td>
        <td>${o.customer.name}<br><span class="muted" style="font-size:.8rem;">
          ${phoneShown} <a href="#" onclick="revealedPhones.${revealedPhones.has(d.id) ? "delete" : "add"}('${d.id}');loadOrdersAdmin();return false;" style="text-decoration:underline;">${revealedPhones.has(d.id) ? "লুকান" : "দেখুন"}</a></span></td>
        <td>${o.items.length} আইটেম</td>
        <td style="font-weight:700;">${bdt(o.total)}</td>
        <td>${o.referredBy ? `<span class="pill delivered">@${o.referredBy}</span>` : "—"}</td>
        <td>
          <select onchange="updateOrderStatus('${d.id}', this.value)" class="pill ${o.status}" style="border:none;">
            <option value="processing" ${o.status === "processing" ? "selected" : ""}>প্রসেসিং</option>
            <option value="shipped" ${o.status === "shipped" ? "selected" : ""}>শিপড</option>
            <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>ডেলিভারড</option>
            <option value="cancelled" ${o.status === "cancelled" ? "selected" : ""}>বাতিল</option>
          </select>
        </td>
      </tr>`;
    }).join("");
  });
}

function updateOrderStatus(id, status) {
  col.orders.doc(id).update({ status }).then(() => { toast("অর্ডারের স্ট্যাটাস আপডেট হয়েছে", "success"); loadOrdersAdmin(); });
}

/* ---------------- AFFILIATES ---------------- */
function loadAffiliatesAdmin() {
  const tbody = document.getElementById("affiliatesBody");
  tbody.innerHTML = `<tr><td colspan="6" class="center muted" style="padding:30px;">লোড হচ্ছে...</td></tr>`;
  col.affiliates.orderBy("totalEarnings", "desc").get().then(snap => {
    if (snap.empty) { tbody.innerHTML = `<tr><td colspan="6" class="center muted" style="padding:30px;">কোনো অ্যাফিলিয়েট নেই।</td></tr>`; return; }
    tbody.innerHTML = snap.docs.map(d => {
      const a = d.data();
      return `
      <tr>
        <td>@${a.username}</td>
        <td>${a.name || "—"}</td>
        <td>${a.referralCount || 0}</td>
        <td>${bdt(a.totalEarnings || 0)}</td>
        <td>${bdt(a.pendingPayout || 0)}</td>
        <td class="flex gap-10">
          <input type="number" value="${a.commissionValue}" style="width:64px;padding:5px;border:1px solid var(--line);border-radius:6px;" id="rate-${d.id}">
          <select id="type-${d.id}" style="padding:5px;border:1px solid var(--line);border-radius:6px;">
            <option value="percent" ${a.commissionType === "percent" ? "selected" : ""}>%</option>
            <option value="fixed" ${a.commissionType === "fixed" ? "selected" : ""}>৳</option>
          </select>
          <button class="btn btn-sm btn-outline" onclick="saveCommission('${d.id}')">সংরক্ষণ</button>
          <button class="btn btn-sm btn-secondary" onclick="markPaid('${d.id}')">পরিশোধিত</button>
        </td>
      </tr>`;
    }).join("");
  });
}

function saveCommission(id) {
  const value = parseFloat(document.getElementById("rate-" + id).value);
  const type = document.getElementById("type-" + id).value;
  col.affiliates.doc(id).update({ commissionValue: value, commissionType: type })
    .then(() => toast("কমিশন আপডেট হয়েছে", "success"));
}

function markPaid(id) {
  col.affiliates.doc(id).update({ pendingPayout: 0 }).then(() => { toast("পেআউট পরিশোধিত হিসেবে চিহ্নিত হয়েছে", "success"); loadAffiliatesAdmin(); });
}

/* ---------------- ANALYTICS ---------------- */
function loadAnalytics() {
  Promise.all([col.orders.get(), col.users.get(), col.affiliates.get()]).then(([ordersSnap, usersSnap, affSnap]) => {
    const orders = ordersSnap.docs.map(d => d.data());
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingPayouts = affSnap.docs.reduce((s, d) => s + (d.data().pendingPayout || 0), 0);
    document.getElementById("statOrders").textContent = orders.length;
    document.getElementById("statRevenue").textContent = bdt(revenue);
    document.getElementById("statCustomers").textContent = usersSnap.size;
    document.getElementById("statAffiliates").textContent = affSnap.size;
    document.getElementById("statPending").textContent = bdt(pendingPayouts);

    const byStatus = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => { if (byStatus[o.status] !== undefined) byStatus[o.status]++; });
    document.getElementById("statusBreakdown").innerHTML = Object.entries(byStatus).map(([k, v]) =>
      `<div class="flex justify-between" style="padding:8px 0;border-bottom:1px solid var(--line);">
        <span class="pill ${k}">${statusLabel(k)}</span><span style="font-weight:700;">${v}</span></div>`).join("");
  });
}

function statusLabel(s) {
  return { processing: "প্রসেসিং", shipped: "শিপড", delivered: "ডেলিভারড", cancelled: "বাতিল" }[s] || s;
}

/* ---------------- CHAT ---------------- */
let activeChatId = null;

function loadChatsAdmin() {
  const list = document.getElementById("chatThreadList");
  col.chats.orderBy("updatedAt", "desc").onSnapshot(snap => {
    if (snap.empty) { list.innerHTML = `<p class="muted center" style="padding:20px;">কোনো চ্যাট নেই।</p>`; return; }
    list.innerHTML = snap.docs.map(d => {
      const c = d.data();
      return `<div class="flex justify-between items-center" style="padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;
        background:${activeChatId === d.id ? 'var(--rose-tint)' : 'transparent'};" onclick="openAdminChat('${d.id}','${(c.name||'অতিথি').replace(/'/g,"")}')">
        <div>
          <div style="font-weight:700;font-size:.9rem;">${c.name || "অতিথি"}</div>
          <div class="muted" style="font-size:.78rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.lastMessage || ""}</div>
        </div>
        ${c.unreadForAdmin ? '<span class="badge" style="position:static;">●</span>' : ""}
      </div>`;
    }).join("");
  });
}

function openAdminChat(chatId, name) {
  activeChatId = chatId;
  document.getElementById("chatActiveName").textContent = name;
  document.getElementById("chatAdminPanel").style.display = "flex";
  col.chats.doc(chatId).update({ unreadForAdmin: false });

  col.messages.where("chatId", "==", chatId).orderBy("createdAt", "asc").onSnapshot(snap => {
    const box = document.getElementById("chatAdminMessages");
    box.innerHTML = "";
    snap.forEach(doc => {
      const m = doc.data();
      const mine = m.sender === "admin";
      box.innerHTML += `<div style="margin-bottom:10px;display:flex;justify-content:${mine ? "flex-end" : "flex-start"};">
        <div style="max-width:70%;padding:8px 12px;border-radius:14px;
          background:${mine ? "var(--rose)" : "var(--cream-deep)"};color:${mine ? "#fff" : "var(--plum)"};">${m.text}</div></div>`;
    });
    box.scrollTop = box.scrollHeight;
  });
}

function sendAdminReply(e) {
  e.preventDefault();
  if (!activeChatId) return;
  const input = document.getElementById("chatAdminInput");
  const text = input.value.trim();
  if (!text) return;
  col.messages.add({ chatId: activeChatId, sender: "admin", text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  col.chats.doc(activeChatId).update({ lastMessage: text, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), unreadForUser: true });
  input.value = "";
}
