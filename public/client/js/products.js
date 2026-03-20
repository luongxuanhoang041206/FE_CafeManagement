let products = [];
let typeSelected = "all";
let priceSelected = "all";

fetch("http://localhost:8080/products")
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
                <img src="${p.image || 'https://placehold.co/300x300?text=No+Image'}"
                     class="card-img-top" style="height:300px; object-fit:cover;">
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

// Nút "Tất cả" — chỉ gắn riêng cho nút đầu tiên
document.querySelector(".filter-btn.active").addEventListener("click", () => {
    typeSelected = "all";
    priceSelected = "all";
    filterProducts();
});

// Lọc loại — KHÔNG bị nút "Tất cả" can thiệp
document.querySelectorAll(".type-filter").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        typeSelected = btn.dataset.type;
        console.log("Type selected:", typeSelected);
        filterProducts();
    });
});

// Lọc giá
document.querySelectorAll(".price-filter").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        priceSelected = btn.dataset.price;
        console.log("Price selected:", priceSelected);
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

    const url = `http://localhost:8080/products/search?${params.toString()}`;
    console.log("Gọi URL:", url);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            products = data.content || [];
            displayProducts(products);
        })
        .catch(err => console.error("Lỗi:", err));
}
//Thanh tìm kiếm
document.getElementById("searchButton").addEventListener("click", function (e) {
    e.preventDefault();
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    displayProducts(products.filter(p => p.name.toLowerCase().includes(keyword)));
});
//popup
const modal = new bootstrap.Modal(document.getElementById('productModal'));
document.getElementById("product-list").addEventListener("click", function (e) {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const product = products[card.dataset.id];
    document.getElementById("modalTitle").textContent = product.name;
    document.getElementById("modalImage").src = product.image || 'https://placehold.co/300x300?text=No+Image';
    document.getElementById("modalDescription").textContent = product.descr || '';
    document.getElementById("modalPrice").textContent = product.price ? Number(product.price).toLocaleString('vi-VN') + 'đ' : '';
    document.getElementById("quantity").value = 1;
    modal.show();
});
//Nút scroll top
const btn =document.getElementById("scrollTopBtn");
window.addEventListener("scroll",function(){
    window.scrollY>300?(btn.classList.remove("d-none")):(btn.classList.add("d-none"));
    console.log(window.scrollY);
});
btn.addEventListener("click",function(){
    window.scrollTo({
        top: 0,
        behavior:"smooth"
    });
});