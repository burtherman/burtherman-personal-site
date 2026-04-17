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
            if (openBtn) {
                openBtn.setAttribute('aria-expanded', 'true');
            }
            const closeButton = modal.querySelector('.close-btn');
            if (closeButton) {
                closeButton.focus();
            }
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            if (openBtn) {
                openBtn.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
            if (openBtn) {
                openBtn.focus();
            }
        }
    }

    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

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

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Mobile header bar: show after scrolling past the name
    const mobileHeaderBar = document.querySelector('.mobile-header-bar');
    let ticking = false;

    function updateMobileHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isMobile = window.innerWidth <= 768;
        if (isMobile && mobileHeaderBar) {
            if (scrollTop > 100) {
                mobileHeaderBar.classList.add('visible');
            } else {
                mobileHeaderBar.classList.remove('visible');
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateMobileHeader);
            ticking = true;
        }
    });

});
