// ==========================================
// 1. DỮ LIỆU MẪU
// ==========================================
const defaultData = [
    { id: 1, name: "iPhone 15 Pro Max 256GB Chính Hãng", price: 29500000, oldPrice: 34990000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", category: "Điện thoại" },
    { id: 2, name: "Tai Nghe Marshall Monitor II A.N.C", price: 6500000, oldPrice: 8500000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" },
    { id: 3, name: "MacBook Air M3 (8GB/256GB SSD)", price: 27900000, oldPrice: 32900000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", category: "Laptop" },
    { id: 4, name: "Apple Watch Series 9 GPS 41mm", price: 9200000, oldPrice: 11290000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e", category: "Đồng hồ" },
    { id: 5, name: "Sạc dự phòng Anker 20.000mAh 22.5W", price: 850000, oldPrice: 1200000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b", category: "Phụ kiện" },
    { id: 6, name: "Chuột Không Dây Logitech MX Master 3S", price: 2300000, oldPrice: 2900000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm1j70e6377u57", category: "Phụ kiện" }
];

let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let tempImg = "";

// ==========================================
// 2. KHỞI CHẠY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('product-list')) renderAllSections(products);
    if (document.getElementById('cart-list-container')) renderCart();
});

// --- RENDER TRANG CHỦ ---
function renderGrid(containerId, data) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = data.map((p) => {
        let disc = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            <button class="btn-delete-card" onclick="event.stopPropagation(); deleteProduct(${p.id})">Xóa</button>
            ${disc > 0 ? `<div class="badge-sale"><span>${disc}%</span></div>` : ''}
            <div class="img-container"><img src="${p.img}" class="product-img" onerror="this.src='https://via.placeholder.com/300'"></div>
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()}đ <span class="p-old">${p.oldPrice ? p.oldPrice.toLocaleString() + 'đ' : ''}</span></div>
            </div>
        </div>`;
    }).join('');
}

function renderAllSections(data) {
    renderGrid('flash-sale-list', data.slice(0, 4));
    renderGrid('product-list', data);
    renderGrid('new-arrivals-list', [...data].reverse().slice(0, 4));
}

// --- LỌC ---
window.filterCategory = function(cat, el) {
    document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
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

function renderCart() {
    const container = document.getElementById('cart-list-container');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px;">Giỏ hàng trống</p>`;
        return;
    }
    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `
        <div class="cart-item-row">
            <div style="flex:2; display:flex; gap:10px; align-items:center;">
                <img src="${item.img}" style="width:50px; height:50px; object-fit:cover;">
                <div style="font-size:13px;">${item.name}</div>
            </div>
            <div style="flex:1; text-align:center;">${item.price.toLocaleString()}đ</div>
            <div style="flex:1; text-align:center;">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span style="margin:0 5px;">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
            <div style="flex:1; text-align:center; color:#003366; font-weight:700;">${(item.price * item.qty).toLocaleString()}đ</div>
            <div style="width:30px;"><i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="removeItem(${index})"></i></div>
        </div>`;
    }).join('');
    const totalStr = total.toLocaleString() + 'đ';
    document.getElementById('temp-total').innerText = totalStr;
    document.getElementById('final-total').innerText = totalStr;
}

window.changeQty = function(i, d) {
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

window.removeItem = function(i) {
    cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// ==========================================
// 3. CHỨC NĂNG ĐẶT HÀNG QUA FORMSPREE (MỚI)
// ==========================================
window.processCheckoutPage = function() {
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const addr = document.getElementById('c-address').value;

    if (!name || !phone || !addr) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // Nút trạng thái đang gửi
    const btn = document.querySelector('.btn-checkout-page');
    const originalText = btn.innerText;
    btn.innerText = "ĐANG GỬI ĐƠN HÀNG...";
    btn.disabled = true;

    // Chuẩn bị nội dung đơn hàng để gửi mail
    const itemsList = cart.map(item => `${item.name} (x${item.qty}) - Giá: ${item.price.toLocaleString()}đ`).join("\n");
    const totalAmount = document.getElementById('final-total').innerText;

    // Payload gửi cho Formspree
    const formData = {
        "Họ Tên Khách": name,
        "Số Điện Thoại": phone,
        "Địa Chỉ Giao": addr,
        "Đơn Hàng Chi Tiết": itemsList,
        "Tổng Tiền Thanh Toán": totalAmount
    };

    // --- THAY LINK CỦA BẠN VÀO ĐÂY ---
    const FORMSPREE_URL = "https://formspree.io/f/xwvqqlqp"; // <--- DÁN LINK CỦA BẠN VÀO ĐÂY

    fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            alert(`✅ Đặt hàng thành công!\nCảm ơn ${name}, Shop sẽ liên hệ với bạn sớm nhất.`);
            cart = [];
            localStorage.removeItem('jiaoCart');
            window.location.href = 'index.html';
        } else {
            alert("❌ Lỗi gửi đơn hàng. Vui lòng thử lại!");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    })
    .catch(error => {
        alert("❌ Lỗi kết nối mạng!");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ==========================================
// 4. ADMIN
// ==========================================
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
    if(confirm("Reset dữ liệu?")) {
        localStorage.removeItem('jiaoProducts');
        location.reload();
    }
}
