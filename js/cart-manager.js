// Global Cart Manager for MMO Store
// This manages cart state across all pages

class CartManager {
    constructor() {
        this.cartItems = [];
        this.listeners = [];
        this.storageKey = 'mmo_cart';
        this.loadFromStorage();
    }

    // Add item to cart
    addToCart(item) {
        const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cartItems.push({
                ...item,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.notifyListeners('add', item);
        return item;
    }

    // Remove item from cart
    removeFromCart(itemId) {
        const item = this.cartItems.find(item => item.id === itemId);
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.notifyListeners('remove', item);
        return item;
    }

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.cartItems.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveToStorage();
            this.notifyListeners('update', item);
        }
        return item;
    }


    // Clear cart
    clearCart() {
        this.cartItems = [];
        this.saveToStorage();
        this.notifyListeners('clear');
    }

    // Get cart count (total quantity)
    getCartCount() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart items count
    getCartItemsCount() {
        return this.cartItems.length;
    }

    // Get cart total
    getCartTotal() {
        return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get discount amount
    getDiscount() {
        return this.cartItems
            .reduce((total, item) => {
                const originalPrice = item.originalPrice || item.price;
                return total + ((originalPrice - item.price) * item.quantity);
            }, 0);
    }

    // Get all cart items
    getCartItems() {
        return [...this.cartItems];
    }


    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem(this.storageKey);
            if (savedCart) {
                this.cartItems = JSON.parse(savedCart);
            } else {
                // Add some sample items for demo
                this.cartItems = [
                    {
                        id: 'netflix-premium-1year',
                        name: 'Netflix Premium 1 Năm - 4K Ultra HD',
                        category: 'Tài khoản Streaming',
                        price: 899000,
                        originalPrice: 2090000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop&crop=center',
                        icon: 'tv'
                    },
                    {
                        id: 'spotify-premium-1year',
                        name: 'Spotify Premium 1 Năm - Không quảng cáo',
                        category: 'Tài khoản Streaming',
                        price: 599000,
                        originalPrice: 1200000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center',
                        icon: 'music'
                    },
                    {
                        id: 'windows-11-pro',
                        name: 'Windows 11 Pro - Key bản quyền',
                        category: 'Software & License',
                        price: 299000,
                        originalPrice: 5490000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop&crop=center',
                        icon: 'monitor'
                    }
                ];
                this.saveToStorage();
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.cartItems = [];
        }
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notify all listeners
    notifyListeners(action, data) {
        this.listeners.forEach(listener => {
            try {
                listener(action, data, this.getCartItems());
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.fastNotice) {
            window.fastNotice.show(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Create global instance
window.cartManager = new CartManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
