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

    // Handle photo rotation on mobile
    const photos = document.querySelectorAll('.photo-gallery img');
    let currentPhotoIndex = 0;
    let rotationInterval;

    function startRotation() {
        if (window.innerWidth <= 768 && photos.length > 1) {
            if (!rotationInterval) {
                rotationInterval = setInterval(() => {
                    photos[currentPhotoIndex].classList.remove('active');
                    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
                    photos[currentPhotoIndex].classList.add('active');
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

    // Magnetic Button Effect
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Limit the movement
            const intensity = 0.4;
            btn.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
});
