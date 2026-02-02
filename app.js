const defaultData = [
    { id: 1, name: "iPhone 15 Pro Max Chính Hãng VN/A", price: 29500000, oldPrice: 34000000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", category: "Điện thoại" },
    { id: 2, name: "MacBook Air M3 2024 13 inch", price: 27900000, oldPrice: 32000000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", category: "Laptop" },
    { id: 3, name: "Tai Nghe Bluetooth Chống Ồn Sony WH", price: 6500000, oldPrice: 8000000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" },
    { id: 4, name: "Apple Watch Series 9 GPS 41mm", price: 9200000, oldPrice: 11000000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e", category: "Đồng hồ" }
];

let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let currentProducts = [...products];
let tempImg = "";

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('product-list')) renderHome(products);
    if (document.getElementById('cart-list-container')) renderCart();
});

// --- HIỂN THỊ TRANG CHỦ ---
function renderHome(data) {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    grid.innerHTML = data.map((p, index) => {
        let disc = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            <button class="btn-delete-card" onclick="event.stopPropagation(); deleteProduct(${index})">Xóa</button>
            ${disc > 0 ? `<div class="badge-sale"><span>${disc}%</span></div>` : ''}
            <div class="img-container"><img src="${p.img}" class="product-img" onerror="this.src='https://via.placeholder.com/300'"></div>
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()}đ</div>
                <div style="font-size:11px; color:#888;">${p.category}</div>
            </div>
        </div>`;
    }).join('');
}

// --- LỌC DANH MỤC ---
window.filterCategory = function(cat, el) {
    document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    currentProducts = cat === 'all' ? products : products.filter(p => p.category === cat);
    renderHome(currentProducts);
}

window.filterByPrice = function() {
    const min = document.getElementById('min-price').value || 0;
    const max = document.getElementById('max-price').value || Infinity;
    const filtered = products.filter(p => p.price >= min && p.price <= max);
    renderHome(filtered);
}

// --- GIỎ HÀNG ---
window.addToCart = function(id) {
    if(document.body.classList.contains('admin-mode')) return;
    const prod = products.find(p => p.id === id);
    const item = cart.find(c => c.id === id);
    if (item) item.qty++; else cart.push({...prod, qty: 1});
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    updateCartCount();
    Toastify({ text: "✅ Đã thêm vào giỏ!", style: { background: "#003366" } }).showToast();
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

function renderCart() {
    const container = document.getElementById('cart-list-container');
    if (cart.length === 0) {
        container.innerHTML = "<p>Giỏ hàng trống</p>";
        return;
    }
    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `
        <div class="cart-item-row">
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; margin-right:15px;">
            <div style="flex:1;"><b>${item.name}</b><br><small>${item.price.toLocaleString()}đ</small></div>
            <div>
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
            <div style="width:100px; text-align:right;"><b>${(item.price * item.qty).toLocaleString()}đ</b></div>
        </div>`;
    }).join('');
    document.getElementById('final-total').innerText = total.toLocaleString() + 'đ';
}

window.changeQty = function(i, d) {
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

window.processCheckoutPage = function() {
    alert("Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn.");
    localStorage.removeItem('jiaoCart');
    window.location.href = 'index.html';
}

// --- ADMIN ---
window.toggleAdminPanel = function() {
    document.getElementById('admin-panel').classList.toggle('open');
    document.body.classList.toggle('admin-mode');
}

document.getElementById('p-file')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        tempImg = evt.target.result;
        document.getElementById('img-preview').innerHTML = `<img src="${tempImg}" style="width:50px">`;
    };
    reader.readAsDataURL(e.target.files[0]);
});

window.saveProduct = function() {
    const p = {
        id: Date.now(),
        name: document.getElementById('p-name').value,
        price: Number(document.getElementById('p-price').value),
        oldPrice: Number(document.getElementById('p-old-price').value),
        category: document.getElementById('p-category').value,
        img: tempImg || "https://via.placeholder.com/300"
    };
    products.unshift(p);
    localStorage.setItem('jiaoProducts', JSON.stringify(products));
    location.reload();
}

window.deleteProduct = function(i) {
    if(confirm("Xóa SP này?")) {
        products.splice(i, 1);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        location.reload();
    }
}

window.resetData = function() {
    localStorage.removeItem('jiaoProducts');
    location.reload();
}
