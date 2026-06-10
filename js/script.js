// Google Analytics bootstrap — lives here (not inline) so the CSP can
// exclude 'unsafe-inline' from script-src
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-2WK2XFD3ZD');

// Set copyright year
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Bio modal — native <dialog> handles focus trapping, ESC, and inerting
    // the background; we only manage aria-expanded and page scroll
    const modal = document.getElementById('bioModal');
    const openBtn = document.querySelector('.read-more-btn');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;

    if (modal && openBtn) {
        openBtn.addEventListener('click', () => {
            modal.showModal();
            openBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        });

        modal.addEventListener('close', () => {
            openBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            openBtn.focus();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.close());
        }

        // Click on the backdrop (the dialog itself, outside .modal-content) closes
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    }

    // Mobile header bar: show after scrolling past the name
    const mobileHeaderBar = document.querySelector('.mobile-header-bar');
    let ticking = false;

    function updateMobileHeader() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const isMobile = window.innerWidth <= 768;
        if (mobileHeaderBar) {
            if (isMobile && scrollTop > 100) {
                mobileHeaderBar.classList.add('visible');
            } else {
                mobileHeaderBar.classList.remove('visible');
            }
        }
        ticking = false;
    }

    function requestMobileHeaderUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateMobileHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestMobileHeaderUpdate);
    window.addEventListener('resize', requestMobileHeaderUpdate);

    // Space Invaders easter egg trigger
    function launchInvaders() {
        // Scroll to top for better arena
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => window.spaceInvaders.start(), 500);
    }

    const invaderTrigger = document.getElementById('startInvaders');
    if (invaderTrigger) {
        invaderTrigger.addEventListener('click', launchInvaders);
    }

    // Konami code also launches the game
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPos = 0;

    document.addEventListener('keydown', (event) => {
        if (window.spaceInvaders && window.spaceInvaders.active) return;
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (key === konami[konamiPos]) {
            konamiPos++;
            if (konamiPos === konami.length) {
                konamiPos = 0;
                launchInvaders();
            }
        } else {
            konamiPos = key === konami[0] ? 1 : 0;
        }
    });
});
