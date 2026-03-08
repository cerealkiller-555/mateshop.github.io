let products = [
    { name: "Pipore 250G", price: 150 },
    { name: "Sara 1KG", price: 300 },
    { name: "Royale 500G", price: 200 }
];

let cart = [];

let cartPanel = document.getElementById("cart-panel");
let formSection = document.getElementById("form-section");
let orderForm = document.getElementById("order-form");
let cartItems = document.getElementById("cart-items");
let subtotal = document.getElementById("subtotal");
let cartCount = document.getElementById("cart-count");

function toggleCart() {
    let isHidden = cartPanel.style.display === "none" || cartPanel.style.display === "";
    cartPanel.style.display = isHidden ? "block" : "none";
}
function openCheckoutForm() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    cartPanel.style.display = "block";
    formSection.style.display = "block";
}

function closeForm() {
    formSection.style.display = "none";
    orderForm.reset();
}

function addToCart(productName) {
    let product = products.find((item) => item.name === productName);

    if (!product) {
        return;
    }

    let existingItem = cart.find((item) => item.name === product.name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    cartPanel.style.display = "block";
    renderCart();
}

function renderCart() {
    cartItems.innerHTML = "";
    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = String(totalQuantity);

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items yet</p>";
        subtotal.innerText = "0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        let row = document.createElement("div");
        row.className = "cart-row";
        
        let itemInfo = document.createElement("span");
        itemInfo.innerText = `${item.name} = L.E ${itemTotal}`;
        
        let quantityControl = document.createElement("div");
        quantityControl.className = "qty-control";
        
        let decreaseBtn = document.createElement("button");
        decreaseBtn.type = "button";
        decreaseBtn.innerText = "-";
        decreaseBtn.className = "qty-btn";
        decreaseBtn.setAttribute("aria-label", `Decrease quantity for ${item.name}`);
        decreaseBtn.addEventListener("click", () => decreaseQuantity(index));
        
        let qtyDisplay = document.createElement("span");
        qtyDisplay.className = "qty-value";
        qtyDisplay.innerText = item.quantity;
        
        let increaseBtn = document.createElement("button");
        increaseBtn.type = "button";
        increaseBtn.innerText = "+";
        increaseBtn.className = "qty-btn";
        increaseBtn.setAttribute("aria-label", `Increase quantity for ${item.name}`);
        increaseBtn.addEventListener("click", () => increaseQuantity(index));
        
        quantityControl.appendChild(decreaseBtn);
        quantityControl.appendChild(qtyDisplay);
        quantityControl.appendChild(increaseBtn);
        
        row.appendChild(itemInfo);
        row.appendChild(quantityControl);
        cartItems.appendChild(row);
        
        total += itemTotal;
    });

    subtotal.innerText = String(total);
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    renderCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    renderCart();
}

function submitOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    let formData = new FormData(orderForm);
    let fullName = String(formData.get("fullName") || "").trim();
    let phone = String(formData.get("phone") || "").trim();
    let address = String(formData.get("address") || "").trim();

    if (!fullName || !phone || !address) {
        return;
    }

    alert("Order submitted successfully!");
    cart.length = 0;
    renderCart();
    closeForm();

}

document.getElementById("cart-toggle").addEventListener("click", toggleCart);
document.getElementById("cancel-order").addEventListener("click", closeForm);
document.getElementById("submit-order").addEventListener("click", openCheckoutForm);
orderForm.addEventListener("submit", submitOrder);

document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(button.dataset.product);
    });
});

renderCart();
