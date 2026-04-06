// ====== SETUP DATA ======

// All products we sell in the store
let products = [
    { name: "Sara 1KG", price: 300 },
    { name: "Yerba Madre Bottle", price: 150 },
    { name: "Taragui Yerba Mate 500G", price: 600 },
    { name: "Taragui Yerba Mate 1KG", price: 850 },
    { name: "Kharta Yerba Mate 250G", price: 150 },
    { name: "Bombilla straw", price: 100 },
    { name: "Rosamonte Yerba Mate 500G", price: 545 },
    { name: "Yerba Gourd", price: 800 }

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

let STORAGE_KEY = "sipCart";

// ====== STORAGE ======
function loadCart() {
    try {
        let raw = localStorage.getItem(STORAGE_KEY);
        let parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed)) {
            cart = parsed;
        }
    } catch (e) {
        // ignore malformed storage
    }
}

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        // ignore storage failures
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

// ====== INIT ======
function init() {
    loadCart();
    updateCartDisplay();
    renderCheckoutSummary();
    initOutsideClickListener();

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

// Retrieve order history from localStorage
function getOrderHistory() {
    return JSON.parse(localStorage.getItem("orderHistory")) || [];
}

init();
