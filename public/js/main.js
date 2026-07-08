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
     REGISTRATION MULTI-STEP FORM
  ===================================================== */
  const registrationPage = document.querySelector('.registration-page');
  if (registrationPage) {
    let currentStep = 1;
    let selectedPlan = 1; // 0=Basic, 1=Standard, 2=Premium

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

    window.showStep = (step) => {
      document.querySelectorAll('.step-card').forEach(card => card.style.display = 'none');
      const target = document.getElementById(`step-${step}`);
      if (target) target.style.display = 'block';
      currentStep = step;
      updateProgress();
    };

    window.nextStep = (from) => {
      if (from === 5) {
        submitRegistration();
        return;
      }
      showStep(from + 1);
    };

    window.prevStep = (from) => {
      showStep(from - 1);
    };

    window.selectPlan = (index) => {
      selectedPlan = index;
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
    }

    window.submitRegistration = () => {
      const stepsContainer = document.getElementById('registrationSteps');
      const successScreen = document.getElementById('successScreen');
      if (stepsContainer && successScreen) {
        stepsContainer.style.display = 'none';
        successScreen.style.display = 'block';
      }
      console.log('✅ Registration data submitted successfully');
    };

    // Initialize registration
    updateProgress();
    showStep(1);
  }

