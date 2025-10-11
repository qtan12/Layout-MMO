// Product Detail Alpine.js Component

function productDetailComponent() {
    return {
        // State
        activeTab: 'description',
        quantity: 1,
        isWishlisted: false,
        isAddingToCart: false,
        isBuyingNow: false,
        selectedGmailType: 'gmail-vn-aged-20-50',
        
        // Product data will be loaded from API or server
        product: null,

        // Initialize component
        init() {
            console.log('Product detail component initialized.');
            console.log('Product:', this.product);
        },

        // Methods
        setActiveTab(tab) {
            this.activeTab = tab;
        },

        isTabActive(tab) {
            return this.activeTab === tab;
        },

        // Helper methods
        formatPrice(price) {
            return window.cartManager.formatPrice(price);
        },

        getSavings() {
            // This will be calculated based on selected Gmail type
            return 2091000; // Static value for now
        },

        getTotalPrice() {
            // This will be calculated based on selected Gmail type and quantity
            return 899000 * this.quantity; // Static value for now
        },

        getTotalSavings() {
            return this.getSavings() * this.quantity;
        },

        getSelectedGmailType() {
            // This will be handled by the selected radio button in HTML
            return null;
        },

        getSelectedPrice() {
            const priceMap = {
                'gmail-vn-aged-20-50': '899.000đ',
                'gmail-vn-aged-30-80': '999.000đ',
                'gmail-vn-aged-40-90': '1.099.000đ',
                'gmail-vn-aged-60-120': '1.199.000đ',
                'gmail-vn-new-1day': '799.000đ'
            };
            return priceMap[this.selectedGmailType] || '899.000đ';
        },

        getSavingsText() {
            const priceMap = {
                'gmail-vn-aged-20-50': 899000,
                'gmail-vn-aged-30-80': 999000,
                'gmail-vn-aged-40-90': 1099000,
                'gmail-vn-aged-60-120': 1199000,
                'gmail-vn-new-1day': 799000
            };
            const selectedPrice = priceMap[this.selectedGmailType] || 899000;
            const savings = 2990000 - selectedPrice;
            return savings.toLocaleString('vi-VN') + 'đ';
        },

        selectGmailType(typeId) {
            this.selectedGmailType = typeId;
        },

        decreaseQuantity() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },

        increaseQuantity() {
            if (this.quantity < 50) { // Static limit for now
                this.quantity++;
            }
        },

        selectThumbnail(index) {
            // This will be handled by updating the main image src
            console.log('Selected thumbnail:', index);
        },

        toggleWishlist() {
            this.isWishlisted = !this.isWishlisted;
            
            if (window.fastNotice) {
                if (this.isWishlisted) {
                    window.fastNotice.success('Đã thêm vào danh sách yêu thích!');
                } else {
                    window.fastNotice.info('Đã xóa khỏi danh sách yêu thích!');
                }
            }
        },

        addToCart() {
            this.isAddingToCart = true;

            // Get selected Gmail type data
            const nameMap = {
                'gmail-vn-aged-20-50': 'Gmail VN Đã Ngâm 20-50 Ngày',
                'gmail-vn-aged-30-80': 'Gmail VN Đã Ngâm 30-80 Ngày',
                'gmail-vn-aged-40-90': 'Gmail VN Đã Ngâm 40-90 Ngày',
                'gmail-vn-aged-60-120': 'Gmail VN Đã Ngâm 60-120 Ngày',
                'gmail-vn-new-1day': 'Gmail VN Mới Reg 1 Ngày'
            };

            const priceMap = {
                'gmail-vn-aged-20-50': 899000,
                'gmail-vn-aged-30-80': 999000,
                'gmail-vn-aged-40-90': 1099000,
                'gmail-vn-aged-60-120': 1199000,
                'gmail-vn-new-1day': 799000
            };

            const name = nameMap[this.selectedGmailType];
            const price = priceMap[this.selectedGmailType];

            if (!name || !price) {
                this.isAddingToCart = false;
                return;
            }

            // Add to cart using Cart Manager
            const cartItem = {
                id: this.selectedGmailType,
                name: name,
                category: 'Tài khoản Streaming',
                price: price,
                originalPrice: 2990000,
                image: '/placeholder.svg?height=500&width=500&text=Netflix+Main',
                icon: this.getProductIcon()
            };

            // Add multiple items based on quantity
            for (let i = 0; i < this.quantity; i++) {
                window.cartManager.addToCart(cartItem);
            }

            // Simulate loading state
            setTimeout(() => {
                this.isAddingToCart = false;
            }, 500);
        },

        getProductIcon() {
            // Map product categories to icons
            const iconMap = {
                'Tài khoản Streaming': 'tv',
                'Tài khoản Social': 'users',
                'Software & License': 'monitor',
                'VPN & Proxy': 'shield',
                'SEO & Link Building': 'link',
                'Data & Tools MMO': 'search',
                'Tài khoản Email': 'mail',
                'Tài khoản Facebook': 'facebook',
                'Tài khoản Social khác': 'share-2'
            };
            return iconMap['Tài khoản Streaming'] || 'package';
        },

        buyNow() {
            this.isBuyingNow = true;

            // Simulate loading state
            setTimeout(() => {
                this.isBuyingNow = false;
                
                // Show success notification
                if (window.fastNotice) {
                    window.fastNotice.success('Đang chuyển hướng đến trang thanh toán...');
                }

                // Simulate redirect to checkout page
                setTimeout(() => {
                    console.log('Redirecting to checkout page...');
                    // window.location.href = '/checkout';
                }, 1000);
            }, 1500);
        },

        async share() {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Netflix Premium 1 Năm - 4K Ultra HD',
                        text: 'Xem sản phẩm này tại MMO Store',
                        url: window.location.href
                    });
                } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(window.location.href);
                    if (window.fastNotice) {
                        window.fastNotice.success('Đã sao chép link vào clipboard!');
                    }
                }
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };
}

// FAQ Component
function faqComponent() {
    return {
        // State
        openFaqs: [true, false, false, false, false], // First FAQ is open by default
        
        // Initialize component
        init() {
            console.log('FAQ component initialized.');
        },
        
        // Methods
        toggleFaq(index) {
            this.openFaqs[index] = !this.openFaqs[index];
        }
    };
}

// Export for use in HTML
window.productDetailComponent = productDetailComponent;
window.faqComponent = faqComponent;
