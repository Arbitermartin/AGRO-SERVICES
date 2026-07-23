// // =====================================================
// // AGROSERVICES — MAIN JS
// // =====================================================

// document.addEventListener('DOMContentLoaded', () => {

//   /* ---------- Mobile nav toggle ---------- */
//   const navToggle = document.getElementById('navToggle');
//   const navLinks = document.getElementById('navLinks');

//   const closeMobileNav = () => {
//     navLinks.classList.remove('open');
//     const icon = navToggle.querySelector('i');
//     icon.classList.remove('bi-x-lg');
//     icon.classList.add('bi-list');
//   };

//   if (navToggle && navLinks) {
//     navToggle.addEventListener('click', () => {
//       const isOpen = navLinks.classList.toggle('open');
//       const icon = navToggle.querySelector('i');
//       icon.classList.toggle('bi-list', !isOpen);
//       icon.classList.toggle('bi-x-lg', isOpen);
//     });

//     navLinks.querySelectorAll('a.nav-link, .dropdown-item').forEach((link) => {
//       link.addEventListener('click', closeMobileNav);
//     });
//   }

//   /* ---------- Generic dropdown handling (About Us, Resources) ---------- */
//   const allDropdownToggles = Array.from(document.querySelectorAll('.dropdown-toggle'));

//   const closeAllDropdowns = (except) => {
//     allDropdownToggles.forEach((toggle) => {
//       if (toggle === except) return;
//       toggle.setAttribute('aria-expanded', 'false');
//       toggle.classList.remove('open');
//       const menu = toggle.nextElementSibling;
//       if (menu) menu.classList.remove('open');
//     });
//   };

//   allDropdownToggles.forEach((toggle) => {
//     const menu = toggle.nextElementSibling;
//     if (!menu) return;

//     toggle.addEventListener('click', (e) => {
//       e.stopPropagation();
//       const isOpen = menu.classList.toggle('open');
//       toggle.classList.toggle('open', isOpen);
//       toggle.setAttribute('aria-expanded', isOpen);
//       closeAllDropdowns(toggle);
//     });
//   });

//   document.addEventListener('click', (e) => {
//     const clickedInsideAnyMenu = allDropdownToggles.some((toggle) => {
//       const menu = toggle.nextElementSibling;
//       return toggle.contains(e.target) || (menu && menu.contains(e.target));
//     });
//     if (!clickedInsideAnyMenu) closeAllDropdowns();
//   });

//   /* ---------- Sticky navbar shadow on scroll ---------- */
//   const navbar = document.getElementById('navbar');
//   if (navbar) {
//     window.addEventListener('scroll', () => {
//       if (window.scrollY > 10) {
//         navbar.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
//       } else {
//         navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
//       }
//     });
//   }

//   /* ---------- Footer current year ---------- */
//   const yearEl = document.getElementById('year');
//   if (yearEl) {
//     yearEl.textContent = new Date().getFullYear();
//   }

