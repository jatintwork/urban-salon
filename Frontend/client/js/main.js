
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
        this.pollingInterval = 5000; // 5 seconds in milliseconds
        this.isPolling = false;
    }

    // Initialize the notification system
    init() {
        if (this.isInitialized) return;
        console.log('Initializing centralized notification system...');
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
            console.log('Notification elements found, starting centralized system...');
            this.startNotificationPolling();
            this.fetchNotifications(); // Initial fetch
            this.setupNotificationEvents();
        } else {
            // Elements not ready yet, try again in 100ms
            setTimeout(() => this.waitForNavbarElements(), 100);
        }
    }

    // Setup notification button events
    setupNotificationEvents() {
        if (this.notificationBell) {
            // Add click event for manual refresh
            this.notificationBell.addEventListener('click', () => {
                console.log('Notification bell clicked - manual refresh');
                this.fetchNotifications();
            });
            
            // Add hover effect
            this.notificationBell.addEventListener('mouseenter', () => {
                this.notificationBell.style.transform = 'scale(1.1)';
                this.notificationBell.style.transition = 'transform 0.2s ease';
            });
            
            this.notificationBell.addEventListener('mouseleave', () => {
                this.notificationBell.style.transform = 'scale(1)';
            });
        }
    }

    // Start polling for notifications every 5 seconds
    startNotificationPolling() {
        // Clear any existing interval
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
        
        // Set up new interval for centralized polling
        this.notificationInterval = setInterval(() => {
            if (!this.isPolling) {
                this.isPolling = true;
                this.fetchNotifications().finally(() => {
                    this.isPolling = false;
                });
            }
        }, this.pollingInterval);
        
        console.log(`Centralized notification polling started - fetching every ${this.pollingInterval/1000} seconds`);
        
        // Add visual indicator that polling is active
        this.showPollingIndicator();
    }

    // Show polling indicator
    showPollingIndicator() {
        if (this.notificationBell) {
            // Add a subtle pulse animation to indicate active polling
            this.notificationBell.style.animation = 'notificationPulse 2s infinite';
        }
    }

    // Stop polling for notifications
    stopNotificationPolling() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
            this.isPolling = false;
            console.log('Centralized notification polling stopped');
            
            // Remove polling indicator
            if (this.notificationBell) {
                this.notificationBell.style.animation = '';
            }
        }
    }

    // Fetch notifications from API
    async fetchNotifications() {
        try {
            // Get user data to include in request
            const userData = this.getUserData();
            if (!userData) {
                console.log('No user data found, skipping notification fetch');
                this.updateNotificationUI({ notifications: [] });
                return;
            }
            
            // Debug: Log user data and token
            console.log('User data found:', userData);
            console.log('Access token:', userData.access_token);
            console.log('Token type:', typeof userData.access_token);
            console.log('Token length:', userData.access_token ? userData.access_token.length : 'undefined');
            
            // Use the correct notification endpoint
            const endpoint = `${this.API_BASE_URL}/services/notifications/?page=1&page_size=5`;
            console.log(`Fetching notifications from: ${endpoint}`);
            
            // Debug: Log the complete Authorization header
            const authHeader = `Bearer ${userData.access_token}`;
            console.log('Authorization header:', authHeader);
            
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                });
                
                console.log('Response status:', response.status);
                console.log('Response status text:', response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Notifications fetched successfully from:', endpoint);
                    this.updateNotificationUI(data);
                } else {
                    console.log(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
                    // Debug: Log response headers for more info
                    console.log('Response headers:', response.headers);
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
        
        // Update notification count with centralized logic
        this.notificationCount.textContent = count;
        this.notificationCount.style.display = count > 0 ? 'block' : 'none';
        
        // Update notification dropdown content
        this.updateNotificationDropdown(notifications);
        
        // Show notification badge animation if count increased
        if (count > this.lastNotificationCount && count > 0) {
            this.showNotificationBadgeAnimation();
            this.showNotificationToast(count);
        }
        
        this.lastNotificationCount = count;
        console.log(`Notification count updated: ${count} notifications`);
    }

    // Show notification toast for new notifications
    showNotificationToast(count) {
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-bell text-primary"></i>
                <span>${count} new notification${count > 1 ? 's' : ''}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Update notification dropdown content
    updateNotificationDropdown(notifications) {
        if (!this.notificationDropdown) return;
        
        let dropdownHTML = `
            <li class="dropdown-header text-center">
                <i class="fas fa-bell me-2"></i>Notifications
                <small class="text-muted d-block">Last updated: ${new Date().toLocaleTimeString()}</small>
            </li>
            <li><hr class="dropdown-divider"></li>
        `;
        
        if (notifications.length === 0) {
            dropdownHTML += `
                <li>
                    <a class="dropdown-item notification-text text-muted text-center" href="#">
                        <i class="fas fa-check-circle me-2"></i>No new notifications
                    </a>
                </li>
            `;
        } else {
            notifications.forEach((notification, index) => {
                const isNew = index < (this.lastNotificationCount - notifications.length);
                dropdownHTML += `
                    <li>
                        <a class="dropdown-item notification-text ${isNew ? 'bg-light' : ''}" 
                           href="#" onclick="handleNotificationClick('${notification.id}')">
                            <div class="d-flex align-items-start">
                                <i class="fas fa-info-circle text-primary me-2 mt-1"></i>
                                <div class="flex-grow-1">
                                    <div class="fw-medium">${notification.message}</div>
                                    <small class="text-muted">${this.formatNotificationTime(notification.timestamp)}</small>
                                </div>
                                ${isNew ? '<span class="badge bg-primary ms-2">New</span>' : ''}
                            </div>
                        </a>
                    </li>
                `;
            });
        }
        
        dropdownHTML += `
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-center text-primary" href="#" onclick="viewAllNotifications()">
                <i class="fas fa-list me-2"></i>View all notifications
            </a></li>
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
            this.notificationCount.style.animation = 'notificationPulse 0.6s ease-in-out';
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
        console.log('Notification system cleaned up');
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

// Add CSS for notification animations and styling
const notificationStyles = `
    @keyframes notificationPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .notification-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
    }
    
    #notificationBell {
        transition: all 0.2s ease;
    }
    
    #notificationBell:hover {
        background-color: #f8f9fa !important;
        transform: scale(1.05);
    }
    
    .notification-text {
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .dropdown-menu {
        max-height: 400px;
        overflow-y: auto;
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
(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
            $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
    });

    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 5,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonial-carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: false,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:2
            },
            1200:{
                items:2
            }
        }
    });

    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


   

    // ================= Notification Bell Logic =================
    // Refactored into a function to be called after navbar is loaded
    window.initNotificationBell = function () {
        const NOTIF_API = 'http://127.0.0.1:7002/services/notifications/';
        const PAGE_SIZE = 5;
        let currentPage = 1;
        let hasNextPage = false;
        let notifications = [];
        let unreadCount = 0;
        let loading = false;

        // Elements
        const $notifBell = $('#notificationBell');
        const $notifCount = $('#notificationCount');
        const $notifDropdown = $('#notificationDropdownContainer ul.dropdown-menu');

        // Helper: Render notifications in dropdown
        function renderNotifications() {
            $notifDropdown.empty();
            $notifDropdown.append('<li class="dropdown-header text-center">Notifications</li>');
            $notifDropdown.append('<li><hr class="dropdown-divider"></li>');
            if (notifications.length === 0) {
                $notifDropdown.append('<li class="dropdown-item text-center text-muted">No notifications</li>');
            } else {
                notifications.forEach(function (notif) {
                    const readClass = notif.is_read ? '' : 'fw-bold';
                    $notifDropdown.append(
                        `<li><a class="dropdown-item notification-text ${readClass}" href="#" data-id="${notif.id}">${notif.message}</a></li>`
                    );
                });
            }
            $notifDropdown.append('<li><hr class="dropdown-divider"></li>');
            if (hasNextPage) {
                $notifDropdown.append('<li><a class="dropdown-item text-center text-primary" href="#" id="loadMoreNotif">View more</a></li>');
            } else {
                $notifDropdown.append('<li><a class="dropdown-item text-center text-muted" href="#">No more notifications</a></li>');
            }
        }

        // Helper: Update unread count badge
        function updateUnreadCount() {
            unreadCount = notifications.filter(n => !n.is_read).length;
            if (unreadCount > 0) {
                $notifCount.text(unreadCount).show();
            } else {
                $notifCount.text('0').hide();
            }
        }

        // Fetch notifications (with pagination)
        function fetchNotifications(page = 1, append = false) {
            if (loading) return;
            loading = true;
            $.get(`${NOTIF_API}?page=${page}&page_size=${PAGE_SIZE}`)
                .done(function (data) {
                    hasNextPage = !!data.next;
                    if (append) {
                        notifications = notifications.concat(data.results);
                    } else {
                        notifications = data.results;
                    }
                    renderNotifications();
                    updateUnreadCount();
                })
                .always(function () {
                    loading = false;
                });
        }

        // Poll every 5 seconds
        if ($notifBell.length) {
            setInterval(function () {
                fetchNotifications(1, false);
                currentPage = 1;
            }, 5000);
        }

        // Initial fetch
        if ($notifBell.length) {
            fetchNotifications(1, false);
        }

        // Lazy load (View more)
        $notifDropdown.on('click', '#loadMoreNotif', function (e) {
            e.preventDefault();
            if (hasNextPage) {
                currentPage += 1;
                fetchNotifications(currentPage, true);
            }
        });

        // Mark all as read when bell is clicked
        $notifBell.on('click', function () {
            if (unreadCount > 0) {
                $.ajax({
                    url: NOTIF_API,
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + (localStorage.getItem('urbanSalonUser') ? JSON.parse(localStorage.getItem('urbanSalonUser')).access_token : '')
                    },
                    success: function () {
                        // Mark all as read locally
                        notifications.forEach(n => n.is_read = true);
                        updateUnreadCount();
                        renderNotifications();
                    }
                });
            }
        });

        // Optional: Mark individual notification as read (if needed)
        $notifDropdown.on('click', '.notification-text', function (e) {
            const notifId = $(this).data('id');
            notifications.forEach(n => {
                if (n.id == notifId) n.is_read = true;
            });
            updateUnreadCount();
            renderNotifications();
        });
    };

})(jQuery);

