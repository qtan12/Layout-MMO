## 📋 Yêu cầu hệ thống

### JavaScript Libraries

- Alpine.js 3.15.0+
- Lucide Icons (cho icons)

### Dependencies

- `js/header.js` - Chứa logic giỏ hàng chính
- `js/notification.js` - Thư viện thông báo

## 🎯 Cách sử dụng cho từng trường hợp

### Trang sản phẩm đơn lẻ

```html
<div x-data="productCardComponent()">
  <button @click="addToCart(productData)">Thêm vào giỏ</button>
</div>
```

### Danh sách sản phẩm

```html
<div x-data="productCardComponent()">
  <template x-for="product in products" :key="product.id">
    <div class="product-card">
      <button @click="addToCart(product)">Thêm vào giỏ</button>
    </div>
  </template>
</div>
```

### Trang chi tiết sản phẩm

```html
<div x-data="productCardComponent()">
  <button @click="addToCart(currentProduct)">Mua ngay</button>
</div>
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **"window.addToCart function not found"**

   - ✅ Kiểm tra `js/header.js` đã được load
   - ✅ Đảm bảo thứ tự load script đúng

2. **Nút không hoạt động**

   - ✅ Kiểm tra có `x-data` directive
   - ✅ Kiểm tra Alpine.js đã load
   - ✅ Xem console để debug

3. **Thông báo không hiển thị**
   - ✅ Kiểm tra `js/notification.js`
   - ✅ Kiểm tra `window.fastNotice`

### Debug

```javascript
// Mở Developer Tools (F12) và xem console
console.log("Adding to cart:", productData);
```
