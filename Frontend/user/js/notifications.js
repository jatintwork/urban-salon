// Centralized Notification System for Urban Salon
// This script handles real-time notifications across all pages

class NotificationManager {
    constructor() {
        this.notificationInterval = null;
        this.lastNotificationCount = 0;
        this.notificationBell = null;
        this.notificationCount = null;
        this.notificationDropdown = null;
        this.isInitialized = false;
        this.API_BASE_URL = 'http://127.0.0.1:7002'; // Base API URL
    }

    // Initialize the notification system
    init() {
        if (this.isInitialized) return;
        
        // Wait for navbar to load
        this.waitForNavbarElements();
    }

    // Wait for navbar elements to be available
    waitForNavbarElements() {
        this.notificationBell = document.getElementById('notificationBell');
        this.notificationCount = document.getElementById('notificationCount');
        this.notificationDropdown = document.querySelector('#notificationDropdownContainer .dropdown-menu');
        
        if (this.notificationBell && this.notificationCount) {
            this.isInitialized = true;
            this.startNotificationPolling();
            this.fetchNotifications(); // Initial fetch
        } else {
            // Elements not ready yet, try again in 100ms
            setTimeout(() => this.waitForNavbarElements(), 100);
        }
    }

    // Start polling for notifications every 5 seconds
    startNotificationPolling() {
        // Clear any existing interval
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
        
        // Set up new interval
        this.notificationInterval = setInterval(() => {
            this.fetchNotifications();
        }, 5000); // 5 seconds
        
        console.log('Notification polling started - fetching every 5 seconds');
    }

    // Stop polling for notifications
    stopNotificationPolling() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
            console.log('Notification polling stopped');
        }
    }

    // Fetch notifications from API
    async fetchNotifications() {
        try {
            // Get user data to include in request
            const userData = this.getUserData();
            if (!userData) {
                console.log('No user data found, skipping notification fetch');
                return;
            }

            // Use the correct notification endpoint
            const endpoint = `${this.API_BASE_URL}/services/notifications/?page=1&page_size=5`;

            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userData.access_token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Notifications fetched successfully from:', endpoint);
                    this.updateNotificationUI(data);
                } else {
                    console.log(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
                    this.updateNotificationUI({ notifications: [] });
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
                this.updateNotificationUI({ notifications: [] });
            }

        } catch (error) {
            console.error('Error in notification fetch:', error);
            this.updateNotificationUI({ notifications: [] });
        }
    }

    // Get user data from storage
    getUserData() {
        const userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Update notification UI with fetched data
    updateNotificationUI(data) {
        if (!this.notificationCount || !this.notificationDropdown) return;

        const notifications = data.notifications || [];
        const count = notifications.length;

        // Update notification count
        this.notificationCount.textContent = count;
        this.notificationCount.style.display = count > 0 ? 'block' : 'none';

        // Update notification dropdown content
        this.updateNotificationDropdown(notifications);

        // Show notification badge animation if count increased
        if (count > this.lastNotificationCount) {
            this.showNotificationBadgeAnimation();
        }

        this.lastNotificationCount = count;
    }

    // Update notification dropdown content
    updateNotificationDropdown(notifications) {
        if (!this.notificationDropdown) return;

        let dropdownHTML = `
            <li class="dropdown-header text-center">Notifications</li>
            <li><hr class="dropdown-divider"></li>
        `;

        if (notifications.length === 0) {
            dropdownHTML += `
                <li>
                    <a class="dropdown-item notification-text text-muted" href="#">
                        No new notifications
                    </a>
                </li>
            `;
        } else {
            notifications.forEach(notification => {
                dropdownHTML += `
                    <li>
                        <a class="dropdown-item notification-text" href="#" onclick="handleNotificationClick('${notification.id}')">
                            ${notification.message}
                            <small class="text-muted d-block mt-1">${this.formatNotificationTime(notification.timestamp)}</small>
                        </a>
                    </li>
                `;
            });
        }

        dropdownHTML += `
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-center text-primary" href="#" onclick="viewAllNotifications()">View all notifications</a></li>
        `;

        this.notificationDropdown.innerHTML = dropdownHTML;
    }

    // Format notification timestamp
    formatNotificationTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    }

    // Show animation when new notification arrives
    showNotificationBadgeAnimation() {
        if (this.notificationCount) {
            this.notificationCount.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.notificationCount.style.animation = '';
            }, 600);
        }
    }

    // Handle notification click
    handleNotificationClick(notificationId) {
        console.log('Notification clicked:', notificationId);
        // Add your notification click handling logic here
        // For example, mark as read, navigate to specific page, etc.
    }

    // View all notifications
    viewAllNotifications() {
        console.log('View all notifications clicked');
        // Add your logic to show all notifications page
        // For example: window.location.href = 'notifications.html';
    }

    // Clean up when user logs out
    cleanup() {
        this.stopNotificationPolling();
        this.isInitialized = false;
    }
}

// Global notification manager instance
const notificationManager = new NotificationManager();

// Initialize notifications when auth check completes
function initializeNotifications() {
    const userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
    if (userData) {
        notificationManager.init();
    }
}

// Make notification functions globally available
window.handleNotificationClick = (notificationId) => {
    notificationManager.handleNotificationClick(notificationId);
};

window.viewAllNotifications = () => {
    notificationManager.viewAllNotifications();
};

// Add CSS for notification badge animation
const notificationStyles = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;

// Inject styles if not already present
if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other scripts
window.notificationManager = notificationManager; 

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${getBootstrapAlertType(type)} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        max-width: 600px;
        white-space: pre-line;
    `;

    // Set icon based on type
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <i class="${icon} me-2"></i>
        <div style="white-space: pre-line;">${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 8 seconds for success messages (longer for booking details)
    const autoRemoveTime = type === 'success' ? 8000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, autoRemoveTime);
}

// Get Bootstrap alert type
function getBootstrapAlertType(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        default: return 'info';
    }
}

// Get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
    }
}

// Export for global access
window.showNotification = showNotification; 