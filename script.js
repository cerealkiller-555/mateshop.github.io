// ====== SETUP DATA ======

// All products we sell in the store
const products = [
    { name: "Pipore 250G", price: 150 },
    { name: "Sara 1KG", price: 300 },
    { name: "Royale 500G", price: 200 }
];

// User's shopping cart (empty when page loads)
let cart = [];

// ====== GET PAGE ELEMENTS (HTML buttons and divs) ======
const cartPanel = document.getElementById("cart-panel");
const cartItems = document.getElementById("cart-items");
const subtotal = document.getElementById("subtotal");
const cartCount = document.getElementById("cart-count");
const cartToggleButton = document.getElementById("cart-toggle");

const orderForm = document.getElementById("order-form");
const summaryList = document.getElementById("summary-list");
const summaryTotal = document.getElementById("summary-total");

const STORAGE_KEY = "sipCart";

// ====== STORAGE ======
function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
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

// ====== CART RENDERING ======
function updateCartDisplay() {
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    if (!cartItems || !subtotal) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items yet</p>";
        subtotal.innerText = "0";
        saveCart();
        return;
    }

    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemPrice = item.price * item.quantity;
        totalPrice += itemPrice;

        const row = document.createElement("div");
        row.className = "cart-row";

        const itemText = document.createElement("span");
        itemText.innerText = `${item.name} = L.E ${itemPrice}`;

        const buttonBox = document.createElement("div");
        buttonBox.className = "qty-control";

        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.innerText = "-";
        minusBtn.className = "qty-btn";
        minusBtn.setAttribute("aria-label", `Decrease quantity for ${item.name}`);
        minusBtn.addEventListener("click", () => decreaseQuantity(index));

        const qtyNumber = document.createElement("span");
        qtyNumber.className = "qty-value";
        qtyNumber.innerText = item.quantity;

        const plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.innerText = "+";
        plusBtn.className = "qty-btn";
        plusBtn.setAttribute("aria-label", `Increase quantity for ${item.name}`);
        plusBtn.addEventListener("click", () => increaseQuantity(index));

        buttonBox.appendChild(minusBtn);
        buttonBox.appendChild(qtyNumber);
        buttonBox.appendChild(plusBtn);

        row.appendChild(itemText);
        row.appendChild(buttonBox);

        cartItems.appendChild(row);
    });

    subtotal.innerText = totalPrice;
    saveCart();
}

function renderCheckoutSummary() {
    if (!summaryList || !summaryTotal) return;

    summaryList.innerHTML = "";

    let totalPrice = 0;
    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} x ${item.quantity} - L.E ${item.price * item.quantity}`;
        summaryList.appendChild(li);
        totalPrice += item.price * item.quantity;
    });

    summaryTotal.textContent = `Total: L.E ${totalPrice}`;
}

// ====== CART MANAGEMENT ======
function addToCart(productName) {
    const product = products.find((p) => p.name === productName);
    if (!product) return;

    const existing = cart.find((c) => c.name === productName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: product.name, price: product.price, quantity: 1 });
    }

    updateCartDisplay();
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
    const isOpen = cartPanel.style.display === "block";
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

    const fullName = orderForm.fullName.value.trim();
    const phone = orderForm.phone.value.trim();
    const address = orderForm.address.value.trim();

    if (!fullName || !phone || !address) {
        alert("Please fill in all fields.");
        return;
    }

    alert("Order submitted successfully!");
    cart = [];
    updateCartDisplay();
    if (orderForm) orderForm.reset();
}

// ====== INIT ======
function init() {
    loadCart();
    updateCartDisplay();
    renderCheckoutSummary();
    initOutsideClickListener();

    if (cartToggleButton) {
        cartToggleButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleCart();
        });
    }

    const addButtons = document.querySelectorAll(".js-add-to-cart");
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
