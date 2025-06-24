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

})(jQuery);

