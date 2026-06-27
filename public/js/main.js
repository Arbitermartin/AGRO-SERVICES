/* ============================================================
   main.js — Youth Agro-Services Network
   ============================================================ */

   document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       1. SCROLL-IN ANIMATION FOR PAGE CARDS
          Uses IntersectionObserver to fade+slide cards into view
       ---------------------------------------------------------- */
    const cards = document.querySelectorAll('.page-card');
  
    if ('IntersectionObserver' in window) {
      const cardObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, idx) {
            if (entry.isIntersecting) {
              // Stagger each card by 80ms
              const delay = Array.from(cards).indexOf(entry.target) * 80;
              setTimeout(function () {
                entry.target.classList.add('visible');
              }, delay);
              cardObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
  
      cards.forEach(function (card) {
        cardObserver.observe(card);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      cards.forEach(function (card) {
        card.classList.add('visible');
      });
    }
  
  
    /* ----------------------------------------------------------
       2. STICKY NAVBAR SHADOW ON SCROLL
       ---------------------------------------------------------- */
    const navbar = document.querySelector('.navbar');
  
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.classList.add('shadow');
      } else {
        navbar.classList.remove('shadow');
      }
    });
  
  
    /* ----------------------------------------------------------
       3. SMOOTH ACTIVE LINK HIGHLIGHT ON CLICK
       ---------------------------------------------------------- */
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        // Remove active from all
        navLinks.forEach(function (l) {
          l.classList.remove('nav-btn-active');
        });
        // Add to clicked
        this.classList.add('nav-btn-active');
      });
    });
  
  
    /* ----------------------------------------------------------
       4. AUTO-CLOSE MOBILE NAV ON LINK CLICK
       ---------------------------------------------------------- */
    const navCollapse = document.getElementById('mainNav');
  
    if (navCollapse) {
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          // Only collapse if the toggler is visible (mobile)
          const toggler = document.querySelector('.navbar-toggler');
          if (toggler && getComputedStyle(toggler).display !== 'none') {
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        });
      });
    }
  
  
    /* ----------------------------------------------------------
       5. BUTTON RIPPLE EFFECT
          Adds a ripple on any .btn click
       ---------------------------------------------------------- */
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
  
        const rect = btn.getBoundingClientRect();
        circle.style.cssText = [
          'position: absolute',
          'border-radius: 50%',
          'background: rgba(255,255,255,0.3)',
          'pointer-events: none',
          'transform: scale(0)',
          'animation: ripple 0.5s linear',
          'width: ' + diameter + 'px',
          'height: ' + diameter + 'px',
          'left: ' + (e.clientX - rect.left - radius) + 'px',
          'top: ' + (e.clientY - rect.top - radius) + 'px',
        ].join(';');
  
        // Inject keyframes once
        if (!document.getElementById('ripple-style')) {
          const style = document.createElement('style');
          style.id = 'ripple-style';
          style.textContent = '@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }';
          document.head.appendChild(style);
        }
  
        // Ensure btn has relative positioning
        const pos = getComputedStyle(btn).position;
        if (pos === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
  
        btn.appendChild(circle);
        setTimeout(function () { circle.remove(); }, 500);
      });
    });
  
  
    /* ----------------------------------------------------------
       6. LEARN MORE LINK HOVER ARROW NUDGE
          Already handled in CSS via gap transition;
          JS adds aria-label for accessibility
       ---------------------------------------------------------- */
    document.querySelectorAll('.page-card__link').forEach(function (link) {
      const cardTitle = link.closest('.page-card').querySelector('.page-card__title');
      if (cardTitle) {
        link.setAttribute('aria-label', 'Learn more about ' + cardTitle.textContent.trim());
      }
    });
  
  });
  