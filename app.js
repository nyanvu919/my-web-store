// --- CẤU HÌNH & DỮ LIỆU ---
const defaultData = [
    { id: 1, name: "Áo Thun JiaoStore Basic Tee", price: 159000, oldPrice: 250000, img: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-lm1j70e6377u57" },
    { id: 2, name: "Tai Nghe Bluetooth Chống Ồn", price: 299000, oldPrice: 550000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18" },
    { id: 3, name: "Sạc Dự Phòng 20000mAh", price: 189000, oldPrice: 300000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b" },
    { id: 4, name: "Đồng Hồ JiaoWatch Series 8", price: 550000, oldPrice: 990000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e" }
];

// Lấy dữ liệu Sản phẩm & Giỏ hàng từ LocalStorage
let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || []; // Giỏ hàng lưu mảng chi tiết

// --- CHẠY KHI WEB LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); // Cập nhật số nhỏ trên icon giỏ

    // Nếu đang ở trang chủ (có id product-list)
    if (document.getElementById('product-list')) {
        renderHomeProducts();
    } 
    // Nếu đang ở trang giỏ hàng (có id cart-list-container)
    else if (document.getElementById('cart-list-container')) {
        renderCartPage();
    }
});

// --- LOGIC TRANG CHỦ ---
function renderHomeProducts() {
    const grid = document.getElementById('product-list');
    grid.innerHTML = products.map((p, index) => {
        let discount = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            ${discount > 0 ? `<div class="badge-sale"><span>${discount}%</span><br>GIẢM</div>` : ''}
            <div class="img-container"><img src="${p.img}" class="product-img"></div>
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price-row">
                    <div class="p-price">${p.price.toLocaleString()}đ</div>
                    ${p.oldPrice ? `<div class="p-old-price">${p.oldPrice.toLocaleString()}đ</div>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

// Hàm thêm vào giỏ hàng (Lưu cả object sản phẩm)
window.addToCart = function(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    updateCartCount();
    
    Toastify({
        text: "✅ Đã thêm vào giỏ hàng!",
        duration: 2000, gravity: "top", position: "right",
        style: { background: "#00bfa5" }
    }).showToast();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = count;
}

// --- LOGIC TRANG GIỎ HÀNG (CART.HTML) ---
function renderCartPage() {
    const container = document.getElementById('cart-list-container');
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">
            <i class="fas fa-shopping-basket" style="font-size:50px; color:#ddd;"></i>
            <p>Giỏ hàng trống trơn!</p>
            <a href="index.html" class="banner-btn" style="display:inline-block; margin-top:10px; background:var(--primary); color:white;">Mua sắm ngay</a>
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
            <div class="c-info" style="width: 50%; display:flex; gap:10px; align-items:center;">
                <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border:1px solid #eee;">
                <div><div style="font-weight:600; font-size:14px;">${item.name}</div></div>
            </div>
            <div style="width: 15%; text-align: center;">${item.price.toLocaleString()}đ</div>
            <div style="width: 15%; text-align: center;">
                <button onclick="changeQty(${index}, -1)" style="padding:2px 8px;">-</button>
                <span style="margin:0 5px;">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)" style="padding:2px 8px;">+</button>
            </div>
            <div style="width: 15%; text-align: center; color:var(--primary); font-weight:bold;">${itemTotal.toLocaleString()}đ</div>
            <div style="width: 5%; text-align: right;"><i class="fas fa-trash" style="cursor:pointer; color:red;" onclick="removeItem(${index})"></i></div>
        </div>`;
    }).join('');

    document.getElementById('temp-total').innerText = total.toLocaleString() + 'đ';
    document.getElementById('final-total').innerText = total.toLocaleString() + 'đ';
}

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

window.removeItem = function(index) {
    if(confirm("Xóa sản phẩm này?")) {
        cart.splice(index, 1);
        localStorage.setItem('jiaoCart', JSON.stringify(cart));
        renderCartPage();
        updateCartCount();
    }
}

window.processCheckoutPage = function() {
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const addr = document.getElementById('c-address').value;

    if (!name || !phone || !addr) {
        alert("Vui lòng điền đầy đủ thông tin nhận hàng!");
        return;
    }

    const orderTotal = document.getElementById('final-total').innerText;
    const message = `🔔 ĐƠN HÀNG MỚI!\n\n👤 Khách: ${name}\n📞 SĐT: ${phone}\n🏠 ĐC: ${addr}\n\n🛒 Sản phẩm:\n${cart.map(i => `- ${i.name} (x${i.qty})`).join('\n')}\n\n💰 TỔNG TIỀN: ${orderTotal}`;
    
    // Ở đây bạn có thể tích hợp gửi về Telegram như đã bàn
    alert("Đặt hàng thành công! (Dữ liệu đã được tạo)\n\n" + message);
    
    cart = []; // Xóa giỏ
    localStorage.removeItem('jiaoCart');
    window.location.href = 'index.html'; // Quay về trang chủ
}

// GIỮ LẠI LOGIC ADMIN CỦA BẠN (Đã tối ưu gọn lại)
// (Bạn có thể copy lại phần logic Admin Panel của app.js cũ vào đây nếu muốn giữ tính năng thêm sửa xóa trên trang chủ)
