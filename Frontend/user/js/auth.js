// Shared Authentication Logic for Urban Salon
// Include this script on all pages to maintain consistent login state

function checkUserAuthentication() {
    // Check both localStorage and sessionStorage
    let userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Update navbar welcome text if element exists
            const navWelcomeText = document.getElementById('navWelcomeText');
            if (navWelcomeText) {
                const userName = user.email.split('@')[0];
                navWelcomeText.textContent = userName;
                
                // Add role badge if admin
                if (user.role === 'admin') {
                    navWelcomeText.innerHTML = `${userName} <span class="badge bg-warning text-dark ms-1">Admin</span>`;
                }
            }
            
            // Show logged-in state elements if they exist
            const loginSection = document.getElementById('loginSection');
            const userSection = document.getElementById('userSection');
            const dashboardNav = document.getElementById('dashboardNav');
            
            if (loginSection) loginSection.classList.add('d-none');
            if (userSection) userSection.classList.remove('d-none');
            if (dashboardNav) dashboardNav.classList.remove('d-none');
            
            // Update dashboard welcome text if on dashboard page
            const dashboardWelcome = document.getElementById('dashboardWelcome');
            if (dashboardWelcome) {
                const userName = user.email.split('@')[0];
                dashboardWelcome.textContent = `Dashboard - ${userName}`;
            }
            
            // Show appropriate dashboard based on role (dashboard page only)
            if (window.location.pathname.includes('dashboard.html')) {
                showDashboardByRole(user.role);
            }
            
            // Initialize notifications for logged-in users
            if (typeof initializeNotifications === 'function') {
                initializeNotifications();
            }
            
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear invalid data
            localStorage.removeItem('urbanSalonUser');
            sessionStorage.removeItem('urbanSalonUser');
            showLoginState();
        }
    } else {
        showLoginState();
    }
}

function showLoginState() {
    // Show login state elements if they exist
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const dashboardNav = document.getElementById('dashboardNav');
    
    if (loginSection) loginSection.classList.remove('d-none');
    if (userSection) userSection.classList.add('d-none');
    if (dashboardNav) dashboardNav.classList.add('d-none');
    
    // Reset navbar welcome text if element exists
    const navWelcomeText = document.getElementById('navWelcomeText');
    if (navWelcomeText) {
        navWelcomeText.textContent = 'User';
    }
    
    // Clean up notifications when user logs out
    if (typeof notificationManager !== 'undefined' && notificationManager.cleanup) {
        notificationManager.cleanup();
    }
}

function showDashboardByRole(role) {
    // Hide all dashboards first
    const userDashboard = document.getElementById('userDashboard');
    const clientDashboard = document.getElementById('clientDashboard');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (userDashboard) userDashboard.classList.add('d-none');
    if (clientDashboard) clientDashboard.classList.add('d-none');
    if (adminDashboard) adminDashboard.classList.add('d-none');
    
    // Show appropriate dashboard
    switch(role) {
        case 'user':
            if (userDashboard) userDashboard.classList.remove('d-none');
            break;
        case 'client':
            if (clientDashboard) clientDashboard.classList.remove('d-none');
            break;
        case 'admin':
            if (adminDashboard) adminDashboard.classList.remove('d-none');
            break;
        default:
            if (userDashboard) userDashboard.classList.remove('d-none');
    }
}

function logout() {
    // Clean up notifications before logout
    if (typeof notificationManager !== 'undefined' && notificationManager.cleanup) {
        notificationManager.cleanup();
    }
    
    // Remove user data
    localStorage.removeItem('urbanSalonUser');
    sessionStorage.removeItem('urbanSalonUser');
    
    // Show login state
    showLoginState();
    
    // Show logout message
    alert('You have been logged out successfully!');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Make logout function globally available
window.logout = logout;

// Function to wait for navbar to load and then check authentication
function waitForNavbarAndCheckAuth() {
    // Check if navbar elements exist
    const navWelcomeText = document.getElementById('navWelcomeText');
    const loginSection = document.getElementById('loginSection');
    
    if (navWelcomeText && loginSection) {
        // Navbar is loaded, check authentication
        checkUserAuthentication();
    } else {
        // Navbar not loaded yet, wait a bit and try again
        setTimeout(waitForNavbarAndCheckAuth, 100);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for navbar to load before checking authentication
    setTimeout(waitForNavbarAndCheckAuth, 500);
});

// Check authentication status periodically (every 5 minutes)
setInterval(checkUserAuthentication, 300000); 