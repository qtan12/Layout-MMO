const fs = require('fs');
const path = require('path');

// Đọc file home.html
const htmlContent = fs.readFileSync('../../home.html', 'utf8');

// Tìm tất cả các icon được sử dụng
const iconMatches = htmlContent.match(/data-lucide="([^"]+)"/g);
const icons = [...new Set(iconMatches.map(match => match.replace('data-lucide="', '').replace('"', '')))];

console.log('Icons được sử dụng:');
icons.forEach(icon => console.log(`- ${icon}`));
console.log(`\nTổng cộng: ${icons.length} icons`);

// Lưu danh sách vào file
fs.writeFileSync('../../icons-used.txt', icons.join('\n'));
console.log('\nĐã lưu danh sách icons vào ../../icons-used.txt');
