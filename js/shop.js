// ===========================================================
// MAMATA — Shop listing logic
// ===========================================================

let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = "all";

function productCardHTML(p) {
  return `
  <div class="card product-card">
    <a href="product.html?id=${p.id}" class="thumb" style="text-decoration:none;">
      <span style="font-size:3rem;">${p.image || "🧸"}</span>
      <span class="fav" onclick="event.preventDefault()">🤍</span>
    </a>
    <div class="body">
      <a href="product.html?id=${p.id}"><h4>${p.name}</h4></a>
      <div class="stars">★★★★★ <span class="muted">(${p.reviews || 12})</span></div>
      <div class="price">${bdt(p.price)} ${p.oldPrice ? `<span class="old">${bdt(p.oldPrice)}</span>` : ""}</div>
      <button class="btn btn-primary btn-sm btn-block" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:p.image}).replace(/'/g,"&#39;")})'>কার্টে যোগ করুন</button>
    </div>
  </div>`;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const filtered = ACTIVE_CATEGORY === "all" ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === ACTIVE_CATEGORY);
  grid.innerHTML = filtered.length
    ? filtered.map(productCardHTML).join("")
    : `<div class="empty-state"><div class="ico">🔍</div><p>এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</p></div>`;
}

function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (grid) grid.innerHTML = Array(6).fill('<div class="skeleton" style="height:280px;"></div>').join("");

  col.products.orderBy("createdAt", "desc").get()
    .then(snap => {
      ALL_PRODUCTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (ALL_PRODUCTS.length === 0) ALL_PRODUCTS = FALLBACK_PRODUCTS;
      renderProducts();
      document.dispatchEvent(new CustomEvent("mamata:products-loaded"));
    })
    .catch(() => { ALL_PRODUCTS = FALLBACK_PRODUCTS; renderProducts(); document.dispatchEvent(new CustomEvent("mamata:products-loaded")); });
}

function initCategoryFilters() {
  document.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-category]").forEach(b => b.classList.remove("btn-primary"));
      document.querySelectorAll("[data-category]").forEach(b => b.classList.add("btn-ghost"));
      btn.classList.remove("btn-ghost"); btn.classList.add("btn-primary");
      ACTIVE_CATEGORY = btn.dataset.category;
      renderProducts();
    });
  });
}

// Demo fallback so the page never looks empty before you add real products in Firestore
const FALLBACK_PRODUCTS = [
  { id: "p1", name: "সফট কটন বেবি রোম্পার", price: 450, oldPrice: 600, category: "clothing", image: "👶" },
  { id: "p2", name: "অর্গানিক বেবি লোশন", price: 320, category: "care", image: "🧴" },
  { id: "p3", name: "কাঠের শিক্ষামূলক খেলনা সেট", price: 780, category: "toys", image: "🧩" },
  { id: "p4", name: "ন্যাপি ব্যাগ (প্রিমিয়াম)", price: 1250, oldPrice: 1500, category: "gear", image: "🎒" },
  { id: "p5", name: "বেবি ফিডিং বোতল সেট", price: 540, category: "care", image: "🍼" },
  { id: "p6", name: "নরম প্লাশ টেডি বিয়ার", price: 390, category: "toys", image: "🧸" },
];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  initCategoryFilters();
});
