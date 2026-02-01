// Dữ liệu mẫu ban đầu (Nếu chưa có trong LocalStorage)
const defaultProducts = [
    { id: 1, name: "Sữa Rửa Mặt CeraVe Foaming Facial Cleanser", price: 360000, oldPrice: 420000, sold: "5.6k", loc: "Đà Nẵng", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lll1s5t3v1e550", discount: "14%" },
    { id: 2, name: "Dầu Gội Bưởi Cocoon Kích Thích Mọc Tóc", price: 205000, oldPrice: 245000, sold: "3.4k", loc: "TP. HCM", img: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-w51f5e8e8jlvc2", discount: "16%" },
    { id: 3, name: "Phấn Phủ Bột Kiềm Dầu Innisfree No Sebum", price: 99000, oldPrice: 150000, sold: "22k", loc: "Hà Nội", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljz6z5r5x5u602", discount: "34%" },
    { id: 4, name: "Son Kem Lì Black Rouge Air Fit Velvet Tint", price: 159000, oldPrice: 298000, sold: "15k", loc: "Hà Nội", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm4f5t3v1e550", discount: "47%" },
    { id: 5, name: "Kem Chống Nắng La Roche-Posay Anthelios", price: 395000, oldPrice: 500000, sold: "8.2k", loc: "TP. HCM", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6t3v1e550", discount: "21%" }
];

// Lấy dữ liệu từ LocalStorage hoặc dùng mặc định
let products = JSON.parse(localStorage.getItem('shopProducts')) || defaultProducts;
let cartCount = 0;
let tempImage = ""; // Biến tạm lưu ảnh upload

// Hàm render sản phẩm ra màn hình
function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = products.map((p, index) => `
        <div class="product-card" onclick="orderProduct('${p.name}')">
            ${p.discount ? `<div class="discount-badge">${p.discount}<span>GIẢM</span></div>` : ''}
            <button class="delete-btn-card" onclick="event.stopPropagation(); deleteProduct(${index})">Xóa</button>
            <img src="${p.img}" alt="${p.name}" class="p-img">
            <div class="p-info">
                <div class="p-name">${p.name}</div>
                <div class="p-tags"><span class="mall-tag">Mall</span> <span style="background:orange; color:white; padding:1px 3px; border-radius:2px;">Rẻ Vô Địch</span></div>
                <div class="p-prices">
                    ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toLocaleString()}đ</span>` : ''}
                    <span class="price-new">${p.price.toLocaleString()}đ</span>
                </div>
                <div class="p-footer">
                    <span>Đã bán ${p.sold}</span>
                    <span>${p.loc}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Hàm đặt hàng (Demo)
function orderProduct(name) {
    // Nếu đang bật admin panel thì không đặt hàng
    if(document.getElementById('admin-panel').classList.contains('active')) return;
    
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    // Hiệu ứng Toast đơn giản
    alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// --- LOGIC ADMIN ---

function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('active');
    document.body.classList.toggle('admin-mode'); // Thêm class để hiện nút xóa
}

// Xử lý upload ảnh (Chuyển thành Base64 để lưu vào localStorage)
function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            tempImage = e.target.result; // Lưu chuỗi Base64
            document.getElementById('p-img').value = "Đã chọn ảnh từ máy!";
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProduct() {
    const name = document.getElementById('p-name').value;
    const price = parseInt(document.getElementById('p-price').value);
    const salePrice = parseInt(document.getElementById('p-sale').value);
    // Nếu có ảnh upload thì dùng, không thì dùng link ảnh
    let img = tempImage || document.getElementById('p-img').value;

    if (!name || !price) {
        alert("Vui lòng nhập tên và giá!");
        return;
    }
    
    if (!img) img = "https://via.placeholder.com/300"; // Ảnh mặc định nếu trống

    // Tính % giảm giá
    let discountTag = "";
    if (price > salePrice && salePrice > 0) {
        const percent = Math.round(((price - salePrice) / price) * 100);
        discountTag = percent + "%";
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: salePrice || price,
        oldPrice: salePrice ? price : null,
        sold: "0",
        loc: "Kho HN",
        img: img,
        discount: discountTag
    };

    products.unshift(newProduct); // Thêm vào đầu danh sách
    saveToStorage();
    renderProducts();
    
    // Reset form
    document.getElementById('p-name').value = "";
    document.getElementById('p-price').value = "";
    document.getElementById('p-sale').value = "";
    document.getElementById('p-img').value = "";
    tempImage = "";
    alert("Đã thêm sản phẩm mới!");
    toggleAdminPanel();
}

function deleteProduct(index) {
    if(confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
        products.splice(index, 1);
        saveToStorage();
        renderProducts();
    }
}

function saveToStorage() {
    localStorage.setItem('shopProducts', JSON.stringify(products));
}

function resetData() {
    if(confirm("Khôi phục lại dữ liệu mẫu ban đầu?")) {
        localStorage.removeItem('shopProducts');
        location.reload();
    }
}

// Khởi chạy
renderProducts();
