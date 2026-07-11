// =====================================================
// AGROSERVICES — MAIN JS
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMobileNav = () => {
    navLinks.classList.remove('open');
    const icon = navToggle.querySelector('i');
    icon.classList.remove('bi-x-lg');
    icon.classList.add('bi-list');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      const icon = navToggle.querySelector('i');
      icon.classList.toggle('bi-list', !isOpen);
      icon.classList.toggle('bi-x-lg', isOpen);
    });

    // Close the whole mobile menu only when a real destination link is
    // clicked — not when a dropdown toggle button is clicked (that should
    // just expand/collapse its submenu instead).
    navLinks.querySelectorAll('a.nav-link, .dropdown-item').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Generic dropdown handling (About Us, Resources) ---------- */
  const allDropdownToggles = Array.from(document.querySelectorAll('.dropdown-toggle'));

  const closeAllDropdowns = (except) => {
    allDropdownToggles.forEach((toggle) => {
      if (toggle === except) return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('open');
      const menu = toggle.nextElementSibling;
      if (menu) menu.classList.remove('open');
    });
  };

  allDropdownToggles.forEach((toggle) => {
    const menu = toggle.nextElementSibling;
    if (!menu) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      closeAllDropdowns(toggle);
    });
  });

  document.addEventListener('click', (e) => {
    const clickedInsideAnyMenu = allDropdownToggles.some((toggle) => {
      const menu = toggle.nextElementSibling;
      return toggle.contains(e.target) || (menu && menu.contains(e.target));
    });
    if (!clickedInsideAnyMenu) closeAllDropdowns();
  });

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
 /* =====================================================
     LOGIN PAGE INTERACTIVITY
  ===================================================== */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const emailField = document.getElementById('emailField');
    const emailInput = document.getElementById('email');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const capsWarning = document.getElementById('capsWarning');
    const loginBtn = document.getElementById('loginBtn');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ---- Live email validation ----
    const validateEmail = () => {
      const value = emailInput.value.trim();
      if (value === '') {
        emailField.classList.remove('is-valid', 'is-invalid');
        return false;
      }
      const valid = emailPattern.test(value);
      emailField.classList.toggle('is-valid', valid);
      emailField.classList.toggle('is-invalid', !valid);
      return valid;
    };

    // ---- Live password validation (min 8 characters) ----
    const passwordPattern = /^.{8,}$/;
    const validatePassword = () => {
      const value = passwordInput.value;
      if (value === '') {
        passwordField.classList.remove('is-valid', 'is-invalid');
        return false;
      }
      const valid = passwordPattern.test(value);
      passwordField.classList.toggle('is-valid', valid);
      passwordField.classList.toggle('is-invalid', !valid);
      return valid;
    };

    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);

    passwordInput.addEventListener('input', validatePassword);
    passwordInput.addEventListener('blur', validatePassword);

    // ---- Show / hide password ----
    togglePassword.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePassword.innerHTML = isHidden
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
      togglePassword.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });

    // ---- Caps Lock detection ----
    passwordInput.addEventListener('keyup', (e) => {
      if (typeof e.getModifierState === 'function') {
        const isCaps = e.getModifierState('CapsLock');
        capsWarning.classList.toggle('show', isCaps);
      }
    });
    passwordInput.addEventListener('blur', () => {
      capsWarning.classList.remove('show');
    });

    // ---- Submit handling ----
    loginForm.addEventListener('submit', (e) => {
      const emailValid = validateEmail();
      const passwordValid = validatePassword();

      if (!emailInput.value.trim()) {
        emailField.classList.add('is-invalid');
      }
      if (!passwordInput.value) {
        passwordField.classList.add('is-invalid');
      }

      if (!emailValid || !passwordValid) {
        e.preventDefault();
        return;
      }

      // Simulate a brief loading state before the real form submit completes
      loginBtn.classList.add('is-loading');
      loginBtn.disabled = true;
    });
  }
 // end DOMContentLoaded

     /* =====================================================
     REGISTRATION MULTI-STEP FORM WITH VALIDATION
  ===================================================== */
  const registrationPage = document.querySelector('.registration-page');
  if (registrationPage) {
    let currentStep = 1;

    const updateProgress = () => {
      const progressContainer = document.getElementById('stepProgress');
      if (!progressContainer) return;
      progressContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const dot = document.createElement('span');
        dot.textContent = i;
        if (i < currentStep) dot.classList.add('completed');
        if (i === currentStep) dot.classList.add('active');
        progressContainer.appendChild(dot);
      }
    };

    const validateStep = (step) => {
      const currentCard = document.getElementById(`step-${step}`);
      if (!currentCard) return true;

      const requiredFields = currentCard.querySelectorAll('input[required], select[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        const formField = field.closest('.form-field');
        if (!field.value.trim()) {
          isValid = false;
          if (formField) {
            formField.classList.add('is-invalid');
          }
        } else {
          if (formField) formField.classList.remove('is-invalid');
        }
      });

      if (!isValid) {
        alert("Please fill in all required fields before continuing.");
      }
      return isValid;
    };

    window.showStep = (step) => {
      document.querySelectorAll('.step-card').forEach(card => card.style.display = 'none');
      const target = document.getElementById(`step-${step}`);
      if (target) target.style.display = 'block';
      currentStep = step;
      updateProgress();
    };

    window.nextStep = (from) => {
      if (!validateStep(from)) return;

      if (from === 5) {
        submitRegistration();
        return;
      }
      showStep(from + 1);
    };

    window.prevStep = (from) => {
      showStep(from - 1);
    };

    // Remove invalid class when user starts typing
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[required], select[required]')) {
        const formField = e.target.closest('.form-field');
        if (formField) formField.classList.remove('is-invalid');
      }
    });

    window.selectPlan = (index) => {
      document.querySelectorAll('.plan-option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
      });
    };

    window.selectPayment = (index) => {
      document.querySelectorAll('.payment-method').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
      });
    };

    // Upload handler
    const uploadArea = document.getElementById('uploadArea');
    const proofInput = document.getElementById('proofUpload');
    if (uploadArea && proofInput) {
      uploadArea.addEventListener('click', () => proofInput.click());
      proofInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          document.getElementById('uploadedFile').style.display = 'block';
          document.getElementById('fileName').textContent = e.target.files[0].name;
        }
      });
    };

    window.submitRegistration = () => {
      const stepsContainer = document.getElementById('registrationSteps');
      const successScreen = document.getElementById('successScreen');
      if (stepsContainer && successScreen) {
        stepsContainer.style.display = 'none';
        successScreen.style.display = 'block';
      }
      console.log('✅ Registration submitted successfully');
    };

    // Initialize
    updateProgress();
    showStep(1);
  }
  /* =====================================================
     JOB OPPORTUNITIES PAGE — LIVE SEARCH & FILTER
  ===================================================== */
  const jobsList = document.getElementById('jobsList');
  if (jobsList) {
    const searchInput = document.getElementById('jobSearch');
    const locationFilter = document.getElementById('jobLocationFilter');
    const typeFilter = document.getElementById('jobTypeFilter');
    const jobCards = Array.from(jobsList.querySelectorAll('.job-card'));
    const emptyState = document.getElementById('jobsEmpty');
    const clearBtn = document.getElementById('clearJobFilters');

    const applyJobFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      const location = locationFilter.value;
      const type = typeFilter.value;

      let visibleCount = 0;

      jobCards.forEach((card) => {
        const title = card.dataset.title.toLowerCase();
        const cardLocation = card.dataset.location;
        const cardType = card.dataset.type;

        const matchesQuery = query === '' || title.includes(query);
        const matchesLocation = location === 'all' || cardLocation === location;
        const matchesType = type === 'all' || cardType === type;

        const isMatch = matchesQuery && matchesLocation && matchesType;
        card.classList.toggle('is-hidden', !isMatch);
        if (isMatch) visibleCount += 1;
      });

      emptyState.classList.toggle('show', visibleCount === 0);
    };

    searchInput.addEventListener('input', applyJobFilters);
    locationFilter.addEventListener('change', applyJobFilters);
    typeFilter.addEventListener('change', applyJobFilters);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        locationFilter.value = 'all';
        typeFilter.value = 'all';
        applyJobFilters();
        searchInput.focus();
      });
    }
  } // end DOMContentLoaded
