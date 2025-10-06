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

    // Form validation (simplified for static HTML)
    const checkoutForm = document.getElementById('checkoutForm');
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(checkoutForm);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Validate required fields
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
            window.location.href = 'order-success.html';
        }, 2000);
    });
    
    // Load order data (static values from HTML)
    function loadOrderData() {
        // Use static values from HTML - no dynamic cart loading
        orderTotal = 1100000; // Sample total from HTML
        checkWalletBalance();
    }
    
    // Load wallet balance and order data on page load
    loadWalletBalance();
    loadOrderData();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
