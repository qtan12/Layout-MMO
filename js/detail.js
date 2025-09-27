// Product Detail Alpine.js Component

function productDetailComponent() {
    return {
        // State
        activeTab: 'description',
        quantity: 1,
        isWishlisted: false,
        isAddingToCart: false,
        isBuyingNow: false,
        
        // Product data
        product: {
            id: 'netflix-premium-1year',
            name: 'Netflix Premium 1 Năm - 4K Ultra HD',
            category: 'Tài khoản Streaming',
            price: 899000,
            originalPrice: 2990000,
            discount: 70,
            rating: 4.8,
            reviewCount: 1247,
            soldCount: 3420,
            available: 50,
            description: 'Tài khoản Netflix Premium chính hãng với chất lượng 4K Ultra HD, hỗ trợ 4 thiết bị cùng lúc. Bảo hành 12 tháng, thay thế miễn phí nếu có lỗi.',
            features: [
                'Chất lượng 4K Ultra HD',
                'Hỗ trợ 4 thiết bị cùng lúc',
                'Thư viện phim khổng lồ',
                'Không quảng cáo',
                'Tải xuống offline',
                'Hỗ trợ HDR'
            ],
            specifications: {
                'Chất lượng': '4K Ultra HD',
                'Số thiết bị': '4 thiết bị cùng lúc',
                'Hỗ trợ': 'HDR, Dolby Vision',
                'Tải xuống': 'Có',
                'Quảng cáo': 'Không',
                'Bảo hành': '12 tháng'
            },
            warranty: {
                period: '12 tháng',
                type: 'Thay thế miễn phí',
                support: 'Hỗ trợ 24/7'
            }
        },
        
        mainImageSrc: '/placeholder.svg?height=500&width=500&text=Netflix+Main',
        mainImageAlt: 'Netflix Premium 1 Năm - 4K Ultra HD',

        // Thumbnail images
        thumbnails: [
            {
                src: '/placeholder.svg?height=500&width=500&text=Netflix+Main',
                alt: 'Netflix Premium 1 Năm - 4K Ultra HD 1',
                active: true
            },
            {
                src: '/placeholder.svg?height=500&width=500&text=Netflix+2',
                alt: 'Netflix Premium 1 Năm - 4K Ultra HD 2',
                active: false
            },
            {
                src: '/placeholder.svg?height=500&width=500&text=Netflix+3',
                alt: 'Netflix Premium 1 Năm - 4K Ultra HD 3',
                active: false
            },
            {
                src: '/placeholder.svg?height=500&width=500&text=Netflix+4',
                alt: 'Netflix Premium 1 Năm - 4K Ultra HD 4',
                active: false
            }
        ],

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
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        },

        getSavings() {
            return this.product.originalPrice - this.product.price;
        },

        getTotalPrice() {
            return this.product.price * this.quantity;
        },

        getTotalSavings() {
            return this.getSavings() * this.quantity;
        },

        decreaseQuantity() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },

        increaseQuantity() {
            if (this.quantity < this.product.available) {
                this.quantity++;
            }
        },

        selectThumbnail(index) {
            // Update active state
            this.thumbnails.forEach((thumb, i) => {
                thumb.active = i === index;
            });

            // Update main image
            const selectedThumb = this.thumbnails[index];
            this.mainImageSrc = selectedThumb.src;
            this.mainImageAlt = selectedThumb.alt;
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

            // Simulate loading state
            setTimeout(() => {
                this.isAddingToCart = false;
                
                // Show success notification
                if (window.fastNotice) {
                    window.fastNotice.success('Đã thêm sản phẩm vào giỏ hàng!');
                }
            }, 1000);
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

// Export for use in HTML
window.productDetailComponent = productDetailComponent;
