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

const cartPanel = document.getElementById("cart-panel");         // Cart box on left
const formSection = document.getElementById("form-section");     // Checkout form
const orderForm = document.getElementById("order-form");         // The form inputs
const cartItems = document.getElementById("cart-items");         // List of cart items
const subtotal = document.getElementById("subtotal");            // Price total
const cartCount = document.getElementById("cart-count");         // "3" next to cart icon

// ====== FUNCTION 1: Show/Hide the cart ======
function toggleCart() {
    // Check: is cart hidden right now?
    if (cartPanel.style.display === "none" || cartPanel.style.display === "") {
        cartPanel.style.display = "block";   // SHOW the cart
    } else {
        cartPanel.style.display = "none";    // HIDE the cart
    }
}

// ====== FUNCTION 2: Open checkout form ======
function openCheckoutForm() {
    // Step 1: Check if cart is empty
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;  // STOP here - don't open form
    }

    // Step 2: Cart has items, so show the form
    cartPanel.style.display = "block";
    formSection.style.display = "block";
}

// ====== FUNCTION 3: Close form ======
function closeForm() {
    formSection.style.display = "none";  // Hide the form
    orderForm.reset();                   // Clear all input boxes
}

// ====== FUNCTION 4: Add product to cart ======
function addToCart(productName) {
    // Step 1: Find the product from the products list
    let product = null;
    for (let i = 0; i < products.length; i++) {
        if (products[i].name === productName) {
            product = products[i];
            break;
        }
    }

    // Step 2: Did we find it?
    if (product === null) {
        return;  // Product not found, stop
    }

    // Step 3: Is this product already in the cart?
    let itemInCart = null;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === productName) {
            itemInCart = cart[i];
            break;
        }
    }

    // Step 4: Add or update
    if (itemInCart !== null) {
        // Product already in cart - just add 1 to quantity
        itemInCart.quantity = itemInCart.quantity + 1;
    } else {
        // Product NOT in cart - add it for the first time
        let newItem = {
            name: product.name,
            price: product.price,
            quantity: 1
        };
        cart.push(newItem);
    }

    // Step 5: Show the cart and update display
    cartPanel.style.display = "block";
    updateCartDisplay();
}

// ====== FUNCTION 5: Update the cart display ======
function updateCartDisplay() {
    // Clear old cart display
    cartItems.innerHTML = "";

    // Count total items in cart
    let totalItems = 0;
    for (let i = 0; i < cart.length; i++) {
        totalItems = totalItems + cart[i].quantity;
    }
    cartCount.innerText = totalItems;

    // Is cart empty?
    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items yet</p>";
        subtotal.innerText = "0";
        return;
    }

    // Loop through each item and show it
    let totalPrice = 0;

    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        let itemPrice = item.price * item.quantity;
        totalPrice = totalPrice + itemPrice;

        // CREATE HTML FOR ONE ITEM ROW
        // ================================

        // Create a container for the row
        let row = document.createElement("div");
        row.className = "cart-row";

        // Create the item name and price
        let itemText = document.createElement("span");
        itemText.innerText = item.name + " = L.E " + itemPrice;

        // Create quantity buttons container
        let buttonBox = document.createElement("div");
        buttonBox.className = "qty-control";

        // Create MINUS button
        let minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.innerText = "-";
        minusBtn.className = "qty-btn";
        minusBtn.setAttribute("aria-label", "Decrease quantity for " + item.name);
        minusBtn.onclick = function () { decreaseQuantity(i); };

        // Create quantity number display
        let qtyNumber = document.createElement("span");
        qtyNumber.className = "qty-value";
        qtyNumber.innerText = item.quantity;

        // Create PLUS button
        let plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.innerText = "+";
        plusBtn.className = "qty-btn";
        plusBtn.setAttribute("aria-label", "Increase quantity for " + item.name);
        plusBtn.onclick = function () { increaseQuantity(i); };

        // Put buttons together: [ - ] [ 2 ] [ + ]
        buttonBox.appendChild(minusBtn);
        buttonBox.appendChild(qtyNumber);
        buttonBox.appendChild(plusBtn);

        // Put everything in the row
        row.appendChild(itemText);
        row.appendChild(buttonBox);

        // Add the row to the cart display
        cartItems.appendChild(row);
    }

    // Show total price
    subtotal.innerText = totalPrice;
}

// ====== FUNCTION 6: Increase quantity ======
function increaseQuantity(index) {
    cart[index].quantity = cart[index].quantity + 1;
    updateCartDisplay();
}

// ====== FUNCTION 7: Decrease quantity ======
function decreaseQuantity(index) {
    // If quantity is 1, remove the item
    if (cart[index].quantity === 1) {
        cart.splice(index, 1);  // Remove item from cart
    } else {
        // Otherwise just decrease quantity
        cart[index].quantity = cart[index].quantity - 1;
    }
    updateCartDisplay();
}

// ====== FUNCTION 8: Submit order ======
function submitOrder(event) {
    event.preventDefault();  // Don't reload page

    // Step 1: Check cart not empty
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Step 2: Get user input from form
    let fullName = orderForm.fullName.value.trim();
    let phone = orderForm.phone.value.trim();
    let address = orderForm.address.value.trim();

    // Step 3: Check all fields are filled
    if (fullName === "" || phone === "" || address === "") {
        alert("Please fill in all fields");
        return;
    }

    // Step 4: All good! Process order
    alert("Order submitted successfully!");

    // Step 5: Clear everything
    cart = [];  // Empty the cart
    updateCartDisplay();
    closeForm();
}

// ====== CONNECT BUTTONS TO FUNCTIONS ======

// Cart toggle button
document.getElementById("cart-toggle").addEventListener("click", function () {
    toggleCart();
});

// Cancel button
document.getElementById("cancel-order").addEventListener("click", function () {
    closeForm();
});

// Checkout button
document.getElementById("submit-order").addEventListener("click", function () {
    openCheckoutForm();
});

// Submit order button
orderForm.addEventListener("submit", function (event) {
    submitOrder(event);
});

// "Add to Cart" buttons on products
let addButtons = document.querySelectorAll(".js-add-to-cart");
for (let i = 0; i < addButtons.length; i++) {
    addButtons[i].addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        let productName = this.getAttribute("data-product");
        addToCart(productName);
    });
}

// ====== START: Show empty cart when page loads ======
updateCartDisplay();
