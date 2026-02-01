// --- CẤU HÌNH & DỮ LIỆU ---
const defaultData = [
    { id: 1, name: "Áo Thun JiaoStore Basic Tee", price: 159000, oldPrice: 250000, img: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-lm1j70e6377u57" },
    { id: 2, name: "Tai Nghe Bluetooth Chống Ồn", price: 299000, oldPrice: 550000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18" },
    { id: 3, name: "Sạc Dự Phòng 20000mAh", price: 189000, oldPrice: 300000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b" },
    { id: 4, name: "Đồng Hồ JiaoWatch Series 8", price: 550000, oldPrice: 990000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e" }
];

// Lấy dữ liệu từ LocalStorage
let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = JSON.parse(localStorage.getItem('jiaoCart')) || [];
let tempImgBase64 = ""; // Biến tạm lưu ảnh khi upload

// --- KHỞI CHẠY ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Kiểm tra xem đang ở trang nào để chạy hàm tương ứng
    if (document.getElementById('product-list')) {
        renderHomeProducts(); // Chạy giao diện trang chủ
    } 
    else if (document.getElementById('cart-list-container')) {
        renderCartPage(); // Chạy giao diện giỏ hàng
    }
});

// ==============================================
// 1. LOGIC TRANG CHỦ (Home)
// ==============================================

function renderHomeProducts() {
    const grid = document.getElementById('product-list');
    if(!grid) return;

    grid.innerHTML = products.map((p, index) => {
        let discount = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return `
        <div class="product-card" onclick="addToCart(${p.id})">
            <!-- Nút xóa nhanh (chỉ hiện khi bật Admin) -->
            <button class="btn-delete-card" onclick="event.stopPropagation(); deleteProduct(${index})">Xóa</button>
            
            ${discount > 0 ? `<div class="badge-sale"><span>${discount}%</span><br>GIẢM</div>` : ''}
            <div class="img-container"><img src="${p.img}" class="product-img" onerror="this.src='https://via.placeholder.com/300'"></div>
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

window.addToCart = function(id) {
    // Nếu đang bật chế độ Admin thì không cho mua (để tránh bấm nhầm)
    if(document.body.classList.contains('admin-mode')) return;

    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem('jiaoCart', JSON.stringify(cart));
    updateCartCount();
    
    // Thông báo
    if(typeof Toastify === 'function') {
        Toastify({ text: "✅ Đã thêm vào giỏ hàng!", duration: 1500, style: { background: "#00bfa5" } }).showToast();
    } else {
        alert("Đã thêm vào giỏ hàng");
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = count;
}

// ==============================================
// 2. LOGIC TRANG GIỎ HÀNG (Cart)
// ==============================================

function renderCartPage() {
    const container = document.getElementById('cart-list-container');
    if(!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">
            <p>Giỏ hàng trống trơn!</p>
            <a href="index.html" class="btn-checkout-page" style="text-decoration:none; display:inline-block; width:auto; margin-top:10px;">Mua sắm ngay</a>
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
                <button onclick="changeQty(${index}, -1)" style="padding:2px 8px; cursor:pointer">-</button>
                <span style="margin:0 5px;">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)" style="padding:2px 8px; cursor:pointer">+</button>
            </div>
            <div style="width: 15%; text-align: center; color:var(--primary); font-weight:bold;">${itemTotal.toLocaleString()}đ</div>
            <div style="width: 5%; text-align: right;"><i class="fas fa-trash" style="cursor:pointer; color:red;" onclick="removeItem(${index})"></i></div>
        </div>`;
    }).join('');

    const totalStr = total.toLocaleString() + 'đ';
    document.getElementById('temp-total').innerText = totalStr;
    document.getElementById('final-total').innerText = totalStr;
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

// Xử lý đặt hàng (Gửi Formspree hoặc Alert)
window.processCheckoutPage = function() {
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const addr = document.getElementById('c-address').value;

    if (!name || !phone || !addr) {
        alert("Vui lòng điền đủ thông tin!");
        return;
    }
    
    // GỬI EMAIL (Nếu bạn đã có mã Formspree thì thay vào link dưới)
    // fetch("https://formspree.io/f/MÃ_CỦA_BẠN", ...)
    
    // DEMO:
    alert(`✅ Đặt hàng thành công!\nCảm ơn ${name}. Shop sẽ gửi hàng về ${addr}.`);
    cart = [];
    localStorage.removeItem('jiaoCart');
    window.location.href = 'index.html';
}

// ==============================================
// 3. LOGIC ADMIN (QUẢN LÝ SẢN PHẨM) - ĐÂY LÀ PHẦN BẠN THIẾU
// ==============================================

// Bật/Tắt bảng Admin
window.toggleAdminPanel = function() {
    const modal = document.getElementById('admin-panel');
    if(modal) {
        modal.classList.toggle('open');
        document.body.classList.toggle('admin-mode');
    } else {
        console.error("Không tìm thấy ID admin-panel trong HTML");
    }
}

// Xử lý khi chọn file ảnh
const fileInput = document.getElementById('p-file');
if(fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                tempImgBase64 = evt.target.result;
                document.getElementById('img-preview').innerHTML = `<img src="${tempImgBase64}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Lưu sản phẩm mới
window.saveProduct = function() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;

    if(!name || !price) {
        alert("Vui lòng nhập Tên và Giá bán!");
        return;
    }

    const newProd = {
        id: Date.now(),
        name: name,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        img: tempImgBase64 || "https://via.placeholder.com/300?text=JiaoStore"
    };

    products.unshift(newProd); // Thêm lên đầu danh sách
    localStorage.setItem('jiaoProducts', JSON.stringify(products));
    
    renderHomeProducts(); // Vẽ lại giao diện
    
    // Reset form
    document.getElementById('p-name').value = "";
    document.getElementById('p-price').value = "";
    document.getElementById('p-old-price').value = "";
    document.getElementById('p-file').value = "";
    document.getElementById('img-preview').innerHTML = "Chưa chọn ảnh";
    tempImgBase64 = "";
    
    toggleAdminPanel(); // Đóng bảng
    alert("Đã thêm sản phẩm thành công!");
}

// Xóa sản phẩm
window.deleteProduct = function(index) {
    if(confirm("Bạn chắc chắn muốn xóa sản phẩm này khỏi Shop?")) {
        products.splice(index, 1);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        renderHomeProducts();
    }
}

// Reset dữ liệu mẫu
window.resetData = function() {
    if(confirm("Xóa hết dữ liệu cũ và quay về mặc định?")) {
        localStorage.removeItem('jiaoProducts');
        location.reload();
    }
}
