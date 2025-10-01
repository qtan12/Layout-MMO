// Cart Alpine.js Component

function cartComponent() {
    return {
        // State
        isProcessing: false,
        
        // Cart data - Now synced with global Cart Manager
        cartItems: [],

        // Computed properties
        get selectedItemsCount() {
            return this.cartItems.length;
        },

        get subtotal() {
            return this.cartItems
                .reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        get discount() {
            return this.cartItems
                .reduce((total, item) => {
                    const originalPrice = item.originalPrice || item.price;
                    return total + ((originalPrice - item.price) * item.quantity);
                }, 0);
        },

        get cartTotal() {
            return this.subtotal;
        },

        // Initialize component
        init() {
            console.log('Cart component initialized.');
            this.initCartItems();
            this.setupCartSync();
            this.updateCartTotal();
        },

        // Initialize cart items from Cart Manager
        initCartItems() {
            this.cartItems = window.cartManager.getCartItems();
        },

        // Setup cart synchronization
        setupCartSync() {
            // Subscribe to cart changes
            this.unsubscribe = window.cartManager.subscribe((action, data, cartItems) => {
                // Update local cart items to trigger Alpine.js reactivity
                this.cartItems = [...cartItems];
                // Force Alpine.js to re-evaluate reactive properties
                this.$nextTick(() => {
                    this.updateCartTotal();
                });
            });
        },

        // Methods
        formatPrice(price) {
            return window.cartManager.formatPrice(price);
        },

        updateCartTotal() {
            // Get totals from Cart Manager
            const selectedCount = window.cartManager.getCartItemsCount();
            const total = window.cartManager.getCartTotal();
            
            // Update display
            this.updateDisplay(selectedCount, total);
        },

        updateDisplay(selectedCount, total) {
            // Update cart header
            const cartInfo = document.querySelector('[x-text*="sản phẩm"]');
            if (cartInfo) {
                cartInfo.textContent = `${selectedCount} sản phẩm • Tổng cộng: ${this.formatPrice(total)}`;
            }
            
            // Update order summary
            const selectedItemsSpan = document.getElementById('selected-count');
            if (selectedItemsSpan) {
                selectedItemsSpan.textContent = selectedCount;
            }
            
            const subtotalSpan = document.getElementById('subtotal');
            if (subtotalSpan) {
                subtotalSpan.textContent = this.formatPrice(total);
            }
            
            const totalSpan = document.getElementById('total');
            if (totalSpan) {
                totalSpan.textContent = this.formatPrice(total);
            }
            
            // Update checkout button
            const checkoutButton = document.querySelector('[x-show="!isProcessing"]');
            if (checkoutButton) {
                checkoutButton.textContent = `Thanh toán (${selectedCount})`;
            }
        },

        removeItem(itemId) {
            const item = window.cartManager.removeFromCart(itemId);
            if (item) {
                window.cartManager.showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
            }
        },

        clearCart() {
            window.cartManager.clearCart();
            window.cartManager.showNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng!', 'success');
        },

        async proceedToCheckout() {
            const selectedCount = window.cartManager.getCartItemsCount();
            
            if (selectedCount === 0) {
                window.cartManager.showNotification('Giỏ hàng trống!', 'warning');
                return;
            }

            this.isProcessing = true;

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                window.cartManager.showNotification('Đang chuyển hướng đến trang thanh toán...', 'success');

                // Simulate redirect to checkout page
                setTimeout(() => {
                    console.log('Redirecting to checkout page...');
                    // window.location.href = '/checkout';
                }, 1000);

            } catch (error) {
                console.error('Checkout error:', error);
                window.cartManager.showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
            } finally {
                this.isProcessing = false;
            }
        },

        // Cleanup on destroy
        destroy() {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
        }
    };
}

// Export for use in HTML
window.cartComponent = cartComponent;
