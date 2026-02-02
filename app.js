// ==========================================
// 1. DỮ LIỆU MẪU BAN ĐẦU (KHI CHƯA CÓ TRONG MÁY)
// ==========================================
const defaultProducts = [
    { id: 1, name: "iPhone 15 Pro Max 256GB Chính Hãng", price: 29500000, oldPrice: 34990000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", category: "Điện thoại" },
    { id: 2, name: "Tai Nghe Marshall Monitor II A.N.C", price: 6500000, oldPrice: 8500000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" },
    { id: 3, name: "MacBook Air M3 (8GB/256GB SSD)", price: 27900000, oldPrice: 32900000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", category: "Laptop" },
    { id: 4, name: "Apple Watch Series 9 GPS 41mm", price: 9200000, oldPrice: 11290000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e", category: "Đồng hồ" },
    { id: 5, name: "Sạc dự phòng Anker 20.000mAh 22.5W", price: 850000, oldPrice: 1200000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b", category: "Phụ kiện" },
    { id: 6, name: "Chuột Không Dây Logitech MX Master 3S", price: 2300000, oldPrice: 2900000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm1j70e6377u57", category: "Phụ kiện" },
    { id: 7, name: "Bàn Phím Cơ Keychron K2 V2 Blue", price: 1650000, oldPrice: 2100000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk719j5x5u602", category: "Phụ kiện" },
    { id: 8, name: "Sony WH-1000XM5 Chống Ồn", price: 6900000, oldPrice: 8490000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" }
];

// Khởi tạo dữ liệu từ LocalStorage
let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let tempImg = ""; // Biến tạm lưu ảnh khi Admin upload

// ==========================================
// 2. KHỞI CHẠY KHI TRANG LOAD XONG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Kiểm tra xem đang ở trang chủ hay trang giỏ hàng
    if (document.getElementById('product-list')) {
        renderAllSections(products);
    } 
    if (document.getElementById('cart-list-container')) {
        renderCart();
    }
});

// ==========================================
// 3. LOGIC HIỂN THỊ TRANG CHỦ
// ==========================================

// Hàm vẽ lưới sản phẩm dùng chung
function renderGrid(containerId, data) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:#999;">Không có sản phẩm nào khớp với bộ lọc.</p>`;
        return;
    }

    grid.innerHTML = data.map((p) => {
        let disc = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            <button class="btn-delete-card" onclick="event.stopPropagation(); deleteProduct(${p.id})">Xóa</button>
            ${disc > 0 ? `<div class="badge-sale"><span>${disc}%</span></div>` : ''}
            <div class="img-container">
                <img src="${p.img}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=JiaoStore'">
            </div>
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()}đ <span class="p-old">${p.oldPrice ? p.oldPrice.toLocaleString() + 'đ' : ''}</span></div>
            </div>
        </div>`;
    }).join('');
}

// Phân bổ sản phẩm vào 3 khu vực (Flash Sale, Gợi ý, Mới về)
function renderAllSections(data) {
    renderGrid('flash-sale-list', data.slice(0, 4));     // 4 cái đầu cho Flash Sale
    renderGrid('product-list', data);                    // Tất cả cho Gợi ý
    renderGrid('new-arrivals-list', [...data].reverse().slice(0, 4)); // 4 cái mới nhất
}

// Lọc theo danh mục
window.filterCategory = function(cat, el) {
    document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    renderGrid('product-list', filtered);
    // Khi lọc danh mục, ta cuộn xuống mục Gợi ý để xem kết quả
    document.getElementById('product-list').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Lọc theo giá
window.filterByPrice = function() {
    const min = document.getElementById('min-price').value || 0;
    const max = document.getElementById('max-price').value || Infinity;
    const filtered = products.filter(p => p.price >= min && p.price <= max);
    renderGrid('product-list', filtered);
}

// ==========================================
// 4. LOGIC GIỎ HÀNG
// ==========================================

window.addToCart = function(id) {
    if(document.body.classList.contains('admin-mode')) return; // Chế độ admin thì ko cho mua

    const prod = products.find(p => p.id === id);
    const itemInCart = cart.find(c => c.id === id);

    if (itemInCart) {
        itemInCart.qty++;
    } else {
        cart.push({...prod, qty: 1});
    }

    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    updateCartCount();

    if(typeof Toastify === 'function') {
        Toastify({ text: "✅ Đã thêm vào giỏ!", duration: 1500, style: { background: "#003366" } }).showToast();
    }
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

function renderCart() {
    const container = document.getElementById('cart-list-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" width="100" style="opacity:0.2">
                <p style="margin-top:20px; color:#999;">Giỏ hàng của bạn đang trống</p>
                <a href="index.html" style="display:inline-block; margin-top:15px; background:#003366; color:white; padding:10px 20px; text-decoration:none; border-radius:4px;">MUA SẮM NGAY</a>
            </div>`;
        document.getElementById('temp-total').innerText = "0đ";
        document.getElementById('final-total').innerText = "0đ";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
        <div class="cart-item-row">
            <div style="flex: 2; display:flex; gap:15px; align-items:center;">
                <img src="${item.img}" class="c-img" onerror="this.src='https://via.placeholder.com/100'">
                <div>
                    <div class="c-name">${item.name}</div>
                    <div style="font-size:12px; color:#999;">Phân loại: ${item.category}</div>
                </div>
            </div>
            <div style="flex: 1; text-align: center; font-weight:600;">${item.price.toLocaleString()}đ</div>
            <div style="flex: 1;">
                <div class="qty-control">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
            <div style="flex: 1; text-align: center; color:#003366; font-weight:700;">${itemTotal.toLocaleString()}đ</div>
            <div style="width: 50px; text-align: right;">
                <i class="fas fa-trash-alt" style="color:#ff4d4f; cursor:pointer;" onclick="removeItem(${index})"></i>
            </div>
        </div>`;
    }).join('');

    const formattedTotal = total.toLocaleString() + 'đ';
    document.getElementById('temp-total').innerText = formattedTotal;
    document.getElementById('final-total').innerText = formattedTotal;
}

window.changeQty = function(i, d) {
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

window.removeItem = function(i) {
    if(confirm("Xóa sản phẩm này khỏi giỏ hàng?")) {
        cart.splice(i, 1);
        localStorage.setItem('jiaoCart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
}

window.processCheckoutPage = function() {
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const addr = document.getElementById('c-address').value;

    if (!name || !phone || !addr) {
        alert("Vui lòng nhập đầy đủ thông tin nhận hàng!");
        return;
    }

    alert(`✅ Chúc mừng ${name}!\nĐơn hàng đã được ghi nhận. Shop sẽ gọi cho bạn qua số ${phone} để giao hàng đến ${addr}.`);
    
    // Xóa giỏ hàng
    cart = [];
    localStorage.removeItem('jiaoCart');
    window.location.href = 'index.html';
}

// ==========================================
// 5. LOGIC ADMIN (QUẢN LÝ SẢN PHẨM)
// ==========================================

window.toggleAdminPanel = function() {
    document.getElementById('admin-panel').classList.toggle('open');
    document.body.classList.toggle('admin-mode');
}

// Xử lý upload ảnh
document.getElementById('p-file')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        tempImg = evt.target.result;
        document.getElementById('img-preview').innerHTML = `<img src="${tempImg}" style="width:80px; height:80px; object-fit:cover; border-radius:4px; margin-top:10px;">`;
    };
    reader.readAsDataURL(e.target.files[0]);
});

window.saveProduct = function() {
    const name = document.getElementById('p-name').value;
    const price = Number(document.getElementById('p-price').value);
    const oldPrice = Number(document.getElementById('p-old-price').value);
    const category = document.getElementById('p-category').value;

    if (!name || !price) {
        alert("Nhập đủ tên và giá bán!");
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        oldPrice: oldPrice || null,
        category: category,
        img: tempImg || "https://via.placeholder.com/300?text=JiaoStore"
    };

    products.unshift(newProduct);
    localStorage.setItem('jiaoProducts', JSON.stringify(products));
    alert("Đã thêm sản phẩm mới!");
    location.reload(); // Reload để cập nhật mọi hàng mục
}

window.deleteProduct = function(id) {
    if (confirm("Bạn muốn xóa vĩnh viễn sản phẩm này khỏi hệ thống?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        location.reload();
    }
}

window.resetData = function() {
    if (confirm("Khôi phục toàn bộ dữ liệu về trạng thái gốc? (Xóa hết SP bạn đã thêm)")) {
        localStorage.removeItem('jiaoProducts');
        location.reload();
    }
}
