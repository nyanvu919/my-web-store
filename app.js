const defaultData = [
    { id: 1, name: "iPhone 15 Pro Max 256GB VN/A", price: 29500000, oldPrice: 34990000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", category: "Điện thoại" },
    { id: 2, name: "Tai Nghe Marshall Monitor II A.N.C", price: 6500000, oldPrice: 8500000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" },
    { id: 3, name: "MacBook Air M3 (8GB/256GB SSD)", price: 27900000, oldPrice: 32900000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", category: "Laptop" },
    { id: 4, name: "Apple Watch Series 9 GPS 41mm", price: 9200000, oldPrice: 11290000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e", category: "Đồng hồ" },
    { id: 5, name: "Sạc dự phòng Anker 20.000mAh 22.5W", price: 850000, oldPrice: 1200000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b", category: "Phụ kiện" },
    { id: 6, name: "Chuột Không Dây Logitech MX Master 3S", price: 2300000, oldPrice: 2900000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm1j70e6377u57", category: "Phụ kiện" },
    { id: 7, name: "Bàn Phím Cơ Keychron K2 V2 Blue", price: 1650000, oldPrice: 2100000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk719j5x5u602", category: "Phụ kiện" },
    { id: 8, name: "Ốp lưng Magsafe iPhone 15 Pro Max", price: 450000, oldPrice: 650000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk719j5x5u602", category: "Phụ kiện" }
];

let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let tempImg = "";

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('product-list')) renderAllSections(products);
    if (document.getElementById('cart-list-container')) renderCart();
});

// Hàm Render chung cho tất cả các hàng mục
function renderGrid(containerId, data) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = data.map((p, index) => {
        let disc = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            <button class="btn-delete-card" onclick="event.stopPropagation(); deleteProduct(${p.id})">Xóa</button>
            ${disc > 0 ? `<div class="badge-sale"><span>${disc}%</span></div>` : ''}
            <div class="img-container"><img src="${p.img}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=No+Image'"></div>
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()}đ <span class="p-old">${p.oldPrice ? p.oldPrice.toLocaleString() + 'đ' : ''}</span></div>
            </div>
        </div>`;
    }).join('');
}

// Phân bổ sản phẩm vào 3 hàng mục
function renderAllSections(data) {
    // FLASH SALE: Lấy 4 sản phẩm đầu tiên
    renderGrid('flash-sale-list', data.slice(0, 4));
    
    // GỢI Ý HÔM NAY: Hiển thị tất cả (hoặc lọc riêng)
    renderGrid('product-list', data);
    
    // SẢN PHẨM MỚI: Lấy 4 sản phẩm cuối cùng
    renderGrid('new-arrivals-list', [...data].reverse().slice(0, 4));
}

// --- LOGIC LỌC DANH MỤC ---
window.filterCategory = function(cat, el) {
    document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    
    // Khi lọc danh mục, ta chỉ cần hiện ở mục "Gợi ý" cho đỡ rối
    renderGrid('product-list', filtered);
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

// --- ADMIN ---
window.toggleAdminPanel = function() {
    document.getElementById('admin-panel').classList.toggle('open');
    document.body.classList.toggle('admin-mode');
}

document.getElementById('p-file')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        tempImg = evt.target.result;
        document.getElementById('img-preview').innerHTML = `<img src="${tempImg}" style="width:50px; margin-top:5px;">`;
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

window.deleteProduct = function(id) {
    if(confirm("Xóa sản phẩm này?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        location.reload();
    }
}

window.resetData = function() {
    if(confirm("Xóa hết dữ liệu và quay về mặc định?")) {
        localStorage.removeItem('jiaoProducts');
        location.reload();
    }
}
