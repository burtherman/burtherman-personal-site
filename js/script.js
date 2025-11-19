// Set copyright year
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Modal functionality
    const modal = document.getElementById('bioModal');
    const openBtn = document.querySelector('.read-more-btn');
    const closeBtn = document.querySelector('.close-btn');

    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            // Focus management for accessibility
            const closeButton = modal.querySelector('.close-btn');
            if (closeButton) {
                closeButton.focus();
            }
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore background scrolling
            if (openBtn) {
                openBtn.focus(); // Return focus to the trigger button
            }
        }
    }

    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Trap focus inside modal when open
    if (modal) {
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableContent = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstFocusableElement = focusableContent[0];
                const lastFocusableElement = focusableContent[focusableContent.length - 1];

                if (e.shiftKey) { // if shift key pressed for shift + tab combination
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus(); // add focus for the last focusable element
                        e.preventDefault();
                    }
                } else { // if tab key is pressed
                    if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Handle photo rotation on mobile
    const photos = document.querySelectorAll('.photo-gallery img');
    const isMobile = window.innerWidth <= 768;
    let currentPhotoIndex = 0;

    if (isMobile && photos.length > 1) {
        setInterval(() => {
            photos[currentPhotoIndex].classList.remove('active');
            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
            photos[currentPhotoIndex].classList.add('active');
        }, 3000); // Rotate every 3 seconds
    }

    // Handle header shrinking on scroll
    let ticking = false;
    const header = document.querySelector('header');
    const mobileHeaderBar = document.querySelector('.mobile-header-bar');

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            if (header) header.classList.add('scrolled');
            document.body.classList.add('scrolled');

            // Show mobile header bar on mobile devices
            if (isMobile && mobileHeaderBar) {
                mobileHeaderBar.classList.add('visible');
            }
        } else {
            if (header) header.classList.remove('scrolled');
            document.body.classList.remove('scrolled');

            // Hide mobile header bar on mobile devices
            if (isMobile && mobileHeaderBar) {
                mobileHeaderBar.classList.remove('visible');
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
});
