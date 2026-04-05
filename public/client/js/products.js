let products = [];
let typeSelected = "all";
let priceSelected = "all";
let currentProduct = null;

fetch('https://cafemanagement-rgd5.onrender.com/products')
    .then(res => res.json())
    .then(data => {
        products = data.content || data || [];
        displayProducts(products);
    })
    .catch(err => {
        console.error("Lỗi fetch:", err);
        displayProducts([]);
    });

function displayProducts(list) {
    const productList = document.getElementById("product-list");
    if (!list || list.length === 0) {
        productList.innerHTML = `<p class="text-center text-muted">Không tìm thấy sản phẩm nào.</p>`;
        return;
    }
    let html = "";
    list.forEach((p, i) => {
        html += `
        <div class="col-md-3 mb-4">
            <div class="card product-card h-100" data-id="${i}" data-aos="fade-up" data-aos-duration="800">
                <img src="${p.imageUrl || 'https://placehold.co/300x300?text=No+Image'}" alt="${p.name}"
                     class="card-img-top product-card-img" style="height:300px; object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title">${p.name}</h5>
                    <p class="price">${p.price ? Number(p.price).toLocaleString('vi-VN') + 'đ' : ''}</p>
                    <button class="btn" style="background-color:#6F4E37; color:white;">Mua ngay</button>
                </div>
            </div>
        </div>`;
    });
    productList.innerHTML = html;
}

// ── Nút "Tất cả" ──────────────────────────────────────
document.querySelector(".filter-btn.active").addEventListener("click", () => {
    typeSelected = "all";
    priceSelected = "all";
    filterProducts();
});

// ── Lọc loại ─────────────────────────────────────────
document.querySelectorAll(".type-filter").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        typeSelected = btn.dataset.type;
        filterProducts();
    });
});

// ── Lọc giá ──────────────────────────────────────────
document.querySelectorAll(".price-filter").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        priceSelected = btn.dataset.price;
        filterProducts();
    });
});

