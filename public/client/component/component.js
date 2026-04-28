/* ====================================================
   components.js — tự inject Navbar + Footer + Cart
   Vanilla JS thuần, dùng localStorage để lưu cart
   ==================================================== */

// ── Detect base path ─────────────────────────────────
const _path = location.pathname.replace(/\\/g, '/');
const _pageAliases = new Set(['/reset-password', '/forgot-password']);
const _inPages = _path.includes('/pages/') || _pageAliases.has(_path);
const ROOT = _inPages ? '../' : '';
const PAGES = _inPages ? '' : 'pages/';

// ════════════════════════════════════════════════════
// CART STORE — thay thế Zustand bằng localStorage
// ════════════════════════════════════════════════════
const CART_KEY = 'coffee-shop-cart';

const CartStore = {
    getItems() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    },
    _save(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
    },
    addItem(product) {
        const items = this.getItems();
        const idx = items.findIndex(i => i.id === product.id);
        if (idx > -1) { items[idx].quantity = Math.min(50, items[idx].quantity + 1); }
        else { items.push({ ...product, quantity: 1 }); }
        this._save(items);
    },
    removeItem(id) {
        this._save(this.getItems().filter(i => i.id !== id));
    },
    updateQuantity(id, quantity) {
        this._save(
            this.getItems()
                .map(i => i.id === id ? { ...i, quantity: Math.min(50, Math.max(0, quantity)) } : i)
                .filter(i => i.quantity > 0)
        );
    },
    clearCart() { this._save([]); },
    totalItems() { return this.getItems().reduce((sum, i) => sum + i.quantity, 0); },
    totalPrice() { return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0); },
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
};

window.CartStore = CartStore;


