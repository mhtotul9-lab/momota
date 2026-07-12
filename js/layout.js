// ===========================================================
// MAMATA — Shared layout (header, footer, floating chat button)
// Each page includes: <div id="site-header"></div> ... <div id="site-footer"></div>
// and sets <body data-page="home|shop|community|affiliate|cart|product">
// ===========================================================

function renderHeader() {
  const page = document.body.dataset.page || "";
  const link = (href, key, label) =>
    `<a href="${href}" class="${page === key ? "active" : ""}">${label}</a>`;

  return `
  <div class="topbar">✨ প্রথম অর্ডারে ফ্রি ডেলিভারি — কোড: <strong>MAMATA50</strong></div>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo"><img src="assets/logo-mark.svg" alt="" class="mark"> Mamata</a>
      <nav class="nav">
        ${link("index.html", "home", "হোম")}
        ${link("shop.html", "shop", "শপ")}
        ${link("community.html", "community", "কমিউনিটি")}
        ${link("affiliate.html", "affiliate", "রেফারেল")}
      </nav>
      <div class="header-actions">
        <a href="cart.html" class="icon-btn" title="কার্ট">🛍️<span class="badge" data-cart-badge style="display:none">0</span></a>
        <a href="login.html" class="icon-btn" data-auth-guest title="লগইন">👤</a>
        <a href="account.html" class="icon-btn" data-auth-user style="display:none" title="আমার অ্যাকাউন্ট">👤</a>
        <button class="hamburger">☰</button>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo" style="color:#fff;margin-bottom:10px;"><img src="assets/logo-mark.svg" alt="" class="mark"> Mamata</a>
          <p style="color:#D8C7BE;font-size:.92rem;max-width:280px;">মমতা — বাংলাদেশের বাবা-মায়েদের জন্য যত্নশীল প্যারেন্টিং কমিউনিটি ও বেবি প্রোডাক্ট প্ল্যাটফর্ম।</p>
        </div>
        <div>
          <h5>এক্সপ্লোর</h5>
          <a href="index.html">হোম</a>
          <a href="shop.html">শপ</a>
          <a href="community.html">কমিউনিটি</a>
          <a href="affiliate.html">রেফারেল প্রোগ্রাম</a>
        </div>
        <div>
          <h5>সহায়তা</h5>
          <a href="cart.html">কার্ট ও চেকআউট</a>
          <a href="#" onclick="openChatWidget();return false;">লাইভ চ্যাট</a>
          <a href="login.html">লগইন / সাইনআপ</a>
        </div>
        <div>
          <h5>যোগাযোগ</h5>
          <a href="tel:+8800000000">📞 +880-XXX-XXXXXX</a>
          <a href="mailto:hello@mamata.app">✉️ hello@mamata.app</a>
          <a href="#">ঢাকা, বাংলাদেশ</a>
        </div>
      </div>
      <div class="footer-bottom">© <span data-year></span> Mamata (মমতা). সকল অধিকার সংরক্ষিত।</div>
    </div>
  </footer>
  <div id="chat-widget-root"></div>`;
}

function injectLayout() {
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.innerHTML = renderHeader();
  if (f) f.innerHTML = renderFooter();
  initMobileNav();
  updateCartBadge();
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (typeof mountChatWidget === "function") mountChatWidget();
}

document.addEventListener("DOMContentLoaded", injectLayout);
