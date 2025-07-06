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
    
    
    // Initiate the wowjs if it exists
    if (typeof WOW === 'function') {
        new WOW().init();
    }


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
            $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
    });

    // Facts counter
    if ($.fn.counterUp && $('[data-toggle="counter-up"]').length) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 5,
            time: 2000
        });
    }


    // Modal Video
    if ($('.btn-play').length) {
        $(document).ready(function () {
            var $videoSrc;
            $('.btn-play').click(function () {
                $videoSrc = $(this).data("src");
            });

            $('#videoModal').on('shown.bs.modal', function (e) {
                if ($videoSrc) {
                    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
                }
            });

            $('#videoModal').on('hide.bs.modal', function (e) {
                if ($videoSrc) {
                    $("#video").attr('src', $videoSrc);
                }
            });
        });
    }


    // Testimonial-carousel
    if ($.fn.owlCarousel && $(".testimonial-carousel").length) {
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
    }

    
    
   // Back to top button
   if ($('.back-to-top').length) {
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
   }


    // Logout function to remove user data and redirect to login
    window.logout = function() {
        localStorage.removeItem('urbanSalonUser');
        sessionStorage.removeItem('urbanSalonUser');
        // Also clear the old token for good measure, if it exists
        localStorage.removeItem('access_token'); 
        window.location.href = 'login.html';
    };

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

