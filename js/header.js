// Header Alpine.js Component

// ===========================================
// USER CACHE CONFIGURATION
// ===========================================
const USER_CACHE_DURATION = 10 * 60 * 1000; // 10 phút (milliseconds)
const USER_CACHE_KEY = 'user_cache';
const USER_CACHE_AT = 'user_cache_at';

// ===========================================
// GLOBAL NOTIFICATION FUNCTION
// ===========================================
function sendNotice(message, type = 'info', duration = null, position = null) {
    // Sử dụng FastNotice (đã được khởi tạo trong home.html)
    if (window.fastNotice) {
        const options = {};
        if (duration !== null) {
            options.duration = duration;
        }
        if (position !== null) {
            options.position = position;
        }
        window.fastNotice.show(message, type, options);
    } else {
        // Fallback nếu thư viện chưa load
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ===========================================
// GLOBAL USER CACHE FUNCTIONS
// ===========================================
function refreshUserData() {
    // Gọi refresh user data từ header component
    // Dùng khi cần lấy data mới nhất từ server (bỏ qua cache)
    // Ví dụ: Sau khi user cập nhật profile, cần data mới nhất
    window.dispatchEvent(new CustomEvent('refresh-user-data'));
}

function clearUserCache() {
    // Xóa user cache (không gọi API)
    // Dùng khi muốn force reload data từ server ở lần tiếp theo
    try {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(USER_CACHE_AT);
        console.log('User cache cleared globally');
    } catch (error) {
        console.warn('Failed to clear user cache globally:', error);
    }
}

// ===========================================
// XHR UTILITY - Tương tự jQuery AJAX
// ===========================================
window.xhr = function(options) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const method = (options.method || 'GET').toUpperCase();
        const url = options.url;
        const data = options.data || null;
        const headers = options.headers || {};
        const timeout = options.timeout || 30000;

        // Setup XHR
        xhr.open(method, url, true);
        xhr.timeout = timeout;

        // Set withCredentials
        const isCrossOrigin = !url.startsWith('/') && !url.startsWith(window.location.origin);
        xhr.withCredentials = options.withCredentials !== undefined ? options.withCredentials : !isCrossOrigin;

        // Set headers
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Set custom headers
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        // Event handlers
        xhr.onload = function() {
            const response = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders(),
                data: null
            };

            try {
                response.data = JSON.parse(xhr.responseText);
            } catch (e) {
                response.data = xhr.responseText;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(response);
            } else {
                reject(response);
            }
        };

        xhr.onerror = function() {
            const isCorsError = xhr.status === 0 && xhr.statusText === '';
            reject({
                status: 0,
                statusText: isCorsError ? 'CORS Error' : 'Network Error',
                data: { 
                    message: isCorsError 
                        ? 'Lỗi CORS: Không thể kết nối tới server do lỗi CORS, hãy báo cho ADMIN' 
                        : 'Lỗi kết nối mạng, hãy thử lại',
                    isCorsError: isCorsError
                }
            });
        };

        xhr.ontimeout = function() {
            reject({
                status: 0,
                statusText: 'Timeout',
                data: { message: 'Yêu cầu quá thời gian chờ' }
            });
        };

        // Send data - Simple and effective like jQuery
        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                // FormData - don't set Content-Type, let browser handle it
                xhr.send(data);
            } else if (typeof data === 'string') {
                // String data - send as-is
                xhr.send(data);
            } else if (typeof data === 'object') {
                // Object data - check Content-Type
                const contentType = headers['Content-Type'] || headers['content-type'] || '';
                
                if (contentType.includes('application/x-www-form-urlencoded')) {
                    // Convert object to URL-encoded string
                    const params = new URLSearchParams();
                    Object.keys(data).forEach(key => {
                        params.append(key, data[key]);
                    });
                    xhr.send(params.toString());
                } else {
                    // Default to JSON
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify(data));
                }
            } else {
                xhr.send(data);
            }
        } else {
            xhr.send();
        }
    });
};

