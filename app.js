// --- DỮ LIỆU MẪU ---
const defaultData = [
    { id: 1, name: "iPhone 15 Pro Max 256GB Chính Hãng", price: 29500000, oldPrice: 34990000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", category: "Điện thoại" },
    { id: 2, name: "Tai Nghe Marshall Monitor II A.N.C", price: 6500000, oldPrice: 8500000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18", category: "Phụ kiện" },
    { id: 3, name: "MacBook Air M3 (8GB/256GB SSD)", price: 27900000, oldPrice: 32900000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", category: "Laptop" }
];

let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let tempImg = "";

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('product-list')) renderAllSections(products);
    if (document.getElementById('cart-list-container')) renderCart();
});

// --- RENDER ---
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
            <div class="p-details"><div class="p-title">${p.name}</div><div class="p-price">${p.price.toLocaleString()}đ</div></div>
        </div>`;
    }).join('');
}

function renderAllSections(data) {
    renderGrid('flash-sale-list', data.slice(0, 4));
    renderGrid('product-list', data);
    renderGrid('new-arrivals-list', [...data].reverse().slice(0, 4));
}

// --- GIỎ HÀNG ---
window.addToCart = function(id) {
    if(document.body.classList.contains('admin-mode')) return;
    const prod = products.find(p => p.id === id);
    const item = cart.find(c => c.id === id);
    if (item) item.qty++; else cart.push({...prod, qty: 1});
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    updateCartCount();
    if(window.Toastify) Toastify({ text: "✅ Đã thêm vào giỏ!", style: { background: "#003366" } }).showToast();
};

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
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
            <div style="flex:1; text-align:center; color:#003366; font-weight:700;">${(item.price * item.qty).toLocaleString()}đ</div>
            <div style="width:30px;"><i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="removeItem(${index})"></i></div>
        </div>`;
    }).join('');
    
    const totalStr = total.toLocaleString() + 'đ';
    const tempEl = document.getElementById('temp-total');
    const finalEl = document.getElementById('final-total');
    if(tempEl) tempEl.innerText = totalStr;
    if(finalEl) finalEl.innerText = totalStr;
}

window.changeQty = function(i, d) {
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

window.removeItem = function(i) {
    cart.splice(i, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

// --- ĐẶT HÀNG FORMSPREE ---
window.processCheckoutPage = function() {
    const nameEl = document.getElementById('c-name');
    const phoneEl = document.getElementById('c-phone');
    const addrEl = document.getElementById('c-address');
    const finalEl = document.getElementById('final-total');

    if (!nameEl || !phoneEl || !addrEl) {
        alert("Lỗi hệ thống: Không tìm thấy ô nhập liệu!");
        return;
    }

    const name = nameEl.value;
    const phone = phoneEl.value;
    const addr = addrEl.value;

    if (!name || !phone || !addr) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    const btn = document.querySelector('.btn-checkout-page');
    btn.innerText = "ĐANG GỬI...";
    btn.disabled = true;

    const itemsList = cart.map(item => `${item.name} (x${item.qty})`).join("\n");
    const totalAmount = finalEl ? finalEl.innerText : "Không rõ";

    const formData = {
        "Khách Hàng": name,
        "SĐT": phone,
        "Địa Chỉ": addr,
        "Đơn Hàng": itemsList,
        "Tổng Tiền": totalAmount
    };

    fetch("https://formspree.io/f/mqkrvpqz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(res => {
        if (res.ok) {
            alert("✅ Đơn hàng đã được gửi thành công!");
            cart = [];
            localStorage.removeItem('jiaoCart');
            window.location.href = 'index.html';
        } else {
            alert("❌ Lỗi gửi đơn!");
            btn.innerText = "XÁC NHẬN ĐẶT HÀNG";
            btn.disabled = false;
        }
    })
    .catch(() => {
        alert("❌ Lỗi mạng!");
        btn.innerText = "XÁC NHẬN ĐẶT HÀNG";
        btn.disabled = false;
    });
};

// --- ADMIN ---
window.toggleAdminPanel = function() {
    document.getElementById('admin-panel').classList.toggle('open');
    document.body.classList.toggle('admin-mode');
};

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
};

window.deleteProduct = function(id) {
    if(confirm("Xóa SP?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        location.reload();
    }
};

window.resetData = function() {
    if(confirm("Reset?")) { localStorage.removeItem('jiaoProducts'); location.reload(); }
};
