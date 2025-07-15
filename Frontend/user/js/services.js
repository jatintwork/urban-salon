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

// Expose functions globally
window.renderCategories = renderCategories;
window.renderSubServices = renderSubServices; 