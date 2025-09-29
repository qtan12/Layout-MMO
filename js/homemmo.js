// Homepage Alpine.js Component

function homepageComponent() {
    return {
        // Hot products data
        hotProducts: [
            {
                id: 'backlink-premium',
                name: 'Backlink Premium',
                category: 'SEO & Link Building',
                price: 500000,
                icon: 'link',
                description: 'Backlink chất lượng cao từ các website uy tín',
                gradientClass: 'from-emerald-500 to-green-600'
            },
            {
                id: 'facebook-clone-vip',
                name: 'Facebook Clone VIP',
                category: 'Tài khoản Facebook',
                price: 150000,
                icon: 'facebook',
                description: 'Tài khoản Facebook clone chất lượng cao',
                gradientClass: 'from-blue-500 to-indigo-600'
            },
            {
                id: 'tools-seo-pro',
                name: 'Tools SEO Pro',
                category: 'Data & Tools MMO',
                price: 1200000,
                icon: 'search',
                description: 'Bộ công cụ SEO chuyên nghiệp với đầy đủ tính năng',
                gradientClass: 'from-purple-500 to-pink-600'
            },
            {
                id: 'gmail-clone-vip',
                name: 'Gmail Clone VIP',
                category: 'Tài khoản Email',
                price: 200000,
                icon: 'mail',
                description: 'Tài khoản Gmail clone chất lượng cao',
                gradientClass: 'from-red-500 to-orange-600'
            },
            {
                id: 'tiktok-clone-premium',
                name: 'TikTok Clone Premium',
                category: 'Tài khoản Social khác',
                price: 300000,
                icon: 'music',
                description: 'Tài khoản TikTok clone chất lượng cao',
                gradientClass: 'from-pink-500 to-rose-600'
            },
            {
                id: 'windows-11-pro',
                name: 'Windows 11 Pro License',
                category: 'License Phần Mềm',
                price: 800000,
                icon: 'monitor',
                description: 'License Windows 11 Pro chính hãng',
                gradientClass: 'from-cyan-500 to-blue-600'
            },
            {
                id: 'vps-server-1gb',
                name: 'VPS Server 1GB',
                category: 'VPN/Proxy/Server',
                price: 150000,
                icon: 'server',
                description: 'VPS server 1GB RAM, 25GB SSD',
                gradientClass: 'from-teal-500 to-green-600'
            },
            {
                id: 'khoa-hoc-seo-master',
                name: 'Khóa học SEO Master',
                category: 'Khóa Học/TUT MMO',
                price: 2500000,
                icon: 'graduation-cap',
                description: 'Khóa học SEO từ cơ bản đến nâng cao',
                gradientClass: 'from-amber-500 to-yellow-600'
            }
        ],

        // Initialize homepage
        init() {
            console.log('Homepage component initialized.');
        },

        // Format price helper
        formatPrice(price) {
            return window.cartManager.formatPrice(price);
        },

        // Add item to cart - use Cart Manager
        addToCart(item) {
            console.log('Adding to cart:', item);
            window.cartManager.addToCart(item);
        }
    };
}

// Export for use in HTML
window.homepageComponent = homepageComponent;

// Make formatPrice available globally for Alpine.js templates
window.formatPrice = function(price) {
    return window.cartManager.formatPrice(price);
};