//   /* =====================================================
//      LOGIN PAGE INTERACTIVITY
//   ===================================================== */
//   const loginForm = document.getElementById('loginForm');
//   if (loginForm) {
//     const emailField = document.getElementById('emailField');
//     const emailInput = document.getElementById('email');
//     const passwordField = document.getElementById('passwordField');
//     const passwordInput = document.getElementById('password');
//     const togglePassword = document.getElementById('togglePassword');
//     const capsWarning = document.getElementById('capsWarning');
//     const loginBtn = document.getElementById('loginBtn');

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     const validateEmail = () => {
//       const value = emailInput.value.trim();
//       if (value === '') {
//         emailField.classList.remove('is-valid', 'is-invalid');
//         return false;
//       }
//       const valid = emailPattern.test(value);
//       emailField.classList.toggle('is-valid', valid);
//       emailField.classList.toggle('is-invalid', !valid);
//       return valid;
//     };

//     const passwordPattern = /^.{8,}$/;
//     const validatePassword = () => {
//       const value = passwordInput.value;
//       if (value === '') {
//         passwordField.classList.remove('is-valid', 'is-invalid');
//         return false;
//       }
//       const valid = passwordPattern.test(value);
//       passwordField.classList.toggle('is-valid', valid);
//       passwordField.classList.toggle('is-invalid', !valid);
//       return valid;
//     };

//     emailInput.addEventListener('input', validateEmail);
//     emailInput.addEventListener('blur', validateEmail);

//     passwordInput.addEventListener('input', validatePassword);
//     passwordInput.addEventListener('blur', validatePassword);

//     togglePassword.addEventListener('click', () => {
//       const isHidden = passwordInput.type === 'password';
//       passwordInput.type = isHidden ? 'text' : 'password';
//       togglePassword.innerHTML = isHidden
//         ? '<i class="bi bi-eye-slash"></i>'
//         : '<i class="bi bi-eye"></i>';
//       togglePassword.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
//     });

//     passwordInput.addEventListener('keyup', (e) => {
//       if (typeof e.getModifierState === 'function') {
//         const isCaps = e.getModifierState('CapsLock');
//         capsWarning.classList.toggle('show', isCaps);
//       }
//     });
//     passwordInput.addEventListener('blur', () => {
//       capsWarning.classList.remove('show');
//     });

//     loginForm.addEventListener('submit', (e) => {
//       const emailValid = validateEmail();
//       const passwordValid = validatePassword();

//       if (!emailInput.value.trim()) {
//         emailField.classList.add('is-invalid');
//       }
//       if (!passwordInput.value) {
//         passwordField.classList.add('is-invalid');
//       }

//       if (!emailValid || !passwordValid) {
//         e.preventDefault();
//         return;
//       }

//       loginBtn.classList.add('is-loading');
//       loginBtn.disabled = true;
//     });
//   }

//   /* =====================================================
//      REGISTRATION MULTI-STEP FORM WITH VALIDATION
//   ===================================================== */
//   const registrationPage = document.querySelector('.registration-page');
//   if (registrationPage) {
//     let currentStep = 1;

//     const updateProgress = () => {
//       const progressContainer = document.getElementById('stepProgress');
//       if (!progressContainer) return;
//       progressContainer.innerHTML = '';
//       for (let i = 1; i <= 5; i++) {
//         const dot = document.createElement('span');
//         dot.textContent = i;
//         if (i < currentStep) dot.classList.add('completed');
//         if (i === currentStep) dot.classList.add('active');
//         progressContainer.appendChild(dot);
//       }
//     };

//     const checkPasswordsMatch = () => {
//       const passwordEl = document.getElementById('password');
//       const confirmEl = document.getElementById('confirmPassword');
//       const errorEl = document.getElementById('passwordMatchError');
//       if (!passwordEl || !confirmEl) return true;

//       const confirmFormField = confirmEl.closest('.form-field');

//       if (passwordEl.value !== confirmEl.value) {
//         if (errorEl) errorEl.textContent = 'Passwords do not match.';
//         if (confirmFormField) confirmFormField.classList.add('is-invalid');
//         return false;
//       }

//       if (errorEl) errorEl.textContent = '';
//       if (confirmFormField) confirmFormField.classList.remove('is-invalid');
//       return true;
//     };

//     const validateStep = (step) => {
//       const currentCard = document.getElementById(`step-${step}`);
//       if (!currentCard) return true;

//       const requiredFields = currentCard.querySelectorAll('input[required], select[required]');
//       let isValid = true;

//       requiredFields.forEach(field => {
//         const formField = field.closest('.form-field');
//         if (!field.value.trim()) {
//           isValid = false;
//           if (formField) {
//             formField.classList.add('is-invalid');
//           }
//         } else {
//           if (formField) formField.classList.remove('is-invalid');
//         }
//       });

//       if (step === 1 && !checkPasswordsMatch()) {
//         isValid = false;
//       }

//       if (!isValid) {
//         alert("Please fill in all required fields correctly before continuing.");
//       }
//       return isValid;
//     };

//     window.showStep = (step) => {
//       document.querySelectorAll('.step-card').forEach(card => card.style.display = 'none');
//       const target = document.getElementById(`step-${step}`);
//       if (target) target.style.display = 'block';
//       currentStep = step;
//       updateProgress();
//     };

//     window.nextStep = (from) => {
//       if (!validateStep(from)) return;

//       if (from === 5) {
//         submitRegistration();
//         return;
//       }
//       showStep(from + 1);
//     };

//     window.prevStep = (from) => {
//       showStep(from - 1);
//     };

//     document.addEventListener('input', (e) => {
//       if (e.target.matches('input[required], select[required]')) {
//         const formField = e.target.closest('.form-field');
//         if (formField) formField.classList.remove('is-invalid');
//       }
//     });

//     const passwordEl = document.getElementById('password');
//     const confirmPasswordEl = document.getElementById('confirmPassword');
//     if (passwordEl && confirmPasswordEl) {
//       passwordEl.addEventListener('input', checkPasswordsMatch);
//       confirmPasswordEl.addEventListener('input', checkPasswordsMatch);
//     }

//     window.selectPlan = (index) => {
//       document.querySelectorAll('.plan-option').forEach((el, i) => {
//         el.classList.toggle('selected', i === index);
//       });
//     };

//     window.selectPayment = (index) => {
//       document.querySelectorAll('.payment-method').forEach((el, i) => {
//         el.classList.toggle('selected', i === index);
//       });
//     };

//     const uploadArea = document.getElementById('uploadArea');
//     const proofInput = document.getElementById('proofUpload');
//     if (uploadArea && proofInput) {
//       uploadArea.addEventListener('click', () => proofInput.click());
//       proofInput.addEventListener('change', (e) => {
//         if (e.target.files.length > 0) {
//           document.getElementById('uploadedFile').style.display = 'block';
//           document.getElementById('fileName').textContent = e.target.files[0].name;
//         }
//       });
//     }

//     window.submitRegistration = () => {
//       const stepsContainer = document.getElementById('registrationSteps');
//       const successScreen = document.getElementById('successScreen');
//       if (stepsContainer && successScreen) {
//         stepsContainer.style.display = 'none';
//         successScreen.style.display = 'block';
//       }
//       console.log('✅ Registration submitted successfully');
//     };

//     updateProgress();
//     showStep(1);
//   }

//   /* =====================================================
//      JOB OPPORTUNITIES PAGE — LIVE SEARCH & FILTER
//   ===================================================== */
//   const jobsList = document.getElementById('jobsList');
//   if (jobsList) {
//     const searchInput = document.getElementById('jobSearch');
//     const locationFilter = document.getElementById('jobLocationFilter');
//     const typeFilter = document.getElementById('jobTypeFilter');
//     const jobCards = Array.from(jobsList.querySelectorAll('.job-card'));
//     const emptyState = document.getElementById('jobsEmpty');
//     const clearBtn = document.getElementById('clearJobFilters');

//     const applyJobFilters = () => {
//       const query = searchInput.value.trim().toLowerCase();
//       const location = locationFilter.value;
//       const type = typeFilter.value;

//       let visibleCount = 0;

//       jobCards.forEach((card) => {
//         const title = card.dataset.title.toLowerCase();
//         const cardLocation = card.dataset.location;
//         const cardType = card.dataset.type;

//         const matchesQuery = query === '' || title.includes(query);
//         const matchesLocation = location === 'all' || cardLocation === location;
//         const matchesType = type === 'all' || cardType === type;

//         const isMatch = matchesQuery && matchesLocation && matchesType;
//         card.classList.toggle('is-hidden', !isMatch);
//         if (isMatch) visibleCount += 1;
//       });

//       emptyState.classList.toggle('show', visibleCount === 0);
//     };

//     searchInput.addEventListener('input', applyJobFilters);
//     locationFilter.addEventListener('change', applyJobFilters);
//     typeFilter.addEventListener('change', applyJobFilters);

//     if (clearBtn) {
//       clearBtn.addEventListener('click', () => {
//         searchInput.value = '';
//         locationFilter.value = 'all';
//         typeFilter.value = 'all';
//         applyJobFilters();
//         searchInput.focus();
//       });
//     }
//   }

//   /* =====================================================
//      GUIDANCE & TRAINING PAGE — CATEGORY FILTER
//   ===================================================== */
//   const trainingGrid = document.getElementById('trainingGrid');
//   if (trainingGrid) {
//     const filterPills = Array.from(document.querySelectorAll('.training-pill'));
//     const trainingCards = Array.from(trainingGrid.querySelectorAll('.training-card'));
//     const trainingEmpty = document.getElementById('trainingEmpty');

//     const applyTrainingFilter = (category) => {
//       let visibleCount = 0;

//       trainingCards.forEach((card) => {
//         const isMatch = category === 'all' || card.dataset.category === category;
//         card.classList.toggle('is-hidden', !isMatch);
//         if (isMatch) visibleCount += 1;
//       });

//       trainingEmpty.classList.toggle('show', visibleCount === 0);
//     };

//     filterPills.forEach((pill) => {
//       pill.addEventListener('click', () => {
//         filterPills.forEach((p) => p.classList.remove('is-active'));
//         pill.classList.add('is-active');
//         applyTrainingFilter(pill.dataset.filter);
//       });
//     });
//   }

//   /* =====================================================
//      HOMEPAGE FAQ ACCORDION
//   ===================================================== */
//   const faqHomeList = document.getElementById('faqHomeList');
//   if (faqHomeList) {
//     const faqItems = Array.from(faqHomeList.querySelectorAll('.faq-home-item'));

//     faqItems.forEach((item) => {
//       const question = item.querySelector('.faq-home-question');
//       const icon = item.querySelector('.faq-home-icon i');

//       question.addEventListener('click', () => {
//         const isCurrentlyOpen = item.classList.contains('is-open');

//         faqItems.forEach((other) => {
//           other.classList.remove('is-open');
//           other.querySelector('.faq-home-question').setAttribute('aria-expanded', 'false');
//           const otherIcon = other.querySelector('.faq-home-icon i');
//           otherIcon.classList.remove('bi-dash');
//           otherIcon.classList.add('bi-plus');
//         });

//         if (!isCurrentlyOpen) {
//           item.classList.add('is-open');
//           question.setAttribute('aria-expanded', 'true');
//           icon.classList.remove('bi-plus');
//           icon.classList.add('bi-dash');
//         }
//       });
//     });
//   }

//   /* =====================================================
//      ADMIN DASHBOARD
//   ===================================================== */
//   const dbSidebar = document.getElementById('dbSidebar');
//   if (dbSidebar) {

//     /* ---------- Sidebar submenu accordions (Members, Events, Jobs, etc.) ---------- */
//     const dbNavToggles = Array.from(document.querySelectorAll('.db-nav-toggle'));

//     dbNavToggles.forEach((toggle) => {
//       toggle.addEventListener('click', () => {
//         const isOpen = toggle.getAttribute('aria-expanded') === 'true';

//         dbNavToggles.forEach((other) => {
//           if (other !== toggle) other.setAttribute('aria-expanded', 'false');
//         });

//         toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
//       });
//     });

//     /* ---------- Mobile sidebar toggle ---------- */
//     const dbSidebarToggle = document.getElementById('dbSidebarToggle');
//     if (dbSidebarToggle) {
//       dbSidebarToggle.addEventListener('click', () => {
//         dbSidebar.classList.toggle('open');
//       });

//       document.addEventListener('click', (e) => {
//         const clickedInsideSidebar = dbSidebar.contains(e.target);
//         const clickedToggleBtn = dbSidebarToggle.contains(e.target);
//         if (!clickedInsideSidebar && !clickedToggleBtn) {
//           dbSidebar.classList.remove('open');
//         }
//       });
//     }

//     /* ---------- User dropdown (Update Profile / Change Password / Logout) ---------- */
//     const dbUserToggle = document.getElementById('dbUserToggle');
//     const dbUserDropdown = document.getElementById('dbUserDropdown');

//     if (dbUserToggle && dbUserDropdown) {
//       dbUserToggle.addEventListener('click', (e) => {
//         e.stopPropagation();
//         const isOpen = dbUserDropdown.classList.toggle('open');
//         dbUserToggle.setAttribute('aria-expanded', isOpen);
//       });

//       document.addEventListener('click', (e) => {
//         if (!dbUserDropdown.contains(e.target) && e.target !== dbUserToggle) {
//           dbUserDropdown.classList.remove('open');
//           dbUserToggle.setAttribute('aria-expanded', 'false');
//         }
//       });
//     }

//     /* ---------- Change Password panel toggle ---------- */
//     const changePasswordLink = document.getElementById('changePasswordLink');
//     const changePasswordPanel = document.getElementById('changePasswordPanel');
//     const dbMainContent = document.getElementById('dbMainContent');
//     const cancelChangePassword = document.getElementById('cancelChangePassword');

//     if (changePasswordLink && changePasswordPanel && dbMainContent) {
//       changePasswordLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         dbMainContent.style.display = 'none';
//         changePasswordPanel.style.display = 'block';
//         if (dbUserDropdown) {
//           dbUserDropdown.classList.remove('open');
//           if (dbUserToggle) dbUserToggle.setAttribute('aria-expanded', 'false');
//         }
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//       });
//     }

//     if (cancelChangePassword && changePasswordPanel && dbMainContent) {
//       cancelChangePassword.addEventListener('click', (e) => {
//         e.preventDefault();
//         changePasswordPanel.style.display = 'none';
//         dbMainContent.style.display = 'block';
//       });
//     }

//     /* ---------- Change Password form validation + show/hide password ---------- */
//     const changePasswordForm = document.getElementById('changePasswordForm');
//     if (changePasswordForm) {
//       const newPasswordEl = document.getElementById('newPassword');
//       const confirmNewPasswordEl = document.getElementById('confirmNewPassword');
//       const matchErrorEl = document.getElementById('newPasswordMatchError');

//       const checkNewPasswordsMatch = () => {
//         if (!newPasswordEl || !confirmNewPasswordEl || !matchErrorEl) return true;
//         if (newPasswordEl.value !== confirmNewPasswordEl.value) {
//           matchErrorEl.textContent = 'Passwords do not match.';
//           return false;
//         }
//         matchErrorEl.textContent = '';
//         return true;
//       };

//       if (newPasswordEl) newPasswordEl.addEventListener('input', checkNewPasswordsMatch);
//       if (confirmNewPasswordEl) confirmNewPasswordEl.addEventListener('input', checkNewPasswordsMatch);

//       changePasswordForm.addEventListener('submit', (e) => {
//         if (!checkNewPasswordsMatch()) {
//           e.preventDefault();
//         }
//       });

//       document.querySelectorAll('.toggle-visibility').forEach((icon) => {
//         icon.addEventListener('click', () => {
//           const input = document.getElementById(icon.getAttribute('data-target'));
//           if (!input) return;
//           const isHidden = input.type === 'password';
//           input.type = isHidden ? 'text' : 'password';
//           icon.classList.toggle('bi-eye', !isHidden);
//           icon.classList.toggle('bi-eye-slash', isHidden);
//         });
//       });
//     }

//     /* ---------- If redirected back after a successful password change ---------- */
//     if (window.location.search.includes('passwordChanged=true')) {
//       if (changePasswordPanel) changePasswordPanel.style.display = 'none';
//       if (dbMainContent) dbMainContent.style.display = 'block';
//     }

//     /* ---------- Approve / Reject button feedback ---------- */
//     document.querySelectorAll('.db-btn-approve, .db-btn-reject').forEach((btn) => {
//       btn.addEventListener('click', () => {
//         const item = btn.closest('.db-approval-item');
//         if (!item) return;
//         item.style.transition = 'opacity 0.3s ease';
//         item.style.opacity = '0';
//         setTimeout(() => item.remove(), 300);
//       });
//     });

//   } // end if (dbSidebar)

// }); // end DOMContentLoaded
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

  /* =====================================================
   TOAST NOTIFICATIONS — auto-dismiss flash messages
===================================================== */
const toastContainer = document.getElementById('toastContainer');
if (toastContainer) {
  const toastItems = toastContainer.querySelectorAll('.toast-msg');

  toastItems.forEach((toast) => {
    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  });
}

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

    togglePassword.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePassword.innerHTML = isHidden
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
      togglePassword.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });

    passwordInput.addEventListener('keyup', (e) => {
      if (typeof e.getModifierState === 'function') {
        const isCaps = e.getModifierState('CapsLock');
        capsWarning.classList.toggle('show', isCaps);
      }
    });
    passwordInput.addEventListener('blur', () => {
      capsWarning.classList.remove('show');
    });

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

      loginBtn.classList.add('is-loading');
      loginBtn.disabled = true;
    });
  }

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

    const checkPasswordsMatch = () => {
      const passwordEl = document.getElementById('password');
      const confirmEl = document.getElementById('confirmPassword');
      const errorEl = document.getElementById('passwordMatchError');
      if (!passwordEl || !confirmEl) return true;

      const confirmFormField = confirmEl.closest('.form-field');

      if (passwordEl.value !== confirmEl.value) {
        if (errorEl) errorEl.textContent = 'Passwords do not match.';
        if (confirmFormField) confirmFormField.classList.add('is-invalid');
        return false;
      }

      if (errorEl) errorEl.textContent = '';
      if (confirmFormField) confirmFormField.classList.remove('is-invalid');
      return true;
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

      if (step === 1 && !checkPasswordsMatch()) {
        isValid = false;
      }

      if (!isValid) {
        alert("Please fill in all required fields correctly before continuing.");
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

    document.addEventListener('input', (e) => {
      if (e.target.matches('input[required], select[required]')) {
        const formField = e.target.closest('.form-field');
        if (formField) formField.classList.remove('is-invalid');
      }
    });

    const passwordEl = document.getElementById('password');
    const confirmPasswordEl = document.getElementById('confirmPassword');
    if (passwordEl && confirmPasswordEl) {
      passwordEl.addEventListener('input', checkPasswordsMatch);
      confirmPasswordEl.addEventListener('input', checkPasswordsMatch);
    }

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
      console.log('✅ Registration submitted successfully');
    };

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
  }

  // job application
  /* =====================================================
   JOB APPLICATION FORM — CV upload preview
===================================================== */
const cvUploadArea = document.getElementById('cvUploadArea');
const cvUploadInput = document.getElementById('cvUpload');