function filterProducts() {
    const params = new URLSearchParams();
    if (typeSelected !== "all") params.append("groupId", typeSelected);
    if (priceSelected === "low") params.append("maxPrice", 30000);
    if (priceSelected === "mid") { params.append("minPrice", 30000); params.append("maxPrice", 40000); }
    if (priceSelected === "high") params.append("minPrice", 40000);
    params.append("page", 0);
    params.append("size", 20);

    fetch(`https://cafemanagement-rgd5.onrender.com/products/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            products = data.content || [];
            displayProducts(products);
        })
        .catch(err => console.error("Lỗi:", err));
}

// ── Thanh tìm kiếm ────────────────────────────────────
document.getElementById("searchButton").addEventListener("click", function (e) {
    e.preventDefault();
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    displayProducts(products.filter(p => p.name.toLowerCase().includes(keyword)));
});

// ── Popup sản phẩm ────────────────────────────────────
const modal = new bootstrap.Modal(document.getElementById('productModal'));

document.getElementById("product-list").addEventListener("click", function (e) {
    const card = e.target.closest(".product-card");
    if (!card) return;
    currentProduct = products[card.dataset.id];
    document.getElementById("modalTitle").textContent = currentProduct.name;
    document.getElementById("modalImage").src = currentProduct.imageUrl || 'https://placehold.co/300x300?text=No+Image';
    document.getElementById("modalDescription").textContent = currentProduct.descr || '';
    document.getElementById("modalPrice").textContent = currentProduct.price
        ? Number(currentProduct.price).toLocaleString('vi-VN') + 'đ' : '';
    document.getElementById("quantity").value = 1;
    modal.show();
});

// ── Nút "Mua ngay" trong modal ────────────────────────
document.querySelector("#productModal .btn-primary").addEventListener("click", function () {
    if (!currentProduct) return;

    // Chưa login → redirect tới trang login
    if (!sessionStorage.getItem('currentUser')) {
        alert('Vui lòng đăng nhập để mua hàng!');
        window.location.href = 'login.html';
        return;
    }


    const qty = parseInt(document.getElementById("quantity").value) || 1;
    // Lưu vào localStorage

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(item => item.id === String(currentProduct.id));
    if (productIndex > -1) {
        cart[productIndex].quantity = (cart[productIndex].quantity || 0) + qty;
    } else {
        cart.push({
            id: String(currentProduct.id),
            name: currentProduct.name,
            price: Number(currentProduct.price) || 0,
            image: currentProduct.imageUrl || '',
            quantity: qty
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Đồng bộ lại CartStore nếu có
    if (window.CartStore && Array.isArray(window.CartStore._items)) {
        window.CartStore._items = cart;
        window.dispatchEvent(new Event('cart:updated'));
    }

    flyToCart(document.getElementById("modalImage"), () => {
        modal.hide();
    });
});

// ════════════════════════════════════════════════════
// FLOATING CART — góc phải màn hình
// ════════════════════════════════════════════════════
function createFloatingCart() {
    // Chưa login → không hiện floating cart
    if (!sessionStorage.getItem('currentUser')) return;

    const navCartBtn = document.getElementById('cartBtn');
    const navDropdown = document.getElementById('cartDropdown');
    if (navCartBtn) navCartBtn.style.display = 'none';
    if (navDropdown) navDropdown.style.display = 'none';

    const cart = document.createElement('div');
    cart.id = 'floatingCart';
    cart.className = 'shopping-cart';
    cart.setAttribute('data-product-count', '0');
    cart.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span class="floating-cart-badge" id="floatingCartBadge" style="display:none">0</span>
    `;
    document.body.appendChild(cart);

    cart.addEventListener('click', () => {
        // Luôn chuyển sang trang checkout.html khi click icon giỏ hàng
        window.location.href = 'pages/checkout.html';
    });

    window.addEventListener('cart:updated', updateFloatingCartBadge);
    updateFloatingCartBadge();
}

function updateFloatingCartBadge() {
    const badge = document.getElementById('floatingCartBadge');
    if (!badge) return;
    const total = CartStore.totalItems();
    if (total > 0) {
        badge.style.display = 'flex';
        badge.textContent = total > 99 ? '99+' : total;
    } else {
        badge.style.display = 'none';
    }
}

// ════════════════════════════════════════════════════
// FLY TO CART — card thu nhỏ tại chỗ rồi bay vào cart
// ════════════════════════════════════════════════════
function flyToCart(sourceEl, onComplete) {
    const shoppingCart = document.getElementById('floatingCart');
    if (!shoppingCart || !sourceEl) { onComplete?.(); return; }

    // Chỉ clone ảnh sản phẩm
    const flyingCard = sourceEl.cloneNode(true);
    flyingCard.style.borderRadius = '16px';
    flyingCard.style.objectFit = 'cover';

    const srcRect = sourceEl.getBoundingClientRect();
    const cartPos = shoppingCart.getBoundingClientRect();

    // Vị trí đích: giữa cart icon
    const destX = cartPos.left + cartPos.width / 2;
    const destY = cartPos.top + cartPos.height / 2;

    // Gắn flying card vào body, đặt đúng vị trí nguồn
    flyingCard.style.cssText = `
        position: fixed !important;
        top:             ${srcRect.top}px !important;
        left:            ${srcRect.left}px !important;
        width:           ${srcRect.width}px !important;
        height:          ${srcRect.height}px !important;
        margin:          0 !important;
        z-index:         99999 !important;
        pointer-events:  none !important;
        border-radius:   20px !important;
        overflow:        hidden !important;
        box-shadow:      0 20px 60px rgba(44,26,14,0.35) !important;
        transform-origin: center center !important;
        will-change:     transform, opacity;
    `;
    document.body.appendChild(flyingCard);

    // BƯỚC 1 — Thu nhỏ tại chỗ (0 → 350ms)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            flyingCard.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
            flyingCard.style.transform = 'scale(0.28)';
            flyingCard.style.opacity = '0.9';
        });
    });

    // BƯỚC 2 — Bay về cart (350ms → 1050ms)
    setTimeout(() => {
        // Tính translate để tâm card nhỏ bay đến tâm cart icon
        const scaledW = srcRect.width * 0.28;
        const scaledH = srcRect.height * 0.28;
        const fromX = srcRect.left + srcRect.width / 2;
        const fromY = srcRect.top + srcRect.height / 2;
        const tx = (destX - fromX) / 0.28;
        const ty = (destY - fromY) / 0.28;

        flyingCard.style.transition = 'transform 0.65s cubic-bezier(0.55, 0, 0.1, 1), opacity 0.4s ease 0.3s';
        flyingCard.style.transform = `scale(0.28) translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
        flyingCard.style.opacity = '0';
    }, 370);

    // BƯỚC 3 — Dọn & cart pop (1100ms)
    setTimeout(() => {
        if (document.body.contains(flyingCard)) document.body.removeChild(flyingCard);

        shoppingCart.classList.add('active');
        shoppingCart.classList.add('cart-pop');
        setTimeout(() => {
            shoppingCart.classList.remove('active');
            shoppingCart.classList.remove('cart-pop');
        }, 500);

        onComplete?.();
    }, 1100);
}

// ════════════════════════════════════════════════════
// CSS
// ════════════════════════════════════════════════════
const styleEl = document.createElement('style');
styleEl.textContent = `
    /* ── Floating Cart Button ── */
    .shopping-cart {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 62px;
        height: 62px;
        background: #2c1a0e;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9000;
        box-shadow: 0 4px 20px rgba(44,26,14,0.4);
        transition: background 0.2s, box-shadow 0.2s;
    }
    .shopping-cart:hover {
        background: #6F4E37;
        box-shadow: 0 8px 28px rgba(44,26,14,0.5);
    }

    /* Badge số lượng */
    .floating-cart-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #e74c3c;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        border: 2px solid #fff;
        pointer-events: none;
    }

    /* ── Cart shake khi nhận hàng ── */
    .shopping-cart.active {
        animation: cartShake 0.5s ease;
    }
    @keyframes cartShake {
        0%   { transform: scale(1)   rotate(0deg); }
        25%  { transform: scale(1.2) rotate(-8deg); }
        50%  { transform: scale(1.2) rotate(8deg); }
        75%  { transform: scale(1.1) rotate(-4deg); }
        100% { transform: scale(1)   rotate(0deg); }
    }

    /* Cart pop */
    .cart-pop {
        animation: cartPop 0.4s ease forwards !important;
    }
    @keyframes cartPop {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.3); }
        70%  { transform: scale(0.92); }
        100% { transform: scale(1); }
    }

    /* ── Scroll Top — không đè floating cart ── */
    #scrollTopBtn {
        bottom: 32px !important;
        right: 108px !important;
        left: auto !important;
        width: 46px !important;
        height: 46px !important;
        font-size: 16px !important;
        border-radius: 50% !important;
        z-index: 8999 !important;
    }

    /* ── Modal redesign ── */
    #productModal .modal-dialog {
        max-width: 520px !important;
    }
    #productModal .modal-content {
        border: none !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        box-shadow: 0 20px 60px rgba(44,26,14,0.25) !important;
    }
    #productModal .modal-header {
        background: #2c1a0e !important;
        color: #fff !important;
        padding: 16px 22px !important;
        border: none !important;
    }
    #productModal .modal-title {
        font-family: 'Baloo 2', sans-serif !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        letter-spacing: 0.3px !important;
        opacity: 0.85 !important;
    }
    #productModal .btn-close {
        filter: invert(1) !important;
        opacity: 0.7 !important;
    }
    #productModal .modal-body {
        padding: 0 !important;
        background: #fff !important;
    }
    #productModal .row { margin: 0 !important; }

    /* Cột ảnh */
    #productModal .col-md-5 { padding: 0 !important; }
    #modalImage {
        width: 100% !important;
        height: 240px !important;
        object-fit: cover !important;
        display: block !important;
        border-radius: 0 !important;
        max-height: unset !important;
    }

    /* Cột thông tin */
    #productModal .col-md-7 {
        padding: 22px 22px 24px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 10px !important;
    }
    #modalTitle {
        font-family: 'Alfa Slab One', serif !important;
        font-size: 20px !important;
        color: #2c1a0e !important;
        margin: 0 !important;
        line-height: 1.3 !important;
    }
    #modalDescription {
        font-size: 13px !important;
        color: #888 !important;
        line-height: 1.5 !important;
        margin: 0 !important;
    }
    #modalPrice {
        font-size: 22px !important;
        font-weight: 800 !important;
        color: #6F4E37 !important;
        margin: 0 !important;
    }
    #productModal .d-flex.align-items-center {
        gap: 0 !important;
        margin-bottom: 0 !important;
    }
    #quantity {
        width: 72px !important;
        height: 40px !important;
        border: 1.5px solid #e0d5c8 !important;
        border-radius: 10px !important;
        text-align: center !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        color: #2c1a0e !important;
        background: #faf8f5 !important;
        margin: 0 !important;
    }
    #quantity:focus {
        outline: none !important;
        border-color: #6F4E37 !important;
        box-shadow: 0 0 0 3px rgba(111,78,55,0.12) !important;
    }
    #productModal .btn-primary {
        background: #2c1a0e !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px !important;
        font-family: 'Baloo 2', sans-serif !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        letter-spacing: 0.4px !important;
        transition: background 0.2s, transform 0.1s !important;
        margin-top: 4px !important;
    }
    #productModal .btn-primary:hover  { background: #6F4E37 !important; }
    #productModal .btn-primary:active { transform: scale(0.97) !important; }
`;
document.head.appendChild(styleEl);

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', createFloatingCart);

// ── Scroll top button ─────────────────────────────────
const btn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", function () {
    window.scrollY > 300 ? btn.classList.remove("d-none") : btn.classList.add("d-none");
});
btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});