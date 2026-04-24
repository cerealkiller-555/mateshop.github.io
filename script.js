// ====== SETUP DATA ======

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your deployed server URL
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const LOCAL_USERS_KEY = 'mateshop_local_users';
const GUEST_CART_KEY = 'sipCart_guest';
const LEGACY_CART_KEY = 'sipCart';

// All products we sell in the store
let products = [
    { name: "Sara 1KG", price: 300 },
    { name: "Yerba Madre Bottle", price: 250 },
    { name: "Taragui Yerba Mate 500G", price: 400 },
    { name: "Taragui Yerba Mate 1KG", price: 850 },
    { name: "Kharta Yerba Mate 250G", price: 150 },
    { name: "Bombilla straw", price: 100 },
    { name: "Rosamonte Yerba Mate 500G", price: 545 },
    { name: "Yerba Gourd", price: 800 },
    { name: "Cooler Co Unsweet 473mL", price: 500 },
    { name: "Cooler Co The OG Flavor 473mL", price: 450 },
    { name: "Cooler Co PowerPeach 473mL", price: 500 },
    { name: "Cooler Co MightyMint 473mL", price: 500 },
    { name: "Cooler Co bluebalance 473mL", price: 500 },
    { name: "Cooler Co BerryActive 473mL", price: 500 }
];

// User's shopping cart (empty when page loads)
let cart = [];
let cartPanel = document.getElementById("cart-panel");
let cartItems = document.getElementById("cart-items");
let subtotal = document.getElementById("subtotal");
let cartCount = document.getElementById("cart-count");
let cartToggleButton = document.getElementById("cart-toggle");

let orderForm = document.getElementById("order-form");
let summaryList = document.getElementById("summary-list");
let summaryTotal = document.getElementById("summary-total");

// ====== STORAGE ======
function getCartStorageKey() {
    let currentUser = getUserData();
    if (currentUser && currentUser.id) {
        return `sipCart_${currentUser.id}`;
    }

    return GUEST_CART_KEY;
}

function migrateLegacyCartIfNeeded() {
    try {
        const legacyCart = localStorage.getItem(LEGACY_CART_KEY);
        if (!legacyCart) return;

        const activeCartKey = getCartStorageKey();
        if (!localStorage.getItem(activeCartKey)) {
            localStorage.setItem(activeCartKey, legacyCart);
        }

        localStorage.removeItem(LEGACY_CART_KEY);
    } catch (e) {
        // ignore storage failures
    }
}

function loadCart() {
    try {
        migrateLegacyCartIfNeeded();

        let raw = localStorage.getItem(getCartStorageKey());
        let parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed)) {
            cart = parsed;
        } else {
            cart = [];
        }
    } catch (e) {
        // ignore malformed storage
        cart = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
    } catch (e) {
        // ignore storage failures
    }
}

function mergeCartItems(baseCart, incomingCart) {
    const mergedCart = Array.isArray(baseCart) ? [...baseCart] : [];

    incomingCart.forEach((incomingItem) => {
        const existingItem = mergedCart.find((item) => item.name === incomingItem.name);
        if (existingItem) {
            existingItem.quantity += incomingItem.quantity;
        } else {
            mergedCart.push({ ...incomingItem });
        }
    });

    return mergedCart;
}

function moveGuestCartToUserCart() {
    const currentUser = getUserData();
    if (!currentUser || !currentUser.id) return;

    try {
        const guestRaw = localStorage.getItem(GUEST_CART_KEY);
        const userCartKey = getCartStorageKey();
        const userRaw = localStorage.getItem(userCartKey);

        const guestCart = guestRaw ? JSON.parse(guestRaw) : [];
        const userCart = userRaw ? JSON.parse(userRaw) : [];

        if (!Array.isArray(guestCart) || guestCart.length === 0) return;

        const mergedCart = mergeCartItems(
            Array.isArray(userCart) ? userCart : [],
            guestCart
        );

        localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (e) {
        // ignore malformed storage
    }
}

// ====== TOAST NOTIFICATION ======
function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) return;

    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ====== CART RENDERING ======
