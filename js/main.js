/* ========================================
   Western PA Supply Co — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Logo Scroll Speed (consistent across all pages) ----
  const logoScroll = document.querySelector('.logo-scroll');
  if (logoScroll) {
    const speed = 50; // pixels per second — consistent regardless of logo count
    const setWidth = logoScroll.scrollWidth / 4; // 4 duplicate sets
    const duration = setWidth / speed;
    logoScroll.style.setProperty('--scroll-duration', duration + 's');
  }

  // ---- Mobile Menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const closeMenu = document.getElementById('close-menu');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ---- Mobile Services Accordion ----
  const mobileServicesToggle = document.getElementById('mobile-products-toggle');
  const mobileServicesList = document.getElementById('mobile-products-list');
  const accordionArrow = document.querySelector('.accordion-arrow');

  if (mobileServicesToggle && mobileServicesList) {
    mobileServicesToggle.addEventListener('click', () => {
      mobileServicesList.classList.toggle('open');
      if (accordionArrow) accordionArrow.classList.toggle('open');
      const expanded = mobileServicesToggle.getAttribute('aria-expanded') === 'true';
      mobileServicesToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // ---- Form Handling ----
  const contactForm = document.getElementById('contact-form');
  const formTimestamp = document.getElementById('form-timestamp');

  // Set timestamp on page load
  if (formTimestamp) {
    formTimestamp.value = Date.now();
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));

      // Client-side honeypot check
      if (data._honeypot) return;

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const res = await fetch('WORKER_URL', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          form.reset();
          // Reset timestamp
          if (formTimestamp) formTimestamp.value = Date.now();
          const msg = document.getElementById('form-success');
          if (msg) {
            msg.classList.remove('hidden');
            msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          // Clean URL params
          history.replaceState(null, '', window.location.pathname);
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        alert('Something went wrong. Please call us directly at (412) 643-9638.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ---- Sticky Header — collapse top bar + add shadow on scroll ----
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    let headerCollapsed = false;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (!headerCollapsed && y > 60) {
            siteHeader.classList.add('header-scrolled');
            headerCollapsed = true;
          } else if (headerCollapsed && y < 5) {
            siteHeader.classList.remove('header-scrolled');
            headerCollapsed = false;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Desktop Products Dropdown — Smart Positioning ----
  const dropdownTrigger = document.querySelector('.services-trigger');
  const dropdownMenu = document.querySelector('.services-dropdown');

  if (dropdownTrigger && dropdownMenu) {
    function positionDropdown() {
      const triggerRect = dropdownTrigger.getBoundingClientRect();
      const menuWidth = Math.min(600, window.innerWidth - 32); // matches w-[600px] / max-w
      const viewportWidth = window.innerWidth;
      const margin = 16;

      // Ideal: center dropdown over trigger
      const ideal = triggerRect.left + triggerRect.width / 2 - menuWidth / 2;
      // Clamp so dropdown stays within viewport
      const clamped = Math.max(margin, Math.min(ideal, viewportWidth - menuWidth - margin));
      // Convert viewport-relative to trigger-relative (absolute is relative to .services-trigger)
      const offsetFromTrigger = clamped - triggerRect.left;

      dropdownMenu.style.left = offsetFromTrigger + 'px';
    }

    dropdownTrigger.addEventListener('mouseenter', positionDropdown);
    window.addEventListener('resize', positionDropdown, { passive: true });
    positionDropdown(); // initial position
  }

  // ---- Footer Accordion (mobile) ----
  document.querySelectorAll('.footer-accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const icon = btn.querySelector('.footer-accordion-icon');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all other panels
      document.querySelectorAll('.footer-accordion-trigger').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = '0';
          other.querySelector('.footer-accordion-icon').style.transform = 'rotate(0deg)';
        }
      });

      // Toggle this panel
      btn.setAttribute('aria-expanded', !isOpen);
      panel.style.maxHeight = isOpen ? '0' : panel.scrollHeight + 'px';
      icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });

  // ---- Current Year ----
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
