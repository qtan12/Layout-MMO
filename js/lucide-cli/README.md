# Lucide Icons Builder

Tự động tạo file JS tùy chỉnh chỉ chứa các icon đã sử dụng trong dự án.

## 🚀 Cách sử dụng

### 1. Build nhanh (khuyến nghị)
```bash
node build-icons.js
```

### 2. Build với file HTML cụ thể
```bash
node build-icons.js ../about.html
node build-icons.js ../pages/*.html
```

### 3. Build thủ công từng bước
```bash
# Bước 1: Extract icons từ HTML
node extract-icons.js

# Bước 2: Tạo file JS tùy chỉnh
node create-custom-lucide.js
```

## 📁 Files

- `build-icons.js` - Script chính, tự động hóa toàn bộ quy trình
- `extract-icons.js` - Extract icons từ HTML file
- `create-custom-lucide.js` - Tạo file JS tùy chỉnh
- `icons-used.txt` - Danh sách icons đã sử dụng (tự động tạo)

### Output Files
- `lucide-custom.js` - File JS đầy đủ (readable)
- `lucide-custom.min.js` - File JS minified (production)

## 🎯 Tính năng

### ✅ Tự động convert tên icon
- `map-pin` → `MapPin`
- `chevron-down` → `ChevronDown`
- `building-2` → `Building2`
- `bar-chart-3` → `BarChart3`

### ✅ Tìm kiếm thông minh
- Tự động tìm icon tương tự nếu không tìm thấy chính xác
- Hỗ trợ các biến thể tên icon
- Báo cáo icons không tìm thấy

### ✅ Tối ưu dung lượng
- Chỉ chứa icons đã sử dụng
- Tiết kiệm 90%+ dung lượng
- Tương thích hoàn toàn với `data-lucide`

## 📊 Kết quả

```
✅ Đã tạo file lucide-custom.js với 85 icons
📁 File: ../lucide-custom.js
📊 Kích thước: 34.48 KB

✅ Đã tạo file lucide-custom.min.js (minified)
📁 File: ../lucide-custom.min.js
📊 Kích thước: 22.15 KB

💾 Tiết kiệm (normal): 90.5% (364KB → 34KB)
💾 Tiết kiệm (minified): 93.9% (364KB → 22KB)
```

## 🔧 Cấu hình

### Thay đổi file HTML mặc định
Sửa dòng 12 trong `build-icons.js`:
```javascript
const htmlFile = process.argv[2] || '../../your-file.html';
```

### Thêm mapping tùy chỉnh
Sửa hàm `findIconInLucide()` trong `create-custom-lucide.js`:
```javascript
// Thêm mapping đặc biệt
const customMapping = {
    'special-icon': 'SpecialIconName'
};
```

## 🐛 Troubleshooting

### Icon không tìm thấy
1. Kiểm tra tên icon tại https://lucide.dev/icons/
2. Thêm mapping tùy chỉnh trong `create-custom-lucide.js`
3. Kiểm tra file `icons-used.txt` để xem icons được extract

### File không tạo được
1. Đảm bảo có quyền ghi file
2. Kiểm tra đường dẫn file HTML
3. Chạy `npm install` để cài đặt tất cả dependencies

## 📝 Ví dụ sử dụng

### HTML
```html
<i data-lucide="map-pin"></i>
<i data-lucide="chevron-down"></i>
<i data-lucide="building-2"></i>
```

### JavaScript
```javascript
// File lucide-custom.js sẽ tự động khởi tạo
// Hoặc gọi thủ công:
lucide.createIcons();
```

## 🎉 Kết quả

Sau khi build, thay thế script Lucide gốc:

### Development
```html
<script src="js/lucide-custom.js"></script>
```

### Production (Recommended)
```html
<script src="js/lucide-custom.min.js"></script>
```

### So sánh với file gốc
```html
<!-- File gốc (364KB) -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

<!-- File tùy chỉnh (34KB) -->
<script src="js/lucide-custom.js"></script>

<!-- File minified (22KB) -->
<script src="js/lucide-custom.min.js"></script>
```
