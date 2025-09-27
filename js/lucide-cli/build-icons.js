#!/usr/bin/env node

/**
 * Lucide Icons Builder
 * Tự động tạo file JS tùy chỉnh chỉ chứa các icon đã sử dụng
 * 
 * Usage:
 *   node build-icons.js [html-file]
 * 
 * Examples:
 *   node build-icons.js                    # Sử dụng home.html mặc định
 *   node build-icons.js about.html         # Sử dụng about.html
 *   node build-icons.js ../pages/*.html    # Sử dụng nhiều file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lấy file HTML từ arguments hoặc sử dụng mặc định
const htmlFile = process.argv[2] || '../../home.html';

console.log('🚀 Lucide Icons Builder');
console.log('========================');
console.log(`📁 HTML File: ${htmlFile}`);
console.log('');

try {
    // Bước 1: Extract icons từ HTML
    console.log('1️⃣ Extracting icons from HTML...');
    const extractScript = `
        const fs = require('fs');
        const htmlContent = fs.readFileSync('${htmlFile}', 'utf8');
        const iconMatches = htmlContent.match(/data-lucide="([^"]+)"/g);
        const icons = [...new Set(iconMatches.map(match => match.replace('data-lucide="', '').replace('"', '')))];
        fs.writeFileSync('../../icons-used.txt', icons.join('\\n'));
        console.log(\`Found \${icons.length} unique icons\`);
    `;
    
    fs.writeFileSync('temp-extract.js', extractScript);
    execSync('node temp-extract.js', { stdio: 'inherit' });
    fs.unlinkSync('temp-extract.js');
    
    // Bước 2: Tạo file JS tùy chỉnh
    console.log('\n2️⃣ Building custom Lucide JS...');
    execSync('node create-custom-lucide.js', { stdio: 'inherit' });
    
    // Bước 3: Hiển thị kết quả
    console.log('\n3️⃣ Results:');
    const customFile = '../lucide-custom.js';
    const minifiedFile = '../lucide-custom.min.js';
    const originalFile = '../lucide.0.544.0.js';
    
    if (fs.existsSync(customFile)) {
        const stats = fs.statSync(customFile);
        const minifiedStats = fs.existsSync(minifiedFile) ? fs.statSync(minifiedFile) : null;
        const originalSize = fs.existsSync(originalFile) ? fs.statSync(originalFile).size : 0;
        
        console.log(`✅ Custom file created: ${customFile}`);
        console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        if (minifiedStats) {
            console.log(`✅ Minified file created: ${minifiedFile}`);
            console.log(`📊 Size: ${(minifiedStats.size / 1024).toFixed(2)} KB`);
        }
        
        if (originalSize > 0) {
            const savings = ((originalSize - stats.size) / originalSize * 100).toFixed(1);
            const minifiedSavings = minifiedStats ? ((originalSize - minifiedStats.size) / originalSize * 100).toFixed(1) : 0;
            
            console.log(`💾 Savings (normal): ${savings}% (${(originalSize / 1024).toFixed(2)}KB → ${(stats.size / 1024).toFixed(2)}KB)`);
            if (minifiedStats) {
                console.log(`💾 Savings (minified): ${minifiedSavings}% (${(originalSize / 1024).toFixed(2)}KB → ${(minifiedStats.size / 1024).toFixed(2)}KB)`);
            }
        }
    }
    
    console.log('\n🎉 Build completed successfully!');
    console.log('💡 To use: Replace your Lucide script with: <script src="js/lucide-custom.js"></script>');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
