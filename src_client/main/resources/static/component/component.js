/* ====================================================
   components.js — tự inject Navbar + Footer
   Không cần fetch file ngoài, không cần server
   ==================================================== */

// ── Detect base path ─────────────────────────────────
// If current page is inside /pages/ folder, use "../" to go up.
// If current page is at root (e.g. home.html), use "" (same level).
const _path = location.pathname.replace(/\\/g, '/');
const _inPages = _path.includes('/pages/');
const ROOT = _inPages ? '../' : '';        // path to static/ root
const PAGES = _inPages ? '' : 'pages/';    // path to pages/ folder

// ── NAVBAR HTML ──────────────────────────────────────
const NAVBAR_HTML = `
<nav class="navbar" id="mainNavbar">
    <div class="navbar-inner">
        <a href="${ROOT}home.html" class="navbar-logo">
            <span class="logo-icon">☕</span>
            <span class="logo-text">Hai Gau<em>Coffee</em></span>
        </a>
        <ul class="navbar-links">
            <li><a href="${ROOT}home.html"              class="nav-link">Home</a></li>
            <li><a href="${PAGES}products.html"   class="nav-link">Products</a></li>
            <li><a href="${PAGES}about.html"      class="nav-link">About Us</a></li>
            <li><a href="${PAGES}visit.html"      class="nav-link">Visit</a></li>
        </ul>
        <div class="navbar-auth">
            <a href="${PAGES}signin.html" class="btn-register" rel="noopener">Register</a>
            <a href="${PAGES}login.html"  class="btn-login"    rel="noopener">Login</a>
        </div>
        <button class="navbar-toggle" id="navToggle" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    </div>
    <div class="navbar-mobile" id="navMobile">
        <ul>
            <li><a href="${ROOT}home.html"              class="nav-link">Home</a></li>
            <li><a href="${PAGES}products.html"   class="nav-link">Products</a></li>
            <li><a href="${PAGES}about.html"      class="nav-link">About Us</a></li>
            <li><a href="${PAGES}visit.html"      class="nav-link">Visit</a></li>
        </ul>
        <div class="mobile-auth">
            <a href="${PAGES}signin.html" class="btn-register" rel="noopener">Register</a>
            <a href="${PAGES}login.html"  class="btn-login"    rel="noopener">Login</a>
        </div>
    </div>
</nav>`;

// ── FOOTER HTML ──────────────────────────────────────
const FOOTER_HTML = `
<footer class="site-footer">
    <div class="footer-inner">
        <div class="footer-brand">
            <div class="footer-logo">
                <span class="logo-icon">☕</span>
                <span class="logo-text">Hai Gau<em>Coffee</em></span>
            </div>
            <p class="footer-tagline">Chậm lại. Thưởng thức. Sống trọn.</p>
            <p class="footer-est">Est. 2018 — Hà Nội, Việt Nam</p>
            <div class="footer-socials">
                <a href="https://facebook.com/haigaucoffee" target="_blank" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://instagram.com/haigaucoffee" target="_blank" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://tiktok.com/@haigaucoffee" target="_blank" aria-label="TikTok">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
                </a>
            </div>
        </div>
        <div class="footer-col">
            <h4 class="footer-heading">Khám phá</h4>
            <ul>
                <li><a href="${ROOT}home.html">Home</a></li>
                <li><a href="${PAGES}products.html">Thực đơn</a></li>
                <li><a href="${PAGES}about.html">Về chúng tôi</a></li>
                <li><a href="${PAGES}visit.html">Ghé thăm</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4 class="footer-heading">Giờ mở cửa</h4>
            <ul class="footer-hours">
                <li><span>Thứ 2 – Thứ 6</span><span>7:00 – 22:00</span></li>
                <li><span>Thứ 7 – CN</span><span>7:00 – 23:00</span></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4 class="footer-heading">Liên hệ</h4>
            <ul class="footer-contact">
                <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    123 Đường Láng, Đống Đa, Hà Nội
                </li>
                <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    0912 345 678
                </li>
                <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    hello@haigaucoffee.vn
                </li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>© 2025 Hai Gau Coffee. All rights reserved.</p>
        <p>Made with ☕ in Hà Nội</p>
    </div>
</footer>`;

// ── INJECT + INIT ─────────────────────────────────────
function initComponents() {
    // Inject thẳng vào DOM, không cần fetch
    const navEl = document.getElementById('navbar-placeholder');
    const footEl = document.getElementById('footer-placeholder');
    if (navEl)  navEl.outerHTML  = NAVBAR_HTML;
    if (footEl) footEl.outerHTML = FOOTER_HTML;

    // Highlight active link
    const currentPage = location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('active');
        }
    });

    // Navbar scroll effect
    const navbar = document.getElementById('mainNavbar');
    const animSection = document.querySelector(".animation-section");

    if (!animSection) {
        // Trang không có animation-section → màu sẵn luôn, không scroll listener
        document.body.style.paddingTop = "72px";
        navbar?.classList.add("scrolled");
    } else {
        // Trang home → trong suốt, đổi màu khi animation-section hết
        const onScroll = () => {
            const rect = animSection.getBoundingClientRect();
            navbar.classList.toggle("scrolled", rect.bottom <= 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Hamburger mobile
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('navMobile');
    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }
}

// Chạy ngay khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}