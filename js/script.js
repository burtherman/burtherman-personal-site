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
            // Update aria-expanded state
            if (openBtn) {
                openBtn.setAttribute('aria-expanded', 'true');
            }
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
            // Update aria-expanded state
            if (openBtn) {
                openBtn.setAttribute('aria-expanded', 'false');
            }
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
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Trap focus inside modal when open
    if (modal) {
        modal.addEventListener('keydown', function (e) {
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

    // Handle photo rotation on mobile with touch/swipe support
    const photos = document.querySelectorAll('.photo-gallery img');
    const photoGallery = document.querySelector('.photo-gallery');
    let currentPhotoIndex = 0;
    let rotationInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    function changePhoto(newIndex) {
        photos[currentPhotoIndex].classList.remove('active');
        currentPhotoIndex = newIndex;
        photos[currentPhotoIndex].classList.add('active');
    }

    function startRotation() {
        if (window.innerWidth <= 768 && photos.length > 1) {
            if (!rotationInterval) {
                rotationInterval = setInterval(() => {
                    const nextIndex = (currentPhotoIndex + 1) % photos.length;
                    changePhoto(nextIndex);
                }, 3000); // Rotate every 3 seconds
            }
        } else {
            if (rotationInterval) {
                clearInterval(rotationInterval);
                rotationInterval = null;
                // Reset to first photo when not in mobile mode
                photos.forEach(photo => photo.classList.remove('active'));
                if (photos.length > 0) photos[0].classList.add('active');
                currentPhotoIndex = 0;
            }
        }
    }

    // Touch/swipe controls for mobile
    if (photoGallery && window.innerWidth <= 768) {
        photoGallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        photoGallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                // Clear auto-rotation on manual swipe
                if (rotationInterval) {
                    clearInterval(rotationInterval);
                    rotationInterval = null;
                }

                if (diff > 0) {
                    // Swipe left - next photo
                    const nextIndex = (currentPhotoIndex + 1) % photos.length;
                    changePhoto(nextIndex);
                } else {
                    // Swipe right - previous photo
                    const prevIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
                    changePhoto(prevIndex);
                }

                // Restart auto-rotation after 5 seconds
                setTimeout(() => {
                    if (window.innerWidth <= 768) {
                        startRotation();
                    }
                }, 5000);
            }
        }
    }

    startRotation();
    window.addEventListener('resize', startRotation);

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
            const isMobile = window.innerWidth <= 768;
            if (isMobile && mobileHeaderBar) {
                mobileHeaderBar.classList.add('visible');
            }
        } else {
            if (header) header.classList.remove('scrolled');
            document.body.classList.remove('scrolled');

            // Hide mobile header bar on mobile devices
            const isMobile = window.innerWidth <= 768;
            if (isMobile && mobileHeaderBar) {
                mobileHeaderBar.classList.remove('visible');
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }

        // Scroll Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById("progressBar").style.width = scrolled + "%";

        // Back to Top Button visibility
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (winScroll > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });

    // Back to Top Button functionality
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll-triggered animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // Observe all bento cards
    document.querySelectorAll('.bento-card').forEach(el => {
        observer.observe(el);
    });

    // Fix Bento Grid Layout
    function fixBentoGrid() {
        const grid = document.querySelector('.bento-grid');
        if (!grid) return;

        const items = grid.querySelectorAll('.bento-card');
        if (items.length === 0) return;

        const lastItem = items[items.length - 1];

        // Reset first to get natural position
        lastItem.style.gridColumn = '';

        // Get grid info
        const gridStyle = window.getComputedStyle(grid);
        const gridCols = gridStyle.gridTemplateColumns.split(' ').length;

        if (gridCols <= 1) return; // No need to fix for single column

        // Calculate current column of last item
        const gridRect = grid.getBoundingClientRect();
        const itemRect = lastItem.getBoundingClientRect();
        const gap = parseFloat(gridStyle.gap) || 16;
        const colWidth = (gridRect.width - (gap * (gridCols - 1))) / gridCols;

        // 0-based index
        const colIndex = Math.round((itemRect.left - gridRect.left) / (colWidth + gap));

        // If it's not the last column, span to the end
        if (colIndex < gridCols - 1) {
            // +1 for 1-based grid line
            lastItem.style.gridColumn = `${colIndex + 1} / -1`;
        }
    }

    // Run on load and resize
    fixBentoGrid();
    window.addEventListener('resize', () => {
        // Debounce slightly
        setTimeout(fixBentoGrid, 100);
    });

    // Magnetic Button Effect (only for mouse users, not keyboard)
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        let isUsingMouse = false;

        btn.addEventListener('mouseenter', () => {
            isUsingMouse = true;
        });

        btn.addEventListener('mousemove', (e) => {
            if (!isUsingMouse) return;

            // Don't apply magnetic effect if element has focus (keyboard user)
            if (document.activeElement === btn) return;

            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Limit the movement
            const intensity = 0.4;
            btn.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            isUsingMouse = false;
            btn.style.transform = 'translate(0, 0)';
        });

        // Disable magnetic effect when focused via keyboard
        btn.addEventListener('focus', () => {
            btn.style.transform = 'translate(0, 0)';
        });

        btn.addEventListener('blur', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
});