function headerComponent() {
    return {
        searchQuery: '', 
        mobileSearchQuery: '', 
        isAuthModalOpen: false,
        mobileMenuOpen: false,
        showCart: false,
        cartItems: [],
        cartCount: 0,
        cartTotal: 0,
        user: null,
        authTab: 'login',
        loginForm: {
            email: '',
            password: '',
            remember: false
        },
        registerForm: {
            fullname: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            agree: false
        },
        isLoading: false,
        errors: {},
        showDepositModal: false,
        userBalance: 2847.50,

        init() {
            console.log('Header component initialized.');
            this.initializeAuth();
            this.initializeCart();

            // Listen for auth modal open requests from other components
            window.addEventListener('open-auth-modal', (event) => {
                this.authTab = event.detail.tab || 'login';
                this.errors = {};
                this.isLoading = false;
                this.openAuthModal();
            });

            // Listen for user data requests from other components
            window.addEventListener('get-user-data', () => {
                this.sendUserData();
            });

            // Listen for refresh user data requests
            window.addEventListener('refresh-user-data', () => {
                this.refreshUserData();
            });

        // Listen for add to cart requests from other components
        window.addEventListener('add-to-cart', (event) => {
            this.addToCart(event.detail.item);
        });

        // Create global addToCart function
        window.addToCart = (item) => {
            // Find the header component instance and call its addToCart method
            const headerElement = document.querySelector('[x-data*="headerComponent"]');
            if (headerElement && headerElement._x_dataStack) {
                const headerComponent = headerElement._x_dataStack[0];
                if (headerComponent && headerComponent.addToCart) {
                    headerComponent.addToCart(item);
                }
            }
        };

        // Create global helper for add to cart buttons
        window.createAddToCartButton = (item, buttonText = 'Thêm vào giỏ', buttonClass = 'btn btn-primary') => {
            return `
                <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                        class="${buttonClass}">
                    <i data-lucide="shopping-cart" class="w-4 h-4 mr-2"></i>
                    ${buttonText}
                </button>
            `;
        };
        },

        async initializeAuth() {
            const token = this.getAccessToken();
            if (!token) {
                this.setUser(null);
                return;
            }

            // Kiểm tra cache trước
            const cachedUser = this.getCachedUserData();
            if (cachedUser) {
                this.setUser(cachedUser, true); //set User Data from init Auth when load Page
                return;
            }

            // Nếu không có cache, gọi API
            await this.fetchUserDataFromAPI();
        },

        // Hàm chính để set user và thông báo thay đổi
        setUser(user = null, initAuth = false) {
            this.user = user;
            this.updateAuthUI();
            // Cache user data nếu có user
            if (user) {
                if (!initAuth){
                    //Send Data User ngay lập tức vì đây là gửi User Data khi ứng dụng & all components đã chạy load hoàn tất rồi.
                    this.sendUserData();
                    this.cacheUserData(user);
                }else{
                    //Cần delay vì header được tải trước nhưng có nhiều components chưa được tải.
                    setTimeout(($this) => {
                        $this.sendUserData();
                    }, 500, this);
                }
            } else {
                this.sendUserData();
                this.clearUserCache();
            }
        },

        // Cache user data vào localStorage
        cacheUserData(user) {
            const userCache = {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                status: user.status,
                avatar: user.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAEElEQVR4nGLy8P0ACAAA//8CbgGIf795rQAAAABJRU5ErkJggg=='
            };
            
            try {
                localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userCache));
                localStorage.setItem(USER_CACHE_AT, Date.now().toString());
                console.log('User data cached successfully');
            } catch (error) {
                console.warn('Failed to cache user data:', error);
            }
        },

        // Lấy user data từ cache
        getCachedUserData() {
            try {
                const cachedData = localStorage.getItem(USER_CACHE_KEY);
                const timestamp = localStorage.getItem(USER_CACHE_AT);
                
                if (!cachedData || !timestamp) {
                    return null;
                }
                
                const cacheAge = Date.now() - parseInt(timestamp);
                if (cacheAge > USER_CACHE_DURATION) {
                    console.log('User cache expired');
                    this.clearUserCache();
                    return null;
                }
                
                console.log('User data loaded from cache');
                return JSON.parse(cachedData);
            } catch (error) {
                console.warn('Failed to load cached user data:', error);
                this.clearUserCache();
                return null;
            }
        },

        // Xóa user cache
        clearUserCache() {
            try {
                localStorage.removeItem(USER_CACHE_KEY);
                localStorage.removeItem(USER_CACHE_AT);
                console.log('User cache cleared');
            } catch (error) {
                console.warn('Failed to clear user cache:', error);
            }
        },

        // Hàm chung để gọi API users/info
        async fetchUserDataFromAPI() {
            const token = this.getAccessToken();
            if (!token) {
                this.setUser(null);
                return;
            }

            try {
                const response = await window.xhr({
                    method: 'GET',
                    url: API_URL + 'users/info/',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: false,
                    timeout: 10000
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    this.setUser(response.data.data.me);
                    console.log('User data fetched from API');
                } else {
                    sendNotice('Tài khoản không tồn tại hoặc bị khóa do vi phạm điều khoản', 'error');
                    this.setUser(null);
                    this.clearAccessToken();
                }
            } catch (error) {
                if (error.data?.message) {
                    if (error.data.message == 'User_not_found') {
                        error.data.message = 'Tài khoản không tồn tại hoặc bị khóa do vi phạm điều khoản';
                    }
                    sendNotice(error.data.message, 'error');
                } else {
                    sendNotice('Không tải được thông tin tài khoản, hãy thử lại', 'error');
                }
                this.setUser(null);
            }
        },

        // Refresh user data từ API (bỏ qua cache) - dùng khi cần data mới nhất
        async refreshUserData() {
            console.log('Refreshing user data from API...');
            // Xóa cache cũ trước khi fetch data mới
            this.clearUserCache();
            await this.fetchUserDataFromAPI();
        },

        // Gửi user data đến tất cả components
        sendUserData() {
            window.dispatchEvent(new CustomEvent('user-data-ready', {
                detail: { user: this.user }
            }));
            window.dispatchEvent(new CustomEvent('auth-status-changed', {
                detail: { user: this.user }
            }));
        },

        closeAuthModal() {
            this.isAuthModalOpen = false;
            this.authTab = 'login';
            this.errors = {};
            this.loginForm = { email: '', password: '', remember: false };
            this.registerForm = { fullname: '', username: '', email: '', password: '', confirmPassword: '', phone: '', agree: false };
            this.isLoading = false;
            // Add hidden class back when closing modal
            this.$nextTick(() => {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    modal.classList.add('hidden');
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },
        
        openAuthModal() {
            this.isAuthModalOpen = true;
            this.errors = {};
            this.isLoading = false;
            // Set default tab if not already set
            if (!this.authTab) {
                this.authTab = 'login';
            }
            // Remove hidden class when opening modal
            this.$nextTick(() => {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    modal.classList.remove('hidden');
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },
        
        openMobileMenu(focusSearch = false) {
            this.mobileMenuOpen = true;
            // Remove hidden class when opening mobile menu
            this.$nextTick(() => {
                const mobileMenu = document.querySelector('.fixed.inset-0.z-50.lg\\:hidden');
                if (mobileMenu) {
                    mobileMenu.classList.remove('hidden');
                }
                
                // Focus on search input if requested
                if (focusSearch) {
                    setTimeout(() => {
                        const searchInput = document.getElementById('mobileSearchInput');
                        if (searchInput) {
                            searchInput.focus();
                        }
                    }, 300); // Wait for transition to complete
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },
        
        closeMobileMenu() {
            this.mobileMenuOpen = false;
            // Add hidden class back when closing mobile menu
            this.$nextTick(() => {
                const mobileMenu = document.querySelector('.fixed.inset-0.z-50.lg\\:hidden');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },
        
        async handleLogin() {
            this.errors = {};
            this.isLoading = true;
            
            // Validation - Thay đổi để sử dụng username thay vì email
            if (!this.loginForm.email) {
                this.errors.email = 'Vui lòng nhập tên đăng nhập';
            }
            if (!this.loginForm.password) {
                this.errors.password = 'Vui lòng nhập mật khẩu';
            }
            
            if (Object.keys(this.errors).length > 0) {
                this.isLoading = false;
                return;
            }

            try {
                // Gọi API đăng nhập thực tế
                const response = await window.xhr({
                    method: 'POST',
                    url: API_URL + 'auth/login/',
                    data: {
                        username: this.loginForm.email, // Sử dụng field email như username
                        password: this.loginForm.password
                    },
                    withCredentials: false, // Tắt credentials cho cross-origin
                    timeout: 15000 // 15 seconds
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    const accessToken = response.data.data.access_token;
                    this.saveAccessToken(accessToken);
                    this.setUser(response.data.data.me);

                    // Clear form
                    this.loginForm.email = '';
                    this.loginForm.password = '';
                    this.loginForm.remember = false;
                    
                    this.closeAuthModal();
                    
                    // Show success message
                    sendNotice(`Xin chào ${response.data.data.me.fullname}! Đăng nhập thành công.`, 'info');
                } else {
                    this.handleLoginError(response.data);
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.handleLoginError(error.data || error);
            } finally {
                this.isLoading = false;
            }
        },

        handleLoginError(errorData) {
            if (errorData && errorData.message) {
                // Xử lý các loại lỗi cụ thể theo format mới
                switch (errorData.message) {
                    case 'Username_invalid':
                    case 'User_not_found':
                        this.errors.general = 'Tài khoản hoặc Mật khẩu không đúng';
                        break;
                    case 'Account_disabled':
                        this.errors.general = 'Tài khoản đã bị cấm vì vi phạm điều khoản sử dụng';
                        break;
                    case 'Login_failed':
                        this.errors.general = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
                        break;
                    default:
                        this.errors.general = errorData.message || 'Đăng nhập thất bại, không xác định';
                }
            } else {
                this.errors.general = 'Đăng nhập thất bại. Vui lòng thử lại.';
            }
        },


        saveAccessToken(token) {
            // Lưu token vào localStorage
            localStorage.setItem('usstk', token);
        },

        getAccessToken() {
            // Lấy token từ localStorage
            const token = localStorage.getItem('usstk');
            if (token) {
                return token;
            }
            // Token không tồn tại hoặc hết hạn
            this.clearAccessToken();
            return null;
        },

        clearAccessToken() {
            localStorage.removeItem('usstk');
        },

        async handleRegister() {
            this.errors = {};
            this.isLoading = true;
            
            // Validation
            if (!this.registerForm.fullname) {
                this.errors.fullname = 'Vui lòng nhập họ tên';
            } else if (this.registerForm.fullname.length < 2) {
                this.errors.fullname = 'Họ tên phải có ít nhất 2 ký tự';
            }
            
            if (!this.registerForm.username) {
                this.errors.username = 'Vui lòng nhập tên đăng nhập';
            } else if (this.registerForm.username.length < 3) {
                this.errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
            } else if (!/^[a-zA-Z0-9_]+$/.test(this.registerForm.username)) {
                this.errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
            }
            
            if (!this.registerForm.email) {
                this.errors.email = 'Vui lòng nhập email';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
                this.errors.email = 'Email không hợp lệ';
            }
            
            if (!this.registerForm.phone) {
                this.errors.phone = 'Vui lòng nhập số điện thoại';
            } else if (!/^[0-9]{10,11}$/.test(this.registerForm.phone.replace(/\s/g, ''))) {
                this.errors.phone = 'Số điện thoại không hợp lệ';
            }
            
            if (!this.registerForm.password) {
                this.errors.password = 'Vui lòng nhập mật khẩu';
            } else if (this.registerForm.password.length < 6) {
                this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
            
            if (!this.registerForm.agree) {
                this.errors.agree = 'Vui lòng đồng ý với điều khoản sử dụng';
            }
            
            if (Object.keys(this.errors).length > 0) {
                this.isLoading = false;
                return;
            }

            try {
                // Gọi API đăng ký thực tế
                const response = await window.xhr({
                    method: 'POST',
                    url: API_URL + 'auth/register/',
                    data: {
                        fullname: this.registerForm.fullname,
                        username: this.registerForm.username,
                        email: this.registerForm.email,
                        phone: this.registerForm.phone,
                        password: this.registerForm.password,
                        password_repeat: this.registerForm.confirmPassword,
                        agree_terms: this.registerForm.agree
                    },
                    withCredentials: false, // Tắt credentials cho cross-origin
                    timeout: 15000 // 15 seconds
                });

                if (response.data?.status === 'success' && response.data?.data?.me) {
                    const accessToken = response.data.data.access_token;
                    this.saveAccessToken(accessToken);
                    this.setUser(response.data.data.me);

                    // Clear form
                    this.registerForm = { 
                        fullname: '', 
                        username: '',
                        email: '', 
                        password: '', 
                        confirmPassword: '', 
                        phone: '', 
                        agree: false 
                    };
                    
                    this.closeAuthModal();
                    
                    // Show success message
                    sendNotice(`Chào mừng ${response.data.data.me.fullname}! Đăng ký thành công.`, 'success');
                } else {
                    this.handleRegisterError(response.data);
                }
                
            } catch (error) {
                console.error('Register error:', error);
                // Handle different error formats
                if (error.data) {
                    this.handleRegisterError(error.data);
                } else if (error.response && error.response.data) {
                    this.handleRegisterError(error.response.data);
                } else {
                    this.handleRegisterError({ 
                        status: 'error', 
                        message: 'Network error', 
                        errors: {} 
                    });
                }
            } finally {
                this.isLoading = false;
            }
        },

        handleRegisterError(errorData) {
            // Clear previous errors
            this.errors = {};
            
            if (errorData && errorData.status === 'error') {
                // Xử lý field errors từ errors object
                if (errorData.errors && typeof errorData.errors === 'object') {
                    Object.keys(errorData.errors).forEach(field => {
                        const fieldErrors = errorData.errors[field];
                        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                            // Join multiple errors for the same field
                            this.errors[field] = this.mapFieldErrors(field, fieldErrors);
                        }else{
                            this.errors[field] = fieldErrors ? fieldErrors.toString() : 'Giá trị không hợp lệ';
                        }
                    });
                }
                
                // Xử lý general error message
                if (errorData.message) {
                    this.errors.general = this.mapGeneralError(errorData.message);
                }
            } else {
                this.errors.general = 'Đăng ký thất bại. Vui lòng thử lại.';
            }
        },

        mapFieldErrors(field, errors) {
            const errorMap = {
                'username': {
                    'Username_length': 'Tên đăng nhập phải có ít nhất 3 ký tự',
                    'Username_already_exists': 'Tên đăng nhập này đã được sử dụng',
                    'Username_invalid': 'Tên đăng nhập không hợp lệ'
                },
                'fullname': {
                    'Fullname_length': 'Họ tên phải có ít nhất 2 ký tự',
                    'Fullname_invalid': 'Họ tên không hợp lệ'
                },
                'email': {
                    'Email_invalid': 'Email không hợp lệ',
                    'Email_already_exists': 'Email này đã được sử dụng'
                },
                'phone': {
                    'Phone_invalid': 'Số điện thoại không hợp lệ',
                    'Phone_already_exists': 'Số điện thoại này đã được sử dụng'
                },
                'password': {
                    'Password_too_weak': 'Mật khẩu quá yếu, hãy chọn mật khẩu mạnh hơn',
                    'Password_invalid': 'Mật khẩu không hợp lệ'
                },
                'password_repeat': {
                    'Password_repeat_invalid': 'Mật khẩu xác nhận không khớp',
                    'Password_mismatch': 'Mật khẩu xác nhận không khớp'
                },
                'agree': {
                    'Terms_not_accepted': 'Vui lòng đồng ý với điều khoản sử dụng'
                }
            };

            const fieldErrorMap = errorMap[field] || {};
            const mappedErrors = errors.map(error => fieldErrorMap[error] || error);
            return mappedErrors.join(', ');
        },

        mapGeneralError(message) {
            const generalErrorMap = {
                'Register_failed': 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
                'Server_error': 'Lỗi server. Vui lòng thử lại sau.',
                'Validation_failed': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
                'Database_error': 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.'
            };

            // Check if message contains database error
            if (message.includes('SQLSTATE') || message.includes('Field') || message.includes('doesn\'t have a default value')) {
                return 'Lỗi cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.';
            }

            return generalErrorMap[message] || message;
        },
        
        updateAuthUI() {
            const loginButtons = document.getElementById('loginButtons');
            const userDropdown = document.getElementById('userDropdown');
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            if (this.user) {
                // Hide login buttons, show user dropdown
                if (loginButtons) loginButtons.classList.add('hidden');
                if (userDropdown) userDropdown.classList.remove('hidden');
                if (userAvatar) userAvatar.src = this.user.avatar;
                if (userName) userName.textContent = this.user.fullname;

                // Update user status badge
                this.updateUserStatusBadge();
            } else {
                // Show login buttons, hide user dropdown
                if (loginButtons) loginButtons.classList.remove('hidden');
                if (userDropdown) userDropdown.classList.add('hidden');
            }
        },

        updateUserStatusBadge() {
            // Desktop status badge
            this.updateDesktopStatusBadge();
            // Mobile status badge
            this.updateMobileStatusBadge();
        },

        updateDesktopStatusBadge() {
            const userDropdown = document.getElementById('userDropdown');
            if (!userDropdown) return;

            // Remove existing status badge
            const existingBadge = userDropdown.querySelector('.user-status-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Add status badge if user is inactive
            if (this.user && this.user.status === 'inactive') {
                const statusBadge = document.createElement('div');
                statusBadge.className = 'user-status-badge absolute -top-3 -right-3 badge badge-warning text-xs';
                statusBadge.textContent = 'No Active';
                statusBadge.title = 'Tài khoản chưa được kích hoạt, vui lòng kiểm tra Email và kích hoạt.';
                
                // Add to user dropdown button
                const userButton = userDropdown.querySelector('button');
                if (userButton) {
                    userButton.style.position = 'relative';
                    userButton.appendChild(statusBadge);
                }
            }
        },

        updateMobileStatusBadge() {
            const mobileUserInfo = document.querySelector('[x-show="user"] .flex-1');
            if (!mobileUserInfo) return;

            // Remove existing status badge
            const existingBadge = mobileUserInfo.querySelector('.mobile-status-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Add status badge if user is inactive
            if (this.user && this.user.status === 'inactive') {
                const statusBadge = document.createElement('div');
                statusBadge.className = 'mobile-status-badge badge badge-warning text-xs mt-1';
                statusBadge.textContent = 'Tài khoản chưa kích hoạt';
                
                // Add after user name
                const userName = mobileUserInfo.querySelector('p.font-medium');
                if (userName) {
                    userName.parentNode.insertBefore(statusBadge, userName.nextSibling);
                }
            }
        },

        
        logout() {
            this.setUser(null);
            this.clearAccessToken();
            this.clearUserCache();
        },
        
        handlePostClick() {
            if (this.user) {
                // If logged in, redirect to post page
                window.location.href = '/post';
            } else {
                // If not logged in, show auth modal
                this.authTab = 'login';
                this.errors = {};
                this.isLoading = false;
                this.openAuthModal();
            }
        },
        
        async handleFacebookLogin() {
            this.isLoading = true;
            this.errors = {};
            
            try {
                // Simulate Facebook login
                setTimeout(() => {
                    // Mock successful Facebook login
                    this.user = {
                        id: 2,
                        fullname: 'Nguyễn Văn B',
                        email: 'facebook@example.com',
                        avatar: '',
                        provider: 'facebook'
                    };
                    this.updateAuthUI();
                    this.notifyAuthStatusChange();
                    this.isLoading = false;
                    this.closeAuthModal();
                }, 1500);
                
                // In real app, you would use Facebook SDK:
                // FB.login((response) => {
                //     if (response.authResponse) {
                //         // Get user info and send to your backend
                //         FB.api('/me', {fields: 'name,email,picture'}, (userInfo) => {
                //             // Send to your backend API
                //         });
                //     }
                // }, {scope: 'email'});
                
            } catch (error) {
                this.errors.general = 'Đăng nhập Facebook thất bại. Vui lòng thử lại.';
                this.isLoading = false;
            }
        },
        
        async handleGoogleLogin() {
            this.isLoading = true;
            this.errors = {};
            
            try {
                // Simulate Google login
                setTimeout(() => {
                    // Mock successful Google login
                    this.user = {
                        id: 3,
                        fullname: 'Nguyễn Văn C',
                        email: 'google@example.com',
                        avatar: '',
                        provider: 'google'
                    };
                    this.updateAuthUI();
                    this.notifyAuthStatusChange();
                    this.isLoading = false;
                    this.closeAuthModal();
                }, 1500);
                
                // In real app, you would use Google Sign-In:
                // gapi.load('auth2', () => {
                //     const authInstance = gapi.auth2.getAuthInstance();
                //     authInstance.signIn().then((googleUser) => {
                //         const profile = googleUser.getBasicProfile();
                //         // Send to your backend API
                //     });
                // });
                
            } catch (error) {
                this.errors.general = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
                this.isLoading = false;
            }
        },

        // ===========================================
        // CART FUNCTIONS
        // ===========================================
        
        initializeCart() {
            this.initCartItems();
            this.setupCartSync();
            this.updateCartCount();
        },

        // Initialize cart items from Cart Manager
        initCartItems() {
            this.cartItems = window.cartManager.getCartItems();
        },

        // Toggle cart modal
        toggleCart() {
            this.showCart = !this.showCart;
            // Handle hidden class for CLS prevention
            this.$nextTick(() => {
                const cartModal = document.getElementById('cartModal');
                if (cartModal) {
                    if (this.showCart) {
                        cartModal.classList.remove('hidden');
                        // Re-initialize Lucide icons for the modal
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                    } else {
                        cartModal.classList.add('hidden');
                    }
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },

        // Handle body scroll for all modals
        handleBodyScroll() {
            // Check if any modal is open
            const isAnyModalOpen = this.showCart || this.isAuthModalOpen || this.mobileMenuOpen;
            
            if (isAnyModalOpen) {
                // Disable body scroll when any modal is open
                document.body.style.overflow = 'hidden';
            } else {
                // Re-enable body scroll when all modals are closed
                document.body.style.overflow = '';
            }
        },

        // Close cart modal
        closeCart() {
            this.showCart = false;
            // Add hidden class back when closing cart modal
            this.$nextTick(() => {
                const cartModal = document.getElementById('cartModal');
                if (cartModal) {
                    cartModal.classList.add('hidden');
                }
                // Handle body scroll for all modals
                this.handleBodyScroll();
            });
        },

        // Add item to cart
        addToCart(item) {
            window.cartManager.addToCart(item);
        },

        // Remove item from cart
        removeFromCart(itemId) {
            window.cartManager.removeFromCart(itemId);
        },

        // Update cart count and total
        updateCartCount() {
            this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
            this.cartTotal = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        // Format price
        formatPrice(price) {
            return window.cartManager.formatPrice(price);
        },

        // Proceed to checkout
        proceedToCheckout() {
            if (this.cartCount === 0) {
                window.cartManager.showNotification('Giỏ hàng trống!', 'warning');
                return;
            }
            window.location.href = '/checkout';
        },

        // View full cart
        viewCart() {
            window.location.href = '/cart';
        },

        // Setup cart synchronization
        setupCartSync() {
            // Subscribe to cart changes
            this.unsubscribe = window.cartManager.subscribe((action, data, cartItems) => {
                // Update local cart items to trigger Alpine.js reactivity
                this.cartItems = [...cartItems];
                // Force Alpine.js to re-evaluate reactive properties
                this.$nextTick(() => {
                    this.updateCartCount();
                });
            });
        },

        // Show cart notification
        showCartNotification(message, type = 'info') {
            window.cartManager.showNotification(message, type);
        }
    };
}

// Export for use in HTML
window.headerComponent = headerComponent;
