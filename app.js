// --- DỮ LIỆU KHỞI TẠO ---
const defaultData = [
    { id: 1, name: "Áo Thun JiaoStore Basic Tee - Cotton 100%", price: 159000, oldPrice: 250000, img: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-lm1j70e6377u57" },
    { id: 2, name: "Tai Nghe Bluetooth Không Dây Chống Ồn", price: 299000, oldPrice: 550000, img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llz5j4p7g6he18" },
    { id: 3, name: "Sạc Dự Phòng 20000mAh Sạc Nhanh", price: 189000, oldPrice: 300000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd53-lw0r8j5z8g4r5b" },
    { id: 4, name: "Đồng Hồ Thông Minh JiaoWatch Series 8", price: 550000, oldPrice: 990000, img: "https://down-vn.img.susercontent.com/file/sg-11134201-7rd4e-lvhb6j9k2d5f0e" }
];

// Lấy dữ liệu từ bộ nhớ hoặc dùng mặc định
let products = JSON.parse(localStorage.getItem('jiaoProducts')) || defaultData;
let cart = 0;
let tempImgBase64 = "";

// --- CÁC HÀM CHÍNH ---

// 1. Render sản phẩm
function render() {
    const grid = document.getElementById('product-list');
    if (!grid) return; // Fix lỗi null nếu HTML chưa load

    grid.innerHTML = products.map((p, index) => {
        // Tính % giảm giá
        let discount = 0;
        if(p.oldPrice > p.price) {
            discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        }

        return `
        <div class="product-card" onclick="addToCart('${p.name}')">
            <!-- Nút xóa (chỉ hiện khi bật admin) -->
            <button class="btn-delete" onclick="event.stopPropagation(); deleteProduct(${index})">
                <i class="fas fa-trash"></i> Xóa
            </button>

            <!-- Badge giảm giá -->
            ${discount > 0 ? `<div class="badge-sale"><span>${discount}%</span><br>GIẢM</div>` : ''}
            
            <div class="img-container">
                <img src="${p.img}" class="product-img" alt="${p.name}">
            </div>
            
            <div class="p-details">
                <div class="p-title">${p.name}</div>
                <div class="p-price-row">
                    <div class="p-price">${p.price.toLocaleString()}đ</div>
                    ${p.oldPrice ? `<div class="p-old-price">${p.oldPrice.toLocaleString()}đ</div>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// 2. Thêm vào giỏ
window.addToCart = function(name) {
    if(document.body.classList.contains('admin-mode')) return; // Đang sửa thì không mua
    
    cart++;
    document.getElementById('cart-count').innerText = cart;
    
    // Thông báo đẹp (Toastify)
    Toastify({
        text: `✅ Đã thêm "${name}" vào giỏ!`,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#00bfa5" }
    }).showToast();
}

window.showCartInfo = function() {
    alert(`Giỏ hàng hiện có ${cart} sản phẩm. (Chức năng thanh toán đang phát triển)`);
}

// 3. Admin Panel Logic
window.toggleAdminPanel = function() {
    const modal = document.getElementById('admin-panel');
    modal.classList.toggle('open');
    document.body.classList.toggle('admin-mode');
}

// Xử lý file ảnh upload
document.getElementById('p-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            tempImgBase64 = evt.target.result;
            document.getElementById('img-preview').innerHTML = `<img src="${tempImgBase64}" style="width:100px; height:100px; object-fit:cover">`;
        };
        reader.readAsDataURL(file);
    }
});

window.saveProduct = function() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;

    if(!name || !price) {
        alert("Vui lòng nhập tên và giá bán!");
        return;
    }

    const newProd = {
        id: Date.now(),
        name: name,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        img: tempImgBase64 || "https://via.placeholder.com/300?text=No+Image"
    };

    products.unshift(newProd); // Thêm lên đầu
    localStorage.setItem('jiaoProducts', JSON.stringify(products));
    render();
    
    // Reset form
    document.getElementById('p-name').value = "";
    document.getElementById('p-price').value = "";
    document.getElementById('img-preview').innerText = "Chưa chọn ảnh";
    tempImgBase64 = "";
    
    toggleAdminPanel(); // Đóng modal
    Toastify({ text: "🎉 Đã thêm sản phẩm thành công!", style: { background: "#ee4d2d" } }).showToast();
}

window.deleteProduct = function(index) {
    if(confirm("Xóa sản phẩm này khỏi JiaoStore?")) {
        products.splice(index, 1);
        localStorage.setItem('jiaoProducts', JSON.stringify(products));
        render();
    }
}

window.resetData = function() {
    if(confirm("Bạn có muốn reset về dữ liệu mẫu ban đầu?")) {
        localStorage.removeItem('jiaoProducts');
        location.reload();
    }
}

// Khởi chạy khi web load xong
document.addEventListener('DOMContentLoaded', () => {
    render();
});
