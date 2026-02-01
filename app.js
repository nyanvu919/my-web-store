const products = [
    { id: 1, name: "iPhone 15 Pro Max", price: 29500000, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500" },
    { id: 2, name: "MacBook Air M3 2024", price: 27900000, img: "https://images.unsplash.com/photo-1517336714460-d150839c4a8d?w=500" },
    { id: 3, name: "Sony WH-1000XM5", price: 6500000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
    { id: 4, name: "Apple Watch Series 9", price: 9200000, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" }
];

let cart = [];

// Hiển thị sản phẩm
function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.img}" class="product-img">
            <h3>${p.name}</h3>
            <p class="price">${p.price.toLocaleString()}đ</p>
            <button class="add-btn" onclick="addToCart(${p.id})">Thêm vào giỏ hàng</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    updateUI();
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map((item, index) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px">
            <span>${item.name}</span>
            <b>${item.price.toLocaleString()}đ</b>
            <button onclick="removeItem(${index})" style="border:none; color:red; cursor:pointer">Xóa</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = total.toLocaleString() + 'đ';
}

function removeItem(index) {
    cart.splice(index, 1);
    updateUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function sendOrder() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    
    if(!name || !phone || cart.length === 0) {
        alert("Vui lòng điền thông tin và chọn sản phẩm!");
        return;
    }

    const message = `Khách hàng: ${name}\nSĐT: ${phone}\nĐơn hàng: ${cart.length} món\nTổng: ${document.getElementById('cart-total').innerText}`;
    alert("Đã nhận đơn hàng!\n" + message);
    
    // Xóa giỏ hàng sau khi đặt
    cart = [];
    updateUI();
    toggleCart();
}

renderProducts();