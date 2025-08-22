// js/services.js

const API_BASE = "http://127.0.0.1:7002/services";
const API_TIMEOUT = 10000; // 10 seconds timeout

// Fetch all service categories with timeout
async function fetchCategories() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const res = await fetch(`${API_BASE}/all-services/`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}

// Helper to get full image URL
function getImageUrl(path) {
    if (!path) return 'img/default.jpg';
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:7002${path}`;
}

// Create loading skeleton
function createLoadingSkeleton() {
    return `
    <div class="row g-4">
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="service-item">
                <div class="service-inner">
                    <div class="service-img">
                        <div class="bg-light rounded" style="width: 400px; height: 450px; display: flex; align-items: center; justify-content: center;">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                    <div class="service-title">
                        <div class="service-title-name">
                            <div class="bg-light text-center rounded p-3 mx-5 mb-4" style="height: 40px;"></div>
                            <div class="bg-light rounded-pill py-3 px-5 mb-4" style="height: 50px;"></div>
                        </div>
                        <div class="service-content pb-4">
                            <div class="bg-light rounded mb-4 py-3" style="height: 30px;"></div>
                            <div class="px-4">
                                <div class="bg-light rounded mb-4" style="height: 60px;"></div>
                                <div class="bg-light rounded-pill py-3 px-5" style="height: 50px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="service-item">
                <div class="service-inner">
                    <div class="service-img">
                        <div class="bg-light rounded" style="width: 400px; height: 450px; display: flex; align-items: center; justify-content: center;">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                    <div class="service-title">
                        <div class="service-title-name">
                            <div class="bg-light text-center rounded p-3 mx-5 mb-4" style="height: 40px;"></div>
                            <div class="bg-light rounded-pill py-3 px-5 mb-4" style="height: 50px;"></div>
                        </div>
                        <div class="service-content pb-4">
                            <div class="bg-light rounded mb-4 py-3" style="height: 30px;"></div>
                            <div class="px-4">
                                <div class="bg-light rounded mb-4" style="height: 60px;"></div>
                                <div class="bg-light rounded-pill py-3 px-5" style="height: 50px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="service-item">
                <div class="service-inner">
                    <div class="service-img">
                        <div class="bg-light rounded" style="width: 400px; height: 450px; display: flex; align-items: center; justify-content: center;">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                    <div class="service-title">
                        <div class="service-title-name">
                            <div class="bg-light text-center rounded p-3 mx-5 mb-4" style="height: 40px;"></div>
                            <div class="bg-light rounded-pill py-3 px-5 mb-4" style="height: 50px;"></div>
                        </div>
                        <div class="service-content pb-4">
                            <div class="bg-light rounded mb-4 py-3" style="height: 30px;"></div>
                            <div class="px-4">
                                <div class="bg-light rounded mb-4" style="height: 60px;"></div>
                                <div class="bg-light rounded-pill py-3 px-5" style="height: 50px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Create error state with retry button and offline fallback
function createErrorState(error, retryFunction) {
    return `
    <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
                <h4 class="alert-heading">Failed to Load Services</h4>
                <p class="mb-3">${error.message || 'An error occurred while loading services.'}</p>
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-primary" onclick="${retryFunction}">
                        <i class="fas fa-redo me-2"></i>Try Again
                    </button>
                    <button class="btn btn-outline-secondary" onclick="showOfflineServices()">
                        <i class="fas fa-eye me-2"></i>View Offline Services
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Show offline services when API is down
function showOfflineServices() {
    const container = document.getElementById('service-categories');
    if (!container) return;
    
    const offlineServices = [
        {
            name: "Hair Styling",
            description: "Professional hair cutting, styling, coloring, and treatments. Our expert stylists create the perfect look for any occasion.",
            image: "img/hair-styling.jpg"
        },
        {
            name: "Nail Care",
            description: "Comprehensive nail services including manicures, pedicures, nail art, and gel extensions. Perfect for any special event.",
            image: "img/nails.jpg"
        },
        {
            name: "Skin Treatments",
            description: "Rejuvenating facials, anti-aging treatments, and skin care solutions tailored to your skin type and concerns.",
            image: "img/skin.jpg"
        },
        {
            name: "Makeup Services",
            description: "Professional makeup application for weddings, parties, and special events. Our artists create stunning looks that enhance your natural beauty.",
            image: "img/bridal.jpg"
        },
        {
            name: "Spa Wellness",
            description: "Relaxing spa treatments including massages, body wraps, and wellness therapies to rejuvenate your mind and body.",
            image: "img/spa.jpg"
        },
        {
            name: "Bridal Packages",
            description: "Complete bridal beauty packages including hair, makeup, nails, and skin treatments for your special day.",
            image: "img/bridal.jpg"
        }
    ];
    
    container.innerHTML = `
        <div class="row g-4">
            ${offlineServices.map(service => `
                <div class="col-lg-6 col-xl-4 mb-4">
                    <div class="service-item">
                        <div class="service-inner">
                            <div class="service-img">
                                <img src="${service.image}" class="img-fluid w-100 rounded" alt="${service.name}" width="400" height="450" style="object-fit:cover; width:400px; height:450px;">
                            </div>
                            <div class="service-title">
                                <div class="service-title-name">
                                    <div class="bg-primary text-center rounded p-3 mx-5 mb-4">
                                        <span class="h4 text-white mb-0">${service.name}</span>
                                    </div>
                                    <button class="btn btn-primary border-secondary rounded-pill py-3 px-5 mb-4" onclick="showOfflineMessage()">Explore</button>
                                </div>
                                <div class="service-content pb-4">
                                    <h4 class="text-white mb-4 py-3">${service.name}</h4>
                                    <div class="px-4">
                                        <p class="mb-4">${service.description}</p>
                                        <button class="btn btn-primary border-secondary rounded-pill py-3 px-5" onclick="showOfflineMessage()">Explore</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="row mt-4">
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Offline Mode:</strong> These are sample services. Please check your internet connection and try again for real-time service information.
                </div>
            </div>
        </div>
    `;
}

// Show message when offline service is clicked
function showOfflineMessage() {
    alert('This service is currently in offline mode. Please check your internet connection and refresh the page for real-time service information.');
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

// Render all categories into a container with loading state
async function renderCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Show loading overlay and progress bar
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingProgress = document.getElementById('loading-progress');
    const progressBar = loadingProgress?.querySelector('.progress-bar');
    
    if (loadingOverlay) loadingOverlay.style.display = 'block';
    if (loadingProgress) loadingProgress.style.display = 'block';
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 15;
            if (progressBar) progressBar.style.width = progress + '%';
        }
    }, 200);
    
    // Show slow loading warning after 5 seconds
    const slowLoadingTimeout = setTimeout(() => {
        const slowLoadingWarning = document.getElementById('slow-loading-warning');
        if (slowLoadingWarning) slowLoadingWarning.style.display = 'block';
    }, 5000);
    
    try {
        // Show loading skeleton in container
        container.innerHTML = createLoadingSkeleton();
        
        // Add a small delay to show loading state (prevents flickering for fast connections)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const categories = await fetchCategories();
        
        // Complete progress bar
        if (progressBar) progressBar.style.width = '100%';
        clearInterval(progressInterval);
        clearTimeout(slowLoadingTimeout);
        
        // Hide loading indicators
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (loadingProgress) loadingProgress.style.display = 'none';
        
        // Hide slow loading warning
        const slowLoadingWarning = document.getElementById('slow-loading-warning');
        if (slowLoadingWarning) slowLoadingWarning.style.display = 'none';
        
        if (!categories || categories.length === 0) {
            container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8 text-center">
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle fa-2x mb-3 text-info"></i>
                        <h4 class="alert-heading">No Services Available</h4>
                        <p class="mb-0">Currently no services are available. Please check back later.</p>
                    </div>
                </div>
            </div>
            `;
            return;
        }
        
        // Render the actual services
        container.innerHTML = `<div class="row g-4">${categories.map(createCategoryCard).join('')}</div>`;
        
        // Attach event listeners for explore buttons
        container.querySelectorAll('.explore-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                handleExplore(this.dataset.categoryId);
            });
        });
        
    } catch (err) {
        // Complete progress bar and hide loading indicators on error
        if (progressBar) progressBar.style.width = '100%';
        clearInterval(progressInterval);
        clearTimeout(slowLoadingTimeout);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (loadingProgress) loadingProgress.style.display = 'none';
        
        // Hide slow loading warning
        const slowLoadingWarning = document.getElementById('slow-loading-warning');
        if (slowLoadingWarning) slowLoadingWarning.style.display = 'none';
        
        console.error('Error loading services:', err);
        container.innerHTML = createErrorState(err, 'renderCategories("' + containerId + '")');
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

// Fetch sub-services for a category with timeout
async function fetchSubServices(categoryId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const res = await fetch(`${API_BASE}/sub-services/?category_id=${categoryId}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
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

// Render all sub-services into a container with loading state
async function renderSubServices(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const categoryId = getQueryParam('category_id');
    if (!categoryId) {
        container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-lg-8 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3 text-warning"></i>
                    <h4 class="alert-heading">No Category Selected</h4>
                    <p class="mb-0">Please select a service category to view sub-services.</p>
                </div>
            </div>
        </div>
        `;
        return;
    }
    
    // Show loading skeleton immediately
    container.innerHTML = createLoadingSkeleton();
    
    try {
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const subServices = await fetchSubServices(categoryId);
        
        if (!subServices || subServices.length === 0) {
            container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8 text-center">
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle fa-2x mb-3 text-info"></i>
                        <h4 class="alert-heading">No Sub-Services Available</h4>
                        <p class="mb-0">No sub-services found for this category. Please check back later.</p>
                    </div>
                </div>
            </div>
            `;
            return;
        }
        
        // Render the actual sub-services
        container.innerHTML = `<div class="row g-4">${subServices.map(createSubServiceCard).join('')}</div>`;
        
    } catch (err) {
        console.error('Error loading sub-services:', err);
        container.innerHTML = createErrorState(err, 'renderSubServices("' + containerId + '")');
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

// Add to cart and store selected service ID
function addToCartAndStoreId(id, name, price) {
    // Store the selected service ID
    localStorage.setItem('selectedServiceId', id);
    
    // Add to cart
    addToCart(id, name, price);
}

function removeFromCart(id) {
    let cart = getCart();
    const itemToRemove = cart.find(item => item.id === id);
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    
    // Add visual feedback - flash the service card briefly
    const serviceCard = document.querySelector(`[data-add-btn="${id}"]`)?.closest('.service-card');
    if (serviceCard) {
        serviceCard.style.transition = 'all 0.3s ease';
        serviceCard.style.transform = 'scale(0.98)';
        serviceCard.style.opacity = '0.7';
        setTimeout(() => {
            serviceCard.style.transform = 'scale(1)';
            serviceCard.style.opacity = '1';
        }, 300);
    }
    
    updateAllCartUI();
    
    // Show notification
    if (itemToRemove) {
        showNotification(`${itemToRemove.name} removed from cart`, 'success');
    }
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
    // Get all quantity UI spans and clear them first
    const allQtySpans = document.querySelectorAll('[id^="qty-ui-"]');
    allQtySpans.forEach(span => {
        span.innerHTML = '';
    });
    
    // Update the quantity UI for each service card that's in cart
    const cart = getCart();
    cart.forEach(item => {
        const qtySpan = document.getElementById(`qty-ui-${item.id}`);
        if (qtySpan) {
            qtySpan.innerHTML = `
                <div class='cart-item-qty-group d-inline-flex align-items-center ms-2'>
                    <button onclick="changeCartQty('${item.id}', -1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                    <input type='text' value='${item.qty}' readonly style="border: none; background: transparent; width: 32px; text-align: center; font-size: 1rem; font-weight: 500; color: #222;" />
                    <button onclick="changeCartQty('${item.id}', 1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')" style="color: #d32f2f; font-weight: 500; font-size: 1rem; border: none; background: none; padding: 0 0.5rem; margin-left: 0.5rem;">&times;</button>
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
                        <button onclick="changeCartQty('${item.id}', -1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                        <input type='text' value='${item.qty}' readonly style="border: none; background: transparent; width: 32px; text-align: center; font-size: 1rem; font-weight: 500; color: #222;" />
                        <button onclick="changeCartQty('${item.id}', 1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                    </div>
                    <span class='cart-item-price ms-2'>₹${item.price * item.qty}</span>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')" style="color: #d32f2f; font-weight: 500; font-size: 1rem; border: none; background: none; padding: 0 0.5rem; margin-left: 0.5rem;">Remove</button>
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
                        <button onclick="changeCartQty('${item.id}', -1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                        <input type='text' value='${item.qty}' readonly style="border: none; background: transparent; width: 32px; text-align: center; font-size: 1rem; font-weight: 500; color: #222;" />
                        <button onclick="changeCartQty('${item.id}', 1)" style="border: none; background: none; color: #0d6efd; font-size: 1.2rem; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                    </div>
                    <span class='cart-item-price ms-2'>₹${item.price * item.qty}</span>
                    <button class='cart-remove-btn' onclick="removeFromCart('${item.id}')" style="color: #d32f2f; font-weight: 500; font-size: 1rem; border: none; background: none; padding: 0 0.5rem; margin-left: 0.5rem;">Remove</button>
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

// Network status detection
function checkNetworkStatus() {
    const networkStatus = document.getElementById('network-status');
    if (!networkStatus) return;
    
    if (!navigator.onLine) {
        networkStatus.style.display = 'block';
    } else {
        networkStatus.style.display = 'none';
    }
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
    
    // Check network status
    checkNetworkStatus();
    
    // Listen for network status changes
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
    
    // Initial UI update
    updateAllCartUI();
});

// Expose functions globally
window.renderCategories = renderCategories;
window.renderSubServices = renderSubServices;
window.addToCart = addToCart;
window.addToCartAndStoreId = addToCartAndStoreId;
window.removeFromCart = removeFromCart;
window.changeCartQty = changeCartQty;
window.updateAllCartUI = updateAllCartUI;
window.closeCartDrawer = closeCartDrawer;
window.showOfflineServices = showOfflineServices;
window.showOfflineMessage = showOfflineMessage; 