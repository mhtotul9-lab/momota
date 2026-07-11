// ===========================================================
// MAMATA — Cart & Checkout
// ===========================================================

function renderCartPage() {
  const list = document.getElementById("cartList");
  const summary = document.getElementById("cartSummary");
  if (!list) return;
  const cart = getCart();

  if (cart.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="ico">🛍️</div><p>আপনার কার্ট খালি।</p>
      <a href="shop.html" class="btn btn-primary mt-16">শপিং করুন</a></div>`;
    if (summary) summary.style.display = "none";
    return;
  }

  list.innerHTML = cart.map(i => `
    <div class="flex items-center justify-between" style="padding:16px 0;border-bottom:1px solid var(--line);">
      <div class="flex items-center gap-10">
        <div style="width:56px;height:56px;background:var(--rose-tint);border-radius:var(--r-sm);
          display:flex;align-items:center;justify-content:center;font-size:1.6rem;">${i.image || "🎁"}</div>
        <div>
          <div style="font-weight:700;">${i.name}</div>
          <div class="muted" style="font-size:.88rem;">${bdt(i.price)} × ${i.qty}</div>
        </div>
      </div>
      <div class="flex items-center gap-10">
        <input type="number" min="1" value="${i.qty}" style="width:56px;padding:6px;border:1px solid var(--line);border-radius:8px;text-align:center;"
          onchange="updateCartQty('${i.id}', parseInt(this.value)||1); renderCartPage();">
        <button class="btn btn-sm btn-outline" onclick="removeFromCart('${i.id}'); renderCartPage();">✕</button>
      </div>
    </div>`).join("");

  if (summary) {
    summary.style.display = "block";
    document.getElementById("cartTotal").textContent = bdt(cartTotal());
  }
}

function submitOrder(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) { toast("কার্ট খালি", "error"); return; }

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true; btn.textContent = "অর্ডার প্রসেস হচ্ছে...";

  const order = {
    items: cart,
    total: cartTotal(),
    customer: {
      name: document.getElementById("coName").value.trim(),
      phone: document.getElementById("coPhone").value.trim(),
      address: document.getElementById("coAddress").value.trim(),
      note: document.getElementById("coNote")?.value.trim() || "",
    },
    status: "processing",
    referredBy: getActiveReferral() || null,
    userId: (typeof auth !== "undefined" && auth.currentUser) ? auth.currentUser.uid : null,
    guest: !(typeof auth !== "undefined" && auth.currentUser),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  col.orders.add(order)
    .then(async (docRef) => {
      // Automatic affiliate commission attribution
      if (order.referredBy) {
        const affSnap = await col.affiliates.where("username", "==", order.referredBy).limit(1).get();
        if (!affSnap.empty) {
          const affDoc = affSnap.docs[0];
          const aff = affDoc.data();
          const commission = aff.commissionType === "percent"
            ? order.total * (aff.commissionValue / 100)
            : aff.commissionValue;
          await col.affiliates.doc(affDoc.id).update({
            pendingPayout: firebase.firestore.FieldValue.increment(commission),
            totalEarnings: firebase.firestore.FieldValue.increment(commission),
            referralCount: firebase.firestore.FieldValue.increment(1),
          });
          await col.orders.doc(docRef.id).update({ commissionAmount: commission });
        }
      }
      localStorage.removeItem(CART_KEY);
      toast("🎉 অর্ডার সফল হয়েছে!", "success");
      window.location.href = `order-success.html?id=${docRef.id}`;
    })
    .catch(err => { toast("অর্ডার ব্যর্থ হয়েছে: " + err.message, "error"); btn.disabled = false; btn.textContent = "অর্ডার সম্পন্ন করুন"; });
}

document.addEventListener("DOMContentLoaded", renderCartPage);