function updateCartDisplay() {
    if (cartCount) {
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    saveCart();

    if (!cartItems || !subtotal) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items yet</p>";
        subtotal.innerText = "0";
        return;
    }

    let totalPrice = 0;

    cart.forEach((item, index) => {
        let itemPrice = item.price * item.quantity;
        totalPrice += itemPrice;

        let row = document.createElement("div");
        row.className = "cart-row";

        let itemText = document.createElement("span");
        itemText.innerText = `${item.name} = L.E ${itemPrice}`;

        let buttonBox = document.createElement("div");
        buttonBox.className = "qty-control";

        let minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.innerText = "-";
        minusBtn.className = "qty-btn";
        minusBtn.setAttribute("aria-label", `Decrease quantity for ${item.name}`);
        minusBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            decreaseQuantity(index);
        });

        let qtyNumber = document.createElement("span");
        qtyNumber.className = "qty-value";
        qtyNumber.innerText = item.quantity;

        let plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.innerText = "+";
        plusBtn.className = "qty-btn";
        plusBtn.setAttribute("aria-label", `Increase quantity for ${item.name}`);
        plusBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            increaseQuantity(index);
        });

        buttonBox.appendChild(minusBtn);
        buttonBox.appendChild(qtyNumber);
        buttonBox.appendChild(plusBtn);

        row.appendChild(itemText);
        row.appendChild(buttonBox);

        cartItems.appendChild(row);
    });

    subtotal.innerText = totalPrice;
}

function renderCheckoutSummary() {
    if (!summaryList || !summaryTotal) return;

    summaryList.innerHTML = "";

    let totalPrice = 0;
    cart.forEach(item => {
        let li = document.createElement("li");
        li.textContent = `${item.name} x ${item.quantity} - L.E ${item.price * item.quantity}`;
        summaryList.appendChild(li);
        totalPrice += item.price * item.quantity;
    });

    summaryTotal.textContent = `Total: L.E ${totalPrice}`;
}
// ====== Form Validation ======

// ====== CART MANAGEMENT ======
function addToCart(productName) {
    let product = products.find((p) => p.name === productName);
    if (!product) return;

    let existing = cart.find((c) => c.name === productName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: product.name, price: product.price, quantity: 1 });
    }
    updateCartDisplay();
    showToast(`${product.name} added to cart`);
}

function increaseQuantity(index) {
    if (!cart[index]) return;
    cart[index].quantity += 1;
    updateCartDisplay();
}

function decreaseQuantity(index) {
    if (!cart[index]) return;

    if (cart[index].quantity <= 1) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity -= 1;
    }

    updateCartDisplay();
}

function toggleCart() {
    if (!cartPanel) return;
    let isOpen = cartPanel.style.display === "block";
    cartPanel.style.display = isOpen ? "none" : "block";
}

function initOutsideClickListener() {
    if (!cartPanel) return;

    document.addEventListener("click", (event) => {
        if (cartPanel.style.display !== "block") return;
        if (event.target.closest("#cart-panel") || event.target.closest("#cart-toggle")) return;
        cartPanel.style.display = "none";
    });
}


