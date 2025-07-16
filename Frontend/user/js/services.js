// js/services.js

const API_BASE = "http://127.0.0.1:7002/services";

// Fetch all service categories
async function fetchCategories() {
    const res = await fetch(`${API_BASE}/all-services/`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

// Helper to get full image URL
function getImageUrl(path) {
    if (!path) return 'img/default.jpg';
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:7002${path}`;
}

// Render a single category card
function createCategoryCard(category) {
    return `
    <div class="col-lg-6 col-xl-4 mb-4">
        <div class="service-item">
            <div class="service-inner">
                <div class="service-img">
                    <img src="${getImageUrl(category.image)}" class="img-fluid w-100 rounded" alt="${category.name}" width="400" height="450" style="object-fit:cover; width:400px; height:450px;">
                </div>
                <div class="service-title">
                    <div class="service-title-name">
                        <div class="bg-primary text-center rounded p-3 mx-5 mb-4">
                            <span class="h4 text-white mb-0">${category.name}</span>
                        </div>
                        <button class="btn btn-primary border-secondary rounded-pill py-3 px-5 mb-4 explore-btn" data-category-id="${category.id}">Explore</button>
                    </div>
                    <div class="service-content pb-4">
                        <h4 class="text-white mb-4 py-3">${category.name}</h4>
                        <div class="px-4">
                            <p class="mb-4">${category.description}</p>
                            <button class="btn btn-primary border-secondary rounded-pill py-3 px-5 explore-btn" data-category-id="${category.id}">Explore</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Render all categories into a container
async function renderCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const categories = await fetchCategories();
        container.innerHTML = `<div class="row g-4">${categories.map(createCategoryCard).join('')}</div>`;
        // Attach event listeners for explore buttons
        container.querySelectorAll('.explore-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                handleExplore(this.dataset.categoryId);
            });
        });
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load services.</div>`;
    }
}

// Handle Explore button click
function handleExplore(categoryId) {
    // Redirect to sub_service.html with category_id as query param
    window.location.href = `sub_service.html?category_id=${categoryId}`;
}

// --- Sub-services logic ---

// Get query param from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch sub-services for a category
async function fetchSubServices(categoryId) {
    const res = await fetch(`${API_BASE}/sub-services/?category_id=${categoryId}`);
    if (!res.ok) throw new Error("Failed to fetch sub-services");
    return res.json();
}

// Render a single sub-service card
function createSubServiceCard(subService) {
    return `
    <div class="col-lg-6 col-xl-4 mb-4">
        <div class="service-item">
            <div class="service-inner">
                <div class="service-img">
                    <img src="${getImageUrl(subService.image)}" class="img-fluid w-100 rounded" alt="${subService.name}" width="400" height="450" style="object-fit:cover; width:400px; height:450px;">
                </div>
                <div class="service-title">
                    <div class="service-title-name">
                        <div class="bg-primary text-center rounded p-3 mx-5 mb-4">
                            <span class="h4 text-white mb-0">${subService.name}</span>
                        </div>
                    </div>
                    <div class="service-content pb-4">
                        <h4 class="text-white mb-4 py-3">${subService.name}</h4>
                        <div class="px-4">
                            <p class="mb-4">${subService.description || ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Render all sub-services into a container
async function renderSubServices(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const categoryId = getQueryParam('category_id');
    if (!categoryId) {
        container.innerHTML = `<div class="alert alert-warning">No category selected.</div>`;
        return;
    }
    try {
        const subServices = await fetchSubServices(categoryId);
        if (!subServices.length) {
            container.innerHTML = `<div class="alert alert-info">No sub-services found for this category.</div>`;
            return;
        }
        container.innerHTML = `<div class="row g-4">${subServices.map(createSubServiceCard).join('')}</div>`;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load sub-services.</div>`;
    }
}

// --- Cart Logic ---

const CART_KEY = 'urbanSalonCart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id, name, price) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    saveCart(cart);
    updateAllCartUI();
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateAllCartUI();
}

function changeCartQty(id, delta) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty < 1) cart[idx].qty = 1;
        saveCart(cart);
        updateAllCartUI();
    }
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCardQtyUI() {
    // Update the quantity UI for each service card
    const cart = getCart();
    cart.forEach(item => {
        const qtySpan = document.getElementById(`qty-ui-${item.id}`);
        if (qtySpan) {
            qtySpan.innerHTML = `
                <div class='cart-item-qty-group d-inline-flex align-items-center ms-2'>
                    <button onclick="changeCartQty('${item.id}', -1)">-</button>
                    <input type='text' value='${item.qty}' readonly />
                    <button onclick="changeCartQty('${item.id}', 1)">+</button>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')">&times;</button>
                </div>
            `;
        }
    });
}

function updateCartBoxUI() {
    // For desktop cart box
    const cartBox = document.getElementById('cart-box');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cart = getCart();
    if (!cartBox || !cartItems || !cartTotal) return;
    if (cart.length === 0) {
        cartBox.classList.add('d-none');
        cartItems.innerHTML = '<div class="text-muted">Cart is empty.</div>';
        cartTotal.textContent = '₹0';
        return;
    }
    cartBox.classList.remove('d-none');
    cartItems.innerHTML = cart.map(item => `
        <div class='cart-item-row d-flex align-items-center'>
            <div class='flex-grow-1'>
                <div class='cart-item-title'>${item.name}</div>
                <div class='cart-item-controls'>
                    <div class='cart-item-qty-group'>
                        <button onclick="changeCartQty('${item.id}', -1)">-</button>
                        <input type='text' value='${item.qty}' readonly />
                        <button onclick="changeCartQty('${item.id}', 1)">+</button>
                    </div>
                    <span class='cart-item-price ms-2'>₹${item.price * item.qty}</span>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    cartTotal.textContent = '₹' + getCartTotal();
}

function updateCartDrawerUI() {
    // For mobile cart drawer
    const cartDrawer = document.getElementById('cart-drawer');
    const cartDrawerItems = document.getElementById('cart-drawer-items');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    const cart = getCart();
    if (mobileCartCount) mobileCartCount.textContent = cart.length;
    if (!cartDrawer || !cartDrawerItems) return;
    if (cart.length === 0) {
        cartDrawerItems.innerHTML = '<div class="text-muted">Cart is empty.</div>';
        return;
    }
    cartDrawerItems.innerHTML = cart.map(item => `
        <div class='cart-item-row d-flex align-items-center'>
            <div class='flex-grow-1'>
                <div class='cart-item-title'>${item.name}</div>
                <div class='cart-item-controls'>
                    <div class='cart-item-qty-group'>
                        <button onclick="changeCartQty('${item.id}', -1)">-</button>
                        <input type='text' value='${item.qty}' readonly />
                        <button onclick="changeCartQty('${item.id}', 1)">+</button>
                    </div>
                    <span class='cart-item-price ms-2'>₹${item.price * item.qty}</span>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateAllCartUI() {
    updateCardQtyUI();
    updateCartBoxUI();
    updateCartDrawerUI();
}

// Cart drawer open/close for mobile
function openCartDrawer() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-backdrop').classList.add('open');
}
function closeCartDrawer() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-drawer-backdrop').classList.remove('open');
}

// Attach openCartDrawer to mobile cart button
window.addEventListener('DOMContentLoaded', function() {
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', openCartDrawer);
    }
    // Add event for desktop 'View Cart' button
    const viewCartBtn = document.getElementById('view-cart-btn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', openCartDrawer);
    }
    // Initial UI update
    updateAllCartUI();
});

// Expose functions globally
window.renderCategories = renderCategories;
window.renderSubServices = renderSubServices;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeCartQty = changeCartQty;
window.updateAllCartUI = updateAllCartUI;
window.closeCartDrawer = closeCartDrawer; 