// ── NAVBAR HTML ──────────────────────────────────────
const NAVBAR_HTML = `
<nav class="navbar" id="mainNavbar">
    <div class="navbar-inner">
        <a href="${ROOT}index.html" class="navbar-logo">
            <span class="logo-icon">☕</span>
            <span class="logo-text">Hai Gau<em>Coffee</em></span>
        </a>
        <ul class="navbar-links">
            <li><a href="${ROOT}index.html"        class="nav-link">Trang chủ</a></li>
            <li><a href="${PAGES}products.html"   class="nav-link">Sản phẩm</a></li>
            <li><a href="${PAGES}about.html"      class="nav-link">Về chúng tôi</a></li>
            <li><a href="${PAGES}visit.html"      class="nav-link">Ghé thăm</a></li>
        </ul>
        <div class="navbar-auth">
            <a href="${PAGES}signin.html" class="btn-register" id="navBtnRegister" rel="noopener">Đăng ký</a>
            <a href="${PAGES}login.html"  class="btn-login"    id="navBtnLogin"    rel="noopener">Đăng nhập</a>

            <!-- CART ICON — ẩn mặc định, chỉ hiện khi đã login -->
            <button class="cart-btn" id="cartBtn" aria-label="Giỏ hàng" style="display:none">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span class="cart-badge" id="cartBadge" style="display:none">0</span>
            </button>
        </div>
        <button class="navbar-toggle" id="navToggle" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    </div>

    <!-- MINI CART DROPDOWN -->
    <div class="cart-dropdown" id="cartDropdown" style="display:none">
        <div class="cart-dropdown-header">
            <span class="cart-dropdown-title">Giỏ hàng</span>
            <button class="cart-clear-btn" id="cartClearBtn">Xóa tất cả</button>
        </div>
        <div class="cart-dropdown-items" id="cartDropdownItems"></div>
        <div class="cart-dropdown-footer" id="cartDropdownFooter"></div>
    </div>

    <div class="navbar-mobile" id="navMobile">
        <ul>
            <li><a href="${ROOT}index.html"        class="nav-link">Trang chủ</a></li>
            <li><a href="${PAGES}products.html"   class="nav-link">Sản phẩm</a></li>
            <li><a href="${PAGES}about.html"      class="nav-link">Về chúng tôi</a></li>
            <li><a href="${PAGES}visit.html"      class="nav-link">Ghé thăm</a></li>
        </ul>
        <div class="mobile-auth">
            <a href="${PAGES}signin.html" class="btn-register" id="mobileBtnRegister" rel="noopener">Đăng ký</a>
            <a href="${PAGES}login.html"  class="btn-login"    id="mobileBtnLogin"    rel="noopener">Đăng nhập</a>
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
                <li><a href="${ROOT}index.html">Trang chủ</a></li>
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

// ── CART CSS ──────────────────────────────────────────
const CART_CSS = `
<style id="cart-styles">
.cart-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background 0.2s;
    margin-left: 8px;
}
.cart-btn:hover { background: rgba(255,255,255,0.12); }
.cart-badge {
    position: absolute;
    top: -2px; right: -4px;
    background: #e74c3c;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    pointer-events: none;
}
.cart-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 16px;
    width: 340px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    z-index: 9999;
    overflow: hidden;
    animation: cartFadeIn 0.18s ease;
}
@keyframes cartFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
}
.cart-dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 12px;
    border-bottom: 1px solid #f0ede8;
}
.cart-dropdown-title { font-size: 15px; font-weight: 700; color: #2c1a0e; }
.cart-clear-btn {
    background: none; border: none; cursor: pointer;
    font-size: 12px; color: #999;
    padding: 4px 8px; border-radius: 6px;
    transition: color 0.2s, background 0.2s;
}
.cart-clear-btn:hover { color: #e74c3c; background: #ffeaea; }
.cart-dropdown-items { max-height: 280px; overflow-y: auto; padding: 8px 0; }
.cart-dropdown-items::-webkit-scrollbar { width: 4px; }
.cart-dropdown-items::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
.cart-empty { text-align: center; padding: 32px 20px; color: #aaa; font-size: 14px; }
.cart-empty-icon { font-size: 36px; margin-bottom: 8px; }
.cart-item-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 20px; transition: background 0.15s;
}
.cart-item-row:hover { background: #faf7f4; }
.cart-item-img {
    width: 48px; height: 48px; border-radius: 10px;
    object-fit: cover; flex-shrink: 0; background: #f0ede8;
}
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name {
    font-size: 13px; font-weight: 600; color: #2c1a0e;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cart-item-price { font-size: 12px; color: #8B5E3C; margin-top: 2px; }
.cart-item-qty { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.cart-qty-btn {
    width: 24px; height: 24px; border: 1.5px solid #ddd;
    background: #fff; border-radius: 6px; cursor: pointer;
    font-size: 14px; display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s; color: #555;
}
.cart-qty-btn:hover { border-color: #8B5E3C; color: #8B5E3C; }
.cart-qty-num { font-size: 13px; font-weight: 600; min-width: 18px; text-align: center; color: #2c1a0e; }
.cart-item-remove {
    background: none; border: none; cursor: pointer;
    color: #ccc; font-size: 16px; padding: 4px;
    border-radius: 6px; transition: color 0.2s; flex-shrink: 0;
}
.cart-item-remove:hover { color: #e74c3c; }
.cart-dropdown-footer { border-top: 1px solid #f0ede8; padding: 14px 20px 16px; }
.cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.cart-total-label { font-size: 13px; color: #888; }
.cart-total-price { font-size: 16px; font-weight: 700; color: #2c1a0e; }
.cart-checkout-btn {
    width: 100%; padding: 12px;
    background: #2c1a0e; color: #fff;
    border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
}
.cart-checkout-btn:hover { background: #8B5E3C; }

/* Logout button style */
#btnLogout, #mobileLogout {
    background: none;
    border: 1.5px solid currentColor;
    border-radius: 8px;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s, color 0.2s;
    margin-left: 6px;
}
#btnLogout:hover, #mobileLogout:hover {
    background: rgba(255,255,255,0.15);
}
</style>`;

// ════════════════════════════════════════════════════
// AUTH UI — ẩn/hiện nút dựa theo sessionStorage
// ════════════════════════════════════════════════════
function updateAuthUI() {
    const isLoggedIn = !!sessionStorage.getItem('currentUser');

    // ── Desktop ──
    const btnRegister = document.getElementById('navBtnRegister');
    const btnLogin = document.getElementById('navBtnLogin');
    const cartBtn = document.getElementById('cartBtn');

    if (isLoggedIn) {
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogin) btnLogin.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'flex';

        if (!document.getElementById('btnLogout')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'btnLogout';
            logoutBtn.textContent = 'Đăng xuất';
            logoutBtn.addEventListener('click', handleLogout);
            document.querySelector('.navbar-auth')?.appendChild(logoutBtn);
        }
    } else {
        if (btnRegister) btnRegister.style.display = '';
        if (btnLogin) btnLogin.style.display = '';
        if (cartBtn) cartBtn.style.display = 'none';
        document.getElementById('btnLogout')?.remove();
    }

    // ── Mobile ──
    const mobileBtnRegister = document.getElementById('mobileBtnRegister');
    const mobileBtnLogin = document.getElementById('mobileBtnLogin');

    if (isLoggedIn) {
        if (mobileBtnRegister) mobileBtnRegister.style.display = 'none';
        if (mobileBtnLogin) mobileBtnLogin.style.display = 'none';

        if (!document.getElementById('mobileLogout')) {
            const mobileLogout = document.createElement('button');
            mobileLogout.id = 'mobileLogout';
            mobileLogout.textContent = 'Đăng xuất';
            mobileLogout.addEventListener('click', handleLogout);
            document.querySelector('.mobile-auth')?.appendChild(mobileLogout);
        }
    } else {
        if (mobileBtnRegister) mobileBtnRegister.style.display = '';
        if (mobileBtnLogin) mobileBtnLogin.style.display = '';
        document.getElementById('mobileLogout')?.remove();
    }
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    CartStore.clearCart();
    window.location.href = `${ROOT}index.html`;
}

// ── INJECT + INIT ─────────────────────────────────────
function initComponents() {
    if (!document.getElementById('cart-styles')) {
        document.head.insertAdjacentHTML('beforeend', CART_CSS);
    }

    const navEl = document.getElementById('navbar-placeholder');
    const footEl = document.getElementById('footer-placeholder');
    if (navEl) navEl.outerHTML = NAVBAR_HTML;
    if (footEl) footEl.outerHTML = FOOTER_HTML;

    // Highlight active link
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) link.classList.add('active');
    });

    // Navbar scroll effect
    const navbar = document.getElementById('mainNavbar');
    const animSection = document.querySelector('.animation-section');
    if (!animSection) {
        document.body.style.paddingTop = '72px';
        navbar?.classList.add('scrolled');
    } else {
        const onScroll = () => {
            const rect = animSection.getBoundingClientRect();
            navbar.classList.toggle('scrolled', rect.bottom <= 0);
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

    // Auth UI (login/logout/cart)
    updateAuthUI();

    // Cart UI
    initCart();
}

// ════════════════════════════════════════════════════
// CART UI
// ════════════════════════════════════════════════════
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartDropdown = document.getElementById('cartDropdown');
    const cartClearBtn = document.getElementById('cartClearBtn');

    if (!cartBtn) return;

    renderCartUI();

    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = cartDropdown.style.display === 'block';
        cartDropdown.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!cartDropdown.contains(e.target) && e.target !== cartBtn) {
            cartDropdown.style.display = 'none';
        }
    });

    cartClearBtn?.addEventListener('click', () => {
        if (CartStore.totalItems() === 0) return;
        if (confirm('Xóa toàn bộ giỏ hàng?')) CartStore.clearCart();
    });

    window.addEventListener('cart:updated', () => renderCartUI());
}

function renderCartUI() {
    const badge = document.getElementById('cartBadge');
    const itemsEl = document.getElementById('cartDropdownItems');
    const footerEl = document.getElementById('cartDropdownFooter');

    if (!badge || !itemsEl || !footerEl) return;

    const items = CartStore.getItems();
    const total = CartStore.totalItems();

    badge.style.display = total > 0 ? 'flex' : 'none';
    if (total > 0) badge.textContent = total > 99 ? '99+' : total;

    if (items.length === 0) {
        itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Giỏ hàng trống</p></div>`;
        footerEl.innerHTML = '';
        return;
    }

    itemsEl.innerHTML = items.map(item => `
        <div class="cart-item-row" data-id="${item.id}">
            <img class="cart-item-img" src="${item.image || ''}" alt="${item.name}"
                 onerror="this.src='https://placehold.co/48x48?text=☕'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${CartStore.formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-qty">
                <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                <span class="cart-qty-num">${item.quantity}</span>
                <button class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-remove" data-action="remove" data-id="${item.id}">✕</button>
        </div>
    `).join('');

    footerEl.innerHTML = `
        <div class="cart-total-row">
            <span class="cart-total-label">Tổng cộng</span>
            <span class="cart-total-price">${CartStore.formatPrice(CartStore.totalPrice())}</span>
        </div>
        <button class="cart-checkout-btn" onclick="location.href='${PAGES}checkout.html'">
            Thanh toán →
        </button>`;

    itemsEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            const item = CartStore.getItems().find(i => i.id === id);
            if (action === 'increase') CartStore.updateQuantity(id, (item?.quantity || 0) + 1);
            if (action === 'decrease') CartStore.updateQuantity(id, (item?.quantity || 1) - 1);
            if (action === 'remove') CartStore.removeItem(id);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}