function submitOrder(event) {
    if (event) event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    if (!orderForm) return;

    let fullName = orderForm.fullName.value.trim();
    let email = orderForm.email.value.trim();
    let phone = orderForm.phone.value.trim();
    let address = orderForm.address.value.trim();

    if (!fullName || !email || !phone || !address) {
        alert("Please fill in all fields.");
        return;
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    let phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
        alert("Please enter a valid phone number (at least 10 digits).");
        return;
    }

    let totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let orderData = {
        fullName,
        email,
        phone,
        address,
        items: cart,
        total: totalPrice,
        orderDate: new Date().toISOString()
    };

    // Add to Local History
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    orderHistory.push(orderData);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    // EmailJS Integration
    const templateParams = {
        to_name: fullName,
        to_email: email,
        phone: phone,
        address: address,
        order_total: totalPrice,
        order_items: cart.map(item => `${item.name} x ${item.quantity}`).join(", ")
    };

    if (typeof emailjs !== 'undefined') {
        const orderSubmitButton = event ? event.target.querySelector('button[type="submit"]') : null;
        if (orderSubmitButton) orderSubmitButton.innerText = "Sending Order...";

        emailjs.send('service_w9xzhon', 'template_zlul4ds', templateParams)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function (error) {
                console.log('FAILED...', error);
                alert("Failed to send email. But order was received.");
            }).finally(() => {
                showSuccessMessage();
            });
    } else {
        // Fallback if EmailJS fails to load
        showSuccessMessage();
    }

    function showSuccessMessage() {
        let successMsg = document.getElementById("order-success-message");
        let summary = document.getElementById("checkout-cart-summary");
        let form = document.getElementById("order-form");
        let title = document.getElementById("checkout-title");

        if (successMsg) successMsg.style.display = "block";
        if (summary) summary.style.display = "none";
        if (form) form.style.display = "none";
        if (title) title.style.display = "none";

        cart = [];
        updateCartDisplay();
        if (orderForm) orderForm.reset();
    }
}

// ====== AUTHENTICATION ======

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

// Get stored auth token
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Get stored user data
function getUserData() {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
}

// Save auth token
function saveAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// Save user data
function saveUserData(userData) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

function normalizePassword(password) {
    return typeof password === 'string' ? password.trim() : '';
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function loadLocalUsers() {
    try {
        const storedUsers = localStorage.getItem(LOCAL_USERS_KEY);
        const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
        return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch (error) {
        return [];
    }
}

function saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function createLocalSession(user) {
    return {
        success: true,
        token: `local-auth-${user.id}-${Date.now()}`,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || ''
        }
    };
}

function registerLocalUser({ username, email, password, firstName, lastName }) {
    const users = loadLocalUsers();
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = normalizePassword(password);

    const existingUser = users.find((user) =>
        user.email === normalizedEmail || user.username.toLowerCase() === normalizedUsername
    );

    if (existingUser) {
        return {
            success: false,
            message: 'Email or username already exists'
        };
    }

    const newUser = {
        id: `local-user-${Date.now()}`,
        username: username.trim(),
        email: normalizedEmail,
        password: normalizedPassword,
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim()
    };

    users.push(newUser);
    saveLocalUsers(users);

    return createLocalSession(newUser);
}

function loginLocalUser({ email, password }) {
    const users = loadLocalUsers();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);

    const user = users.find((storedUser) => storedUser.email === normalizedEmail);

    if (!user || user.password !== normalizedPassword) {
        return {
            success: false,
            message: 'Invalid credentials'
        };
    }

    return createLocalSession(user);
}

async function requestAuth(endpoint, payload) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (error) {
        if (endpoint === '/auth/register') {
            return registerLocalUser(payload);
        }

        if (endpoint === '/auth/login') {
            return loginLocalUser(payload);
        }

        throw error;
    }
}

// Logout user
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(GUEST_CART_KEY); // Clear guest cart on logout to prevent leakage
    cart = []; // Reset in-memory cart
    updateCartDisplay(); // Sync UI
    showToast('Logged out successfully');
    window.location.href = 'login.html';
}

function updateHeader() {
    const authLinks = document.querySelectorAll('.login-link-nav');
    const authenticated = isAuthenticated();

    authLinks.forEach(link => {
        if (authenticated) {
            link.innerText = 'Logout';
            link.href = '#';
            link.id = 'logout-btn'; // Ensure it has the ID for the logout listener
            link.classList.add('is-logged-in');
        } else {
            link.innerText = 'Login';
            link.href = 'login.html';
            link.classList.remove('is-logged-in');
        }
    });
}

