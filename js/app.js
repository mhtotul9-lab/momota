// ===========================================================
// MAMATA — Shared app logic (runs on every page)
// ===========================================================

/* ---------- Toast notifications ---------- */
function toast(msg, type = "") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const btn = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

/* ===========================================================
   REFERRAL / AFFILIATE TRACKING
   URL pattern: mamata.app/?ref=username  or  /ref/username (rewritten to ?ref=)
   Stored in both localStorage and a cookie, 30-day expiry.
=========================================================== */
const REF_KEY = "mamata_ref";
const REF_DAYS = 30;

function setReferralCookie(username) {
  const d = new Date();
  d.setTime(d.getTime() + REF_DAYS * 24 * 60 * 60 * 1000);
  document.cookie = `${REF_KEY}=${encodeURIComponent(username)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getReferralCookie() {
  const match = document.cookie.match(new RegExp("(^| )" + REF_KEY + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function captureReferralFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    const payload = { username: ref, capturedAt: Date.now() };
    localStorage.setItem(REF_KEY, JSON.stringify(payload));
    setReferralCookie(ref);
  }
}

// Returns the active referrer username, or null. Falls back cookie -> localStorage.
function getActiveReferral() {
  const cookieVal = getReferralCookie();
  if (cookieVal) return cookieVal;
  const raw = localStorage.getItem(REF_KEY);
  if (!raw) return null;
  try {
    const { username, capturedAt } = JSON.parse(raw);
    const expired = Date.now() - capturedAt > REF_DAYS * 24 * 60 * 60 * 1000;
    if (expired) { localStorage.removeItem(REF_KEY); return null; }
    return username;
  } catch { return null; }
}

/* ===========================================================
   CART — stored in localStorage so guest checkout works seamlessly
   Structure: [{ id, name, price, qty, image }]
=========================================================== */
const CART_KEY = "mamata_cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += qty;
  else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image || "🎁", qty });
  saveCart(cart);
  toast(`"${product.name}" কার্টে যোগ হয়েছে`, "success");
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateCartQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = qty;
    if (item.qty <= 0) return removeFromCart(id);
  }
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-badge]").forEach(el => {
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------- Currency formatter (BDT) ---------- */
function bdt(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD");
}

/* ---------- Phone masking (privacy) ---------- */
function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, 3) + "••••" + phone.slice(-2);
}

/* ---------- Auth-aware header state ---------- */
function initAuthHeader() {
  if (typeof auth === "undefined") return;
  auth.onAuthStateChanged(user => {
    const loginLinks = document.querySelectorAll("[data-auth-guest]");
    const userLinks = document.querySelectorAll("[data-auth-user]");
    loginLinks.forEach(el => el.style.display = user ? "none" : "");
    userLinks.forEach(el => el.style.display = user ? "" : "none");
    document.querySelectorAll("[data-user-name]").forEach(el => {
      el.textContent = user ? (user.displayName || user.email.split("@")[0]) : "";
    });
  });
}

/* ---------- Register service worker (PWA) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = window.location.pathname.includes("/admin/") ? "../sw.js" : "sw.js";
    navigator.serviceWorker.register(base).catch(() => {});
  });
}

/* ---------- Init on every page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  captureReferralFromURL();
  initMobileNav();
  updateCartBadge();
  initAuthHeader();
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
