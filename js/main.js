/* ========================================
   Western PA Supply Co — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

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

  // ---- Scroll Animations (IntersectionObserver) ----
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 200px 0px'
    });

    animatedElements.forEach(el => {
      observer.observe(el);
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
        alert('Something went wrong. Please call us directly at (412) 760-4621.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ---- Sticky Header — collapse top bar + add shadow on scroll ----
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        siteHeader.classList.add('header-scrolled');
      } else {
        siteHeader.classList.remove('header-scrolled');
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

  // ---- Current Year ----
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
