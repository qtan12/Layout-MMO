// Checkout Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Wallet balance (in VND, synced with header)
    let currentWalletBalance = 0;
    let orderTotal = 0;
    
    // Load wallet balance from localStorage (same as header)
    function loadWalletBalance() {
        const savedBalance = localStorage.getItem('walletBalance');
        if (savedBalance) {
            currentWalletBalance = parseFloat(savedBalance);
        } else {
            currentWalletBalance = 68400000; // Default balance ₫68,400,000
        }
        updateWalletBalance();
    }
    
    // Update wallet balance display (VND format)
    function updateWalletBalance() {
        document.getElementById('currentWalletBalance').textContent = `₫${currentWalletBalance.toLocaleString()}`;
    }
    
    // Check if wallet has sufficient balance
    function checkWalletBalance() {
        const insufficientWarning = document.getElementById('insufficientBalanceWarning');
        const requiredAmount = document.getElementById('requiredAmount');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (orderTotal > currentWalletBalance) {
            const needed = orderTotal - currentWalletBalance;
            requiredAmount.textContent = `₫${needed.toLocaleString()}`;
            insufficientWarning.classList.remove('hidden');
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            insufficientWarning.classList.add('hidden');
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    // Top up wallet button
    document.getElementById('topUpWalletBtn').addEventListener('click', function() {
        // Open wallet modal (you can integrate with existing wallet modal)
        if (typeof window.openWalletModal === 'function') {
            window.openWalletModal();
        } else {
            alert('Chức năng nạp tiền sẽ được mở trong modal ví');
        }
    });

    // Form validation
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(checkoutForm);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Validate required fields (removed address, added username)
        const requiredFields = ['fullName', 'email', 'phone', 'username', 'agreeTerms'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            if (!element || !element.value) {
                isValid = false;
                element.classList.add('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
            } else {
                element.classList.remove('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
            }
        });
        
        if (!isValid) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Check wallet balance before processing
        if (orderTotal > currentWalletBalance) {
            alert('Số dư ví không đủ. Vui lòng nạp thêm tiền vào ví trước khi thanh toán.');
            return;
        }
        
        // Show loading state
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = `
            <div class="loading loading-sm mr-2"></div>
            Đang xử lý thanh toán...
        `;
        
        // Simulate payment processing with wallet deduction
        setTimeout(() => {
            // Deduct amount from wallet (VND)
            currentWalletBalance -= orderTotal;
            
            // Save updated balance to localStorage (sync with header)
            localStorage.setItem('walletBalance', currentWalletBalance.toString());
            
            // Update display
            updateWalletBalance();
            
            // Clear cart
            localStorage.removeItem('cartItems');
            
            // Redirect to success page
            window.location.href = '/order-success.html';
        }, 2000);
    });
    
    // Load cart items from localStorage
    function loadCartItems() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const orderItemsContainer = document.getElementById('orderItems');
        const itemCountElement = document.getElementById('itemCount');
        
        if (cartItems.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="shopping-cart" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-500 text-lg font-medium">Giỏ hàng trống</p>
                    <p class="text-gray-400 text-sm mt-2">Vui lòng thêm sản phẩm vào giỏ hàng</p>
                </div>
            `;
            itemCountElement.textContent = '0 sản phẩm';
            return;
        }
        
        // Render cart items
        orderItemsContainer.innerHTML = cartItems.map(item => `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="bg-icon">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">${item.name}</p>
                    <p class="text-sm text-gray-500">${item.category}</p>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-sm font-semibold text-emerald-600">₫${item.price.toLocaleString()}</span>
                        <span class="text-xs text-gray-500">x${item.quantity}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update item count
        itemCountElement.textContent = `${cartItems.length} sản phẩm`;
        
        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = 100000; // Sample discount
        const total = subtotal - discount;
        
        // Update order total for wallet check
        orderTotal = total;
        
        document.getElementById('subtotal').textContent = `₫${subtotal.toLocaleString()}`;
        document.getElementById('total').textContent = `₫${total.toLocaleString()}`;
        
        // Check wallet balance after calculating total
        checkWalletBalance();
    }
    
    // Load wallet balance and cart items on page load
    loadWalletBalance();
    loadCartItems();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
