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

function toggleCart() {
    let isHidden = cartPanel.style.display === "none" || cartPanel.style.display === "";
    cartPanel.style.display = isHidden ? "block" : "none";
}
function openCheckoutForm(params) {
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

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items yet</p>";
        subtotal.innerText = "0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        let row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.marginBottom = "10px";
        row.style.padding = "10px";
        row.style.backgroundColor = "#333";
        row.style.borderRadius = "5px";
        
        let itemInfo = document.createElement("span");
        itemInfo.innerText = `${item.name} = L.E ${itemTotal}`;
        
        let quantityControl = document.createElement("div");
        quantityControl.style.display = "flex";
        quantityControl.style.alignItems = "center";
        quantityControl.style.gap = "8px";
        
        let decreaseBtn = document.createElement("button");
        decreaseBtn.innerText = "-";
        decreaseBtn.style.width = "30px";
        decreaseBtn.style.height = "30px";
        decreaseBtn.style.padding = "0";
        decreaseBtn.style.cursor = "pointer";
        decreaseBtn.addEventListener("click", () => decreaseQuantity(index));
        
        let qtyDisplay = document.createElement("span");
        qtyDisplay.innerText = item.quantity;
        qtyDisplay.style.minWidth = "30px";
        qtyDisplay.style.textAlign = "center";
        
        let increaseBtn = document.createElement("button");
        increaseBtn.innerText = "+";
        increaseBtn.style.width = "30px";
        increaseBtn.style.height = "30px";
        increaseBtn.style.padding = "0";
        increaseBtn.style.cursor = "pointer";
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

function submitOrder() {
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

// Add event listeners to product buttons - only once
if (!window.addToCartListenersAttached) {
    document.querySelectorAll(".js-add-to-cart").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            let productName = e.target.dataset.product;
            addToCart(productName);
        });
    });
    window.addToCartListenersAttached = true;
}

document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
        addToCart(button.dataset.product);
    });
});