function openForm(product) {
    document.getElementById("modal").classList.add("show");
    document.getElementById("overlay").classList.add("show");
    document.getElementById("productName").innerText = "Product: " + product;

}

function closeForm() {
    document.getElementById("modal").classList.remove("show");
    document.getElementById("overlay").classList.remove("show");
}

function submitOrder(e) {
    e.preventDefault();
    alert("Order submitted successfully!");
    closeForm()
}


let cart = [

]

function addToCart() {
    document.getElementById("cart").classList.add("show");
    document.getElementById("overlay").classList.add("show");
    // Add product to cart array
    cart.push(product);
    // Update cart display
    cart.display();
}

function removeFormCart() {
    document.getElementById("cart").classList.remove("show");
    document.getElementById("overlay").classList.remove("show");
    // Remove product from cart array

}

function updateQuantity() {

}

function renderCart() {

}