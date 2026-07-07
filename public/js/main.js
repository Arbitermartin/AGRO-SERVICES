// =====================================================
// AGROSERVICES — MAIN JS
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = navToggle.querySelector('i');
      if (navLinks.classList.contains('open')) {
        icon.classList.remove('bi-list');
        icon.classList.add('bi-x-lg');
      } else {
        icon.classList.remove('bi-x-lg');
        icon.classList.add('bi-list');
      }
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('bi-x-lg');
        icon.classList.add('bi-list');
      });
    });
  }

  /* ---------- Sticky navbar shadow on scroll ---------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
      } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
      }
    });
  }

  /* ---------- Footer current year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