// Handle Login Form Submission
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleRegisterLink = document.getElementById('toggle-register');
    const toggleLoginLink = document.getElementById('toggle-login');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const authTabs = document.querySelectorAll('.auth-tab');
    const passwordToggles = document.querySelectorAll('[data-password-toggle]');

    function setAuthView(view) {
        const showLogin = view === 'login';

        if (loginView) {
            loginView.classList.toggle('active', showLogin);
        }

        if (registerView) {
            registerView.classList.toggle('active', !showLogin);
        }

        authTabs.forEach((tab) => {
            const isActive = tab.dataset.authTarget === view;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        if (loginError) {
            loginError.hidden = true;
            loginError.textContent = '';
        }

        if (registerError) {
            registerError.hidden = true;
            registerError.textContent = '';
        }
    }

    // Toggle between login and register views
    if (toggleRegisterLink) {
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            setAuthView('register');
        });
    }

    if (toggleLoginLink) {
        toggleLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            setAuthView('login');
        });
    }

    authTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setAuthView(tab.dataset.authTarget);
        });
    });

    passwordToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const passwordInput = targetId ? document.getElementById(targetId) : null;
            if (!passwordInput) return;

            const shouldShow = passwordInput.type === 'password';
            passwordInput.type = shouldShow ? 'text' : 'password';
            toggle.textContent = shouldShow ? 'Hide' : 'Show';
            toggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
            toggle.setAttribute('aria-pressed', String(shouldShow));
        });
    });

    if (window.location.hash === '#register') {
        setAuthView('register');
    } else {
        setAuthView('login');
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = normalizeEmail(document.getElementById('login-email').value);
            const password = normalizePassword(document.getElementById('login-password').value);
            const errorDiv = document.getElementById('login-error');

            try {
                const data = await requestAuth('/auth/login', { email, password });

                if (data.success) {
                    saveAuthToken(data.token);
                    saveUserData(data.user);
                    moveGuestCartToUserCart();
                    loadCart(); // Refresh cart data for the logged-in user
                    updateCartDisplay();
                    showToast('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    errorDiv.textContent = data.message || 'Login failed';
                    errorDiv.hidden = false;
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Login failed. Please try again.';
                errorDiv.hidden = false;
            }
        });
    }

    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('reg-username').value.trim();
            const email = normalizeEmail(document.getElementById('reg-email').value);
            const password = normalizePassword(document.getElementById('reg-password').value);
            const firstName = document.getElementById('reg-firstName').value;
            const lastName = document.getElementById('reg-lastName').value;
            const errorDiv = document.getElementById('register-error');

            try {
                const data = await requestAuth('/auth/register', {
                    username,
                    email,
                    password,
                    firstName,
                    lastName
                });

                if (data.success) {
                    saveAuthToken(data.token);
                    saveUserData(data.user);
                    moveGuestCartToUserCart();
                    loadCart(); // Refresh cart data for the new user
                    updateCartDisplay();
                    showToast('Account created! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    errorDiv.textContent = data.message || 'Registration failed';
                    errorDiv.hidden = false;
                }
            } catch (error) {
                console.error('Registration error:', error);
                errorDiv.textContent = 'Registration failed. Please try again.';
                errorDiv.hidden = false;
            }
        });
    }
});

// ====== INIT ======
function init() {
    loadCart();
    updateCartDisplay();
    renderCheckoutSummary();
    initOutsideClickListener();
    updateHeader();

    // Handle logout button delegation
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'logout-btn' || e.target.classList.contains('logout-action'))) {
            if (isAuthenticated()) {
                e.preventDefault();
                logout();
            }
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Check if we are on checkout page and cart is empty
    let isCheckoutPage = !!document.getElementById("checkout-cart-summary");
    if (isCheckoutPage && cart.length === 0) {
        let emptyMsg = document.getElementById("empty-cart-message");
        let summary = document.getElementById("checkout-cart-summary");
        let form = document.getElementById("order-form");
        let title = document.getElementById("checkout-title");

        if (emptyMsg) emptyMsg.style.display = "block";
        if (summary) summary.style.display = "none";
        if (form) form.style.display = "none";
        if (title) title.style.display = "none";
    }

    if (cartToggleButton) {
        cartToggleButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleCart();
        });
    }

    let addButtons = document.querySelectorAll(".js-add-to-cart");
    addButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            addToCart(btn.getAttribute("data-product"));
        });
    });

    if (orderForm) {
        orderForm.addEventListener("submit", submitOrder);
    }
}

init();