if (cvUploadArea && cvUploadInput) {
  cvUploadArea.addEventListener('click', () => cvUploadInput.click());
  cvUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('cvUploadedFile').style.display = 'block';
      document.getElementById('cvFileName').textContent = e.target.files[0].name;
    }
  });
}

  /* =====================================================
     GUIDANCE & TRAINING PAGE — CATEGORY FILTER
  ===================================================== */
  const trainingGrid = document.getElementById('trainingGrid');
  if (trainingGrid) {
    const filterPills = Array.from(document.querySelectorAll('.training-pill'));
    const trainingCards = Array.from(trainingGrid.querySelectorAll('.training-card'));
    const trainingEmpty = document.getElementById('trainingEmpty');

    const applyTrainingFilter = (category) => {
      let visibleCount = 0;

      trainingCards.forEach((card) => {
        const isMatch = category === 'all' || card.dataset.category === category;
        card.classList.toggle('is-hidden', !isMatch);
        if (isMatch) visibleCount += 1;
      });

      trainingEmpty.classList.toggle('show', visibleCount === 0);
    };

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        applyTrainingFilter(pill.dataset.filter);
      });
    });
  }

  /* =====================================================
     HOMEPAGE FAQ ACCORDION
  ===================================================== */
  const faqHomeList = document.getElementById('faqHomeList');
  if (faqHomeList) {
    const faqItems = Array.from(faqHomeList.querySelectorAll('.faq-home-item'));

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-home-question');
      const icon = item.querySelector('.faq-home-icon i');

      question.addEventListener('click', () => {
        const isCurrentlyOpen = item.classList.contains('is-open');

        faqItems.forEach((other) => {
          other.classList.remove('is-open');
          other.querySelector('.faq-home-question').setAttribute('aria-expanded', 'false');
          const otherIcon = other.querySelector('.faq-home-icon i');
          otherIcon.classList.remove('bi-dash');
          otherIcon.classList.add('bi-plus');
        });

        if (!isCurrentlyOpen) {
          item.classList.add('is-open');
          question.setAttribute('aria-expanded', 'true');
          icon.classList.remove('bi-plus');
          icon.classList.add('bi-dash');
        }
      });
    });
  }

  /* =====================================================
     ADMIN / ICT DASHBOARD
  ===================================================== */
  const dbSidebar = document.getElementById('dbSidebar');
  if (dbSidebar) {

    /* ---------- Sidebar submenu accordions (Members, Events, Jobs, etc.) ---------- */
    const dbNavToggles = Array.from(document.querySelectorAll('.db-nav-toggle'));

    dbNavToggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        dbNavToggles.forEach((other) => {
          if (other !== toggle) other.setAttribute('aria-expanded', 'false');
        });

        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
    });

    /* ---------- Mobile sidebar toggle ---------- */
    const dbSidebarToggle = document.getElementById('dbSidebarToggle');
    if (dbSidebarToggle) {
      dbSidebarToggle.addEventListener('click', () => {
        dbSidebar.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        const clickedInsideSidebar = dbSidebar.contains(e.target);
        const clickedToggleBtn = dbSidebarToggle.contains(e.target);
        if (!clickedInsideSidebar && !clickedToggleBtn) {
          dbSidebar.classList.remove('open');
        }
      });
    }

    /* ---------- User dropdown (Update Profile / Change Password / Logout) ---------- */
    const dbUserToggle = document.getElementById('dbUserToggle');
    const dbUserDropdown = document.getElementById('dbUserDropdown');

    if (dbUserToggle && dbUserDropdown) {
      dbUserToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dbUserDropdown.classList.toggle('open');
        dbUserToggle.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!dbUserDropdown.contains(e.target) && e.target !== dbUserToggle) {
          dbUserDropdown.classList.remove('open');
          dbUserToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  

    /* ---------- Shared reference to the main dashboard content ---------- */
    const dbMainContent = document.getElementById('dbMainContent');

    /* ---------- Change Password panel toggle ---------- */
    const changePasswordLink = document.getElementById('changePasswordLink');
    const changePasswordPanel = document.getElementById('changePasswordPanel');
    const cancelChangePassword = document.getElementById('cancelChangePassword');

    if (changePasswordLink && changePasswordPanel && dbMainContent) {
      changePasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        dbMainContent.style.display = 'none';
        changePasswordPanel.style.display = 'block';
        if (dbUserDropdown) {
          dbUserDropdown.classList.remove('open');
          if (dbUserToggle) dbUserToggle.setAttribute('aria-expanded', 'false');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (cancelChangePassword && changePasswordPanel && dbMainContent) {
      cancelChangePassword.addEventListener('click', (e) => {
        e.preventDefault();
        changePasswordPanel.style.display = 'none';
        dbMainContent.style.display = 'block';
      });
    }

    /* ---------- Change Password form validation + show/hide password ---------- */
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      const newPasswordEl = document.getElementById('newPassword');
      const confirmNewPasswordEl = document.getElementById('confirmNewPassword');
      const matchErrorEl = document.getElementById('newPasswordMatchError');

      const checkNewPasswordsMatch = () => {
        if (!newPasswordEl || !confirmNewPasswordEl || !matchErrorEl) return true;
        if (newPasswordEl.value !== confirmNewPasswordEl.value) {
          matchErrorEl.textContent = 'Passwords do not match.';
          return false;
        }
        matchErrorEl.textContent = '';
        return true;
      };

      if (newPasswordEl) newPasswordEl.addEventListener('input', checkNewPasswordsMatch);
      if (confirmNewPasswordEl) confirmNewPasswordEl.addEventListener('input', checkNewPasswordsMatch);

      changePasswordForm.addEventListener('submit', (e) => {
        if (!checkNewPasswordsMatch()) {
          e.preventDefault();
        }
      });

      document.querySelectorAll('.toggle-visibility').forEach((icon) => {
        icon.addEventListener('click', () => {
          const input = document.getElementById(icon.getAttribute('data-target'));
          if (!input) return;
          const isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          icon.classList.toggle('bi-eye', !isHidden);
          icon.classList.toggle('bi-eye-slash', isHidden);
        });
      });
    }

    /* ---------- If redirected back after a successful password change ---------- */
    if (window.location.search.includes('passwordChanged=true')) {
      if (changePasswordPanel) changePasswordPanel.style.display = 'none';
      if (dbMainContent) dbMainContent.style.display = 'block';
    }

    /* ---------- Update Profile panel toggle ---------- */
    const updateProfileLink = document.getElementById('updateProfileLink');
    const updateProfilePanel = document.getElementById('updateProfilePanel');
    const cancelUpdateProfile = document.getElementById('cancelUpdateProfile');

    if (updateProfileLink && updateProfilePanel && dbMainContent) {
      updateProfileLink.addEventListener('click', (e) => {
        e.preventDefault();
        dbMainContent.style.display = 'none';
        if (changePasswordPanel) changePasswordPanel.style.display = 'none';
        updateProfilePanel.style.display = 'block';
        if (dbUserDropdown) {
          dbUserDropdown.classList.remove('open');
          if (dbUserToggle) dbUserToggle.setAttribute('aria-expanded', 'false');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (cancelUpdateProfile && updateProfilePanel && dbMainContent) {
      cancelUpdateProfile.addEventListener('click', (e) => {
        e.preventDefault();
        updateProfilePanel.style.display = 'none';
        dbMainContent.style.display = 'block';
      });
    }

    /* ---------- Also hide updateProfilePanel when Change Password is opened ---------- */
    if (changePasswordLink && updateProfilePanel) {
      changePasswordLink.addEventListener('click', () => {
        updateProfilePanel.style.display = 'none';
      });
    }

    /* ---------- After a successful profile update, re-show main dashboard ---------- */
    if (window.location.search.includes('profileUpdated=true')) {
      if (updateProfilePanel) updateProfilePanel.style.display = 'none';
      if (dbMainContent) dbMainContent.style.display = 'block';
    }
      // job posting
      const addJobLink = document.getElementById('addJobLink');
      const addJobPanel = document.getElementById('addJobPanel');
      const cancelAddJob = document.getElementById('cancelAddJob');
      
      if (addJobLink && addJobPanel && dbMainContent) {
        addJobLink.addEventListener('click', (e) => {
          e.preventDefault();
          dbMainContent.style.display = 'none';
          if (changePasswordPanel) changePasswordPanel.style.display = 'none';
          if (updateProfilePanel) updateProfilePanel.style.display = 'none';
          if (allJobsPanel) allJobsPanel.style.display = 'none';
          addJobPanel.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      
      if (cancelAddJob && addJobPanel && dbMainContent) {
        cancelAddJob.addEventListener('click', (e) => {
          e.preventDefault();
          addJobPanel.style.display = 'none';
          dbMainContent.style.display = 'block';
        });
      }
      
      if (window.location.search.includes('jobPosted=true')) {
        if (addJobPanel) addJobPanel.style.display = 'none';
        if (dbMainContent) dbMainContent.style.display = 'block';
      }
      
      // end here job posting

      /* ---------- All Jobs panel toggle ---------- */
const allJobsLink = document.getElementById('allJobsLink');
const allJobsPanel = document.getElementById('allJobsPanel');
const cancelAllJobs = document.getElementById('cancelAllJobs');

if (allJobsLink && allJobsPanel && dbMainContent) {
  allJobsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (changePasswordPanel) changePasswordPanel.style.display = 'none';
    if (updateProfilePanel) updateProfilePanel.style.display = 'none';
    if (addJobPanel) addJobPanel.style.display = 'none';
    allJobsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (cancelAllJobs && allJobsPanel && dbMainContent) {
  cancelAllJobs.addEventListener('click', (e) => {
    e.preventDefault();
    allJobsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
/* ---------- Applications panel toggle ---------- */
const applicationsLink = document.getElementById('applicationsLink');
const applicationsPanel = document.getElementById('applicationsPanel');
const cancelApplications = document.getElementById('cancelApplications');

if (applicationsLink && applicationsPanel && dbMainContent) {
  applicationsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (changePasswordPanel) changePasswordPanel.style.display = 'none';
    if (updateProfilePanel) updateProfilePanel.style.display = 'none';
    if (addJobPanel) addJobPanel.style.display = 'none';
    if (allJobsPanel) allJobsPanel.style.display = 'none';
    applicationsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (cancelApplications && applicationsPanel && dbMainContent) {
  cancelApplications.addEventListener('click', (e) => {
    e.preventDefault();
    applicationsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

/* ---------- Expand/collapse individual application details ---------- */
document.querySelectorAll('.application-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.application-item');
    item.classList.toggle('is-open');
  });
});
/* =====================================================
   MEMBER DASHBOARD — Job Opportunities & My Applications
===================================================== */


// Job Opportunities Panel
const jobOpportunitiesLink = document.getElementById('jobOpportunitiesLink');
const jobOpportunitiesPanel = document.getElementById('jobOpportunitiesPanel');
const cancelJobOpportunities = document.getElementById('cancelJobOpportunities');

if (jobOpportunitiesLink && jobOpportunitiesPanel && dbMainContent) {
  jobOpportunitiesLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (myApplicationsPanel) myApplicationsPanel.style.display = 'none';
    jobOpportunitiesPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (cancelJobOpportunities && jobOpportunitiesPanel && dbMainContent) {
  cancelJobOpportunities.addEventListener('click', (e) => {
    e.preventDefault();
    jobOpportunitiesPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

// My Applications Panel
const myApplicationsLink = document.getElementById('myApplicationsLink');
const myApplicationsPanel = document.getElementById('myApplicationsPanel');
const cancelMyApplications = document.getElementById('cancelMyApplications');

if (myApplicationsLink && myApplicationsPanel && dbMainContent) {
  myApplicationsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (jobOpportunitiesPanel) jobOpportunitiesPanel.style.display = 'none';
    myApplicationsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (cancelMyApplications && myApplicationsPanel && dbMainContent) {
  cancelMyApplications.addEventListener('click', (e) => {
    e.preventDefault();
    myApplicationsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

// Job listing interactivity (works on both pages)
document.querySelectorAll('.job-toggle-details').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.job-listing-card');
    if (card) card.classList.toggle('is-open');
  });
});

document.querySelectorAll('.job-open-apply-form').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.job-listing-card');
    const formWrap = card ? card.querySelector('.job-apply-form-wrap') : null;
    if (formWrap) {
      const isVisible = formWrap.style.display === 'block';
      formWrap.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});

document.querySelectorAll('.job-cancel-apply').forEach((btn) => {
  btn.addEventListener('click', () => {
    const formWrap = btn.closest('.job-apply-form-wrap');
    if (formWrap) formWrap.style.display = 'none';
  });
});

// CV upload preview per job
document.querySelectorAll('.job-cv-upload-area').forEach((area) => {
  const input = area.querySelector('.job-cv-upload-input');
  const uploadedDiv = area.parentElement.querySelector('.job-cv-uploaded-file');
  const fileNameSpan = area.parentElement.querySelector('.job-cv-file-name');

  if (input && uploadedDiv && fileNameSpan) {
    area.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        uploadedDiv.style.display = 'block';
        fileNameSpan.textContent = e.target.files[0].name;
      }
    });
  }
});

// Handle redirect after successful application
if (window.location.search.includes('applicationSubmitted=true')) {
  if (jobOpportunitiesPanel) jobOpportunitiesPanel.style.display = 'none';
  if (dbMainContent) dbMainContent.style.display = 'block';
}
/* ---------- Add News panel toggle ---------- */
const addNewsLink = document.getElementById('addNewsLink');
const addNewsPanel = document.getElementById('addNewsPanel');
const cancelAddNews = document.getElementById('cancelAddNews');

if (addNewsLink && addNewsPanel && dbMainContent) {
  addNewsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (addEventPanel) addEventPanel.style.display = 'none';
    addNewsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAddNews && addNewsPanel && dbMainContent) {
  cancelAddNews.addEventListener('click', (e) => {
    e.preventDefault();
    addNewsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

/* ---------- Add Event panel toggle ---------- */
const addEventLink = document.getElementById('addEventLink');
const addEventPanel = document.getElementById('addEventPanel');
const cancelAddEvent = document.getElementById('cancelAddEvent');

if (addEventLink && addEventPanel && dbMainContent) {
  addEventLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    if (addNewsPanel) addNewsPanel.style.display = 'none';
    addEventPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAddEvent && addEventPanel && dbMainContent) {
  cancelAddEvent.addEventListener('click', (e) => {
    e.preventDefault();
    addEventPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

/* ---------- News image upload preview ---------- */
const newsImageUploadArea = document.getElementById('newsImageUploadArea');
const newsImageUploadInput = document.getElementById('newsImageUpload');
if (newsImageUploadArea && newsImageUploadInput) {
  newsImageUploadArea.addEventListener('click', () => newsImageUploadInput.click());
  newsImageUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('newsImageUploadedFile').style.display = 'block';
      document.getElementById('newsImageFileName').textContent = e.target.files[0].name;
    }
  });
}

/* ---------- All News panel toggle ---------- */
const allNewsLink = document.getElementById('allNewsLink');
const allNewsPanel = document.getElementById('allNewsPanel');
const cancelAllNews = document.getElementById('cancelAllNews');

if (allNewsLink && allNewsPanel && dbMainContent) {
  allNewsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    allNewsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAllNews && allNewsPanel && dbMainContent) {
  cancelAllNews.addEventListener('click', (e) => {
    e.preventDefault();
    allNewsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

/* ---------- All Events panel toggle ---------- */
const allEventsLink = document.getElementById('allEventsLink');
const allEventsPanel = document.getElementById('allEventsPanel');
const cancelAllEvents = document.getElementById('cancelAllEvents');

if (allEventsLink && allEventsPanel && dbMainContent) {
  allEventsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    allEventsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAllEvents && allEventsPanel && dbMainContent) {
  cancelAllEvents.addEventListener('click', (e) => {
    e.preventDefault();
    allEventsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

/* ---------- Edit form toggle (news + events) ---------- */
document.querySelectorAll('.manage-edit-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.manage-item');
    const form = item.querySelector('.manage-edit-form');
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
  });
});

const trackLoginsLink = document.getElementById('trackLoginsLink');
const trackLoginsPanel = document.getElementById('trackLoginsPanel');
const cancelTrackLogins = document.getElementById('cancelTrackLogins');

if (trackLoginsLink && trackLoginsPanel && dbMainContent) {
  trackLoginsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    trackLoginsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelTrackLogins && trackLoginsPanel && dbMainContent) {
  cancelTrackLogins.addEventListener('click', (e) => {
    e.preventDefault();
    trackLoginsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
    /* ---------- Approve / Reject button feedback ---------- */
    document.querySelectorAll('.db-btn-approve, .db-btn-reject').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.db-approval-item');
        if (!item) return;
        item.style.transition = 'opacity 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
      });
    });

  } // end if (dbSidebar)

}); // end DOMContentLoaded



