// Product data
const products = [
    {
        id: 1,
        name: 'Classic Espresso',
        description: 'Rich and bold single shot of espresso',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&h=400&fit=crop'
    },
    {
        id: 2,
        name: 'Iced Latte',
        description: 'Smooth espresso with cold milk and ice',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&h=400&fit=crop'
    },
    {
        id: 3,
        name: 'Cappuccino',
        description: 'Perfect balance of espresso, steamed milk, and foam',
        price: 4.49,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&h=400&fit=crop'
    },
    {
        id: 4,
        name: 'Caramel Macchiato',
        description: 'Espresso with vanilla and caramel',
        price: 5.49,
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&h=400&fit=crop'
    }
];

// Cart state
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeBtn = document.querySelector('.close-button');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.querySelector('.checkout-button');

// Initialize the page
function init() {
    renderProducts();
    setupEventListeners();
}

// Render all products
function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Set up event listeners
function setupEventListeners() {
    cartBtn.addEventListener('click', toggleCart);
    closeBtn.addEventListener('click', toggleCart);
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            toggleCart();
        }
    });
    
    // Add event listener for checkout
    checkoutButton.addEventListener('click', checkout);
}

// Toggle cart modal
function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    if (cartModal.style.display === 'block') {
        renderCart();
    }
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.product.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            product,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`Added ${product.name} to cart`);
}

// Update cart item quantity
function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.product.id !== productId);
        }
        renderCart();
        updateCartCount();
    }
}

// Render cart items
function renderCart() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.product.name}</h4>
                <p class="cart-item-price">$${item.product.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-button" onclick="updateQuantity(${item.product.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-button" onclick="updateQuantity(${item.product.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('') || '<p>Your cart is empty</p>';
    
    updateCartTotal();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Checkout function (Sends order to API Gateway)
async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const order = {
        items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
        })),
        total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        user: "john_doe"
    };

    try {
        const response = await fetch("https://stiu0xyv2e.execute-api.us-east-1.amazonaws.com/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        const data = await response.json();
        alert(data.message);

        // Clear cart after successful checkout
        cart = [];
        updateCartCount();
        renderCart();

    } catch (error) {
        console.error("Checkout error:", error);
        alert("Error placing order. Please try again.");
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #795548;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
