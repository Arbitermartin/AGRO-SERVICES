
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

    // ✅ ADD THIS ONCE, near the top csrf
  const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : '';
  // team page

// /* =====================================================
//    EVENT REGISTRATION — Country / Region cascade
// ===================================================== */
const countrySelect = document.getElementById('countrySelect');
const regionSelect = document.getElementById('regionSelect');

if (countrySelect && regionSelect) {
  const regionsByCountry = {
    Tanzania: ["Arusha","Dar es Salaam", "Dodoma","Geita","Iringa","Kagera","Katavi","Kigoma","Kilimanjaro","Lindi","Manyara","Mara","Mbeya","Morogoro","Mtwara","Mwanza","Njombe","Pwani(Coast)","Rukwa","Ruvuma","Shinyanga","Simiyu","Singida","Songwe","Tabora","Tanga","Kaskazini Pemba","Kusini Pemba","Kaskazini Unguja","Kusini Unguja","Mjini Magharibi"],
    Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Machakos", "Kiambu"],
    Uganda: ["Kampala", "Wakiso", "Mbarara", "Gulu", "Jinja", "Mbale"],
    Rwanda: ["Kigali", "Northern Province", "Southern Province", "Eastern Province", "Western Province"],
    Burundi: ["Bujumbura", "Gitega", "Ngozi", "Rumonge"],
    "South Sudan": ["Juba", "Wau", "Malakal", "Yei"],
    Ethiopia: ["Addis Ababa", "Oromia", "Amhara", "Tigray", "Sidama"],
    Somalia: ["Mogadishu", "Puntland", "Somaliland", "Hirshabelle"],
    Djibouti: ["Djibouti City", "Ali Sabieh", "Dikhil", "Tadjourah"],
    Eritrea: ["Asmara", "Anseba", "Debub", "Gash-Barka"],
  };

  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    const regions = regionsByCountry[selectedCountry] || [];

    regionSelect.innerHTML = '';

    if (regions.length === 0) {
      regionSelect.innerHTML = '<option value="">Select country first</option>';
      return;
    }

    regionSelect.innerHTML = '<option value="">Select region</option>' +
      regions.map(r => `<option value="${r}">${r}</option>`).join('');
  });
}
// // end here for form for events



/* =====================================================
   TEAM PAGE — bio toggle
===================================================== */
document.querySelectorAll('.team-bio-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.team-card');
    card.classList.toggle('is-open');
    const label = btn.querySelector('span');
    label.textContent = card.classList.contains('is-open') ? 'Hide Bio' : 'Read Bio';
  });
});
// end here

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

    // window.selectPayment = (index) => {
    //   document.querySelectorAll('.payment-method').forEach((el, i) => {
    //     el.classList.toggle('selected', i === index);
    //   });
    // };
    window.selectPayment = (index) => {
  document.querySelectorAll('.payment-method').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });

  const bankDetailsFields = document.getElementById('bankDetailsFields');
  if (bankDetailsFields) {
    bankDetailsFields.style.display = index === 1 ? 'block' : 'none';
  }
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

  // testmonials
  const testimonialSlider = document.getElementById('testimonialSlider');
if (testimonialSlider) {
  const slides = Array.from(testimonialSlider.querySelectorAll('.testimonial-slide'));
  const dotsContainer = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  let currentIndex = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.querySelectorAll('.testimonial-dot'));

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
    resetAutoplay();
  }
  function resetAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(currentIndex + 1), 6000);
  }
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  resetAutoplay();
}
// end here testmonials


/* =====================================================
   CHATBOT WIDGET — name capture, FAQ, live agent handoff
===================================================== */
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');

if (chatbotToggle && chatbotWindow) {
  let chatState = 'awaiting_name';
  let visitorName = '';
  let sessionId = null;
  let pollTimer = null;

  chatbotToggle.addEventListener('click', () => {
    const isOpen = chatbotWindow.style.display === 'flex';
    chatbotWindow.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && chatState === 'awaiting_name' && chatbotMessages.children.length === 1) {
      addBotMessage("Hi there! Before we get started, what's your name?");
    }
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.style.display = 'none';
    });
  }

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chatbot-msg chatbot-msg-${sender}`;
    msg.textContent = text;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
  function addBotMessage(text) { addMessage(text, 'bot'); }

  function addQuickButton(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chatbot-quick-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => { btn.remove(); onClick(); });
    chatbotMessages.appendChild(btn);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function startPollingLiveChat() {
    clearInterval(pollTimer);
    let lastCount = 0;
    pollTimer = setInterval(() => {
      fetch(`/chat/${sessionId}/messages`)
        .then(res => res.json())
        .then(messages => {
          if (messages.length > lastCount) {
            const newOnes = messages.slice(lastCount);
            newOnes.forEach(m => {
              if (m.sender_type === 'ict' || m.sender_type === 'bot') {
                addMessage(m.message, 'bot');
              }
            });
            lastCount = messages.length;
          }
        });
    }, 3000);
  }

  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatbotInput.value = '';

    if (chatState === 'awaiting_name') {
      visitorName = text;
      fetch('/chatbot/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','x-csrf-token': csrfToken  },
        body: JSON.stringify({ visitor_name: visitorName }),
      })
        .then(res => res.json())
        .then(data => {
          sessionId = data.session_id;
          chatState = 'chatting';
          addBotMessage(data.text);
        });
      return;
    }

    if (chatState === 'live_chat') {
      fetch(`/chat/${sessionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','x-csrf-token': csrfToken  },
        body: JSON.stringify({ message: text, sender_type: 'visitor', sender_name: visitorName }),
      });
      return;
    }

    // Default: ask FAQ bot
    fetch('/chatbot/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','x-csrf-token': csrfToken  },
      body: JSON.stringify({ message: text, session_id: sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        addBotMessage(data.text);

        if (data.type === 'no_match') {
          addQuickButton('Connect me to a live agent', () => {
            addMessage('Connect me to a live agent', 'user');
            fetch('/chatbot/connect-agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','x-csrf-token': csrfToken  },
              body: JSON.stringify({ session_id: sessionId }),
            })
              .then(res => res.json())
              .then(connectData => {
                addBotMessage(connectData.text);
                if (connectData.connected) {
                  chatState = 'live_chat';
                  startPollingLiveChat();
                }
              });
          });
        }
      });
  });
}
// end here

/* =====================================================
   CONTACT FORM VALIDATION
===================================================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('cEmail');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const contactBtn = document.getElementById('contactBtn');
  const charCount = document.getElementById('charCount');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, isValid) {
    const field = input.closest('.form-field');
    if (field) field.classList.toggle('has-error', !isValid);
    return isValid;
  }

  function validateContactForm() {
    let isValid = true;

    if (!nameInput.value.trim()) {
      validateField(nameInput, false);
      isValid = false;
    } else {
      validateField(nameInput, true);
    }

    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      validateField(emailInput, false);
      isValid = false;
    } else {
      validateField(emailInput, true);
    }

    if (!subjectInput.value.trim()) {
      validateField(subjectInput, false);
      isValid = false;
    } else {
      validateField(subjectInput, true);
    }

    if (!messageInput.value.trim()) {
      validateField(messageInput, false);
      isValid = false;
    } else {
      validateField(messageInput, true);
    }

    return isValid;
  }

  [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
    input.addEventListener('blur', validateContactForm);
    input.addEventListener('input', () => {
      const field = input.closest('.form-field');
      if (field) field.classList.remove('has-error');
    });
  });

  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  contactForm.addEventListener('submit', (e) => {
    if (!validateContactForm()) {
      e.preventDefault();
      return;
    }

    contactBtn.classList.add('is-loading');
    contactBtn.disabled = true;
  });
}
// end here

// registration intake
const registrationIntakeLink = document.getElementById('registrationIntakeLink');
const registrationIntakePanel = document.getElementById('registrationIntakePanel');
const cancelRegistrationIntake = document.getElementById('cancelRegistrationIntake');
if (registrationIntakeLink && registrationIntakePanel && dbMainContent) {
  registrationIntakeLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; registrationIntakePanel.style.display='block'; });
}
if (cancelRegistrationIntake) cancelRegistrationIntake.addEventListener('click', (e) => { e.preventDefault(); registrationIntakePanel.style.display='none'; dbMainContent.style.display='block'; });



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

    /* =====================================================
       MEMBER PROFILE — photo preview + dynamic blocks
       (ADDED — nothing removed above)
    ===================================================== */

    // Profile photo preview
    const profilePhotoInputNew = document.getElementById('profilePhotoInput');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    if (profilePhotoInputNew && profilePhotoPreview) {
      profilePhotoInputNew.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          profilePhotoPreview.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Create Education block
    function createEducationBlock() {
      return `
        <div class="item-block">
          <button type="button" class="remove-item-btn">&times;</button>
          <div class="form-row">
            <div class="form-field">
              <label>Level</label>
              <select name="edu_level[]">
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Certificate">Certificate</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor" selected>Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div class="form-field">
              <label>Institution</label>
              <input type="text" name="edu_institution[]" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Course</label>
              <input type="text" name="edu_course[]">
            </div>
            <div class="form-field">
              <label>Graduation Year</label>
              <input type="number" name="edu_year[]" min="1950" max="2035">
            </div>
          </div>
        </div>`;
    }

    // Create Experience block
    function createExperienceBlock() {
      return `
        <div class="item-block">
          <button type="button" class="remove-item-btn">&times;</button>
          <div class="form-row">
            <div class="form-field">
              <label>Company</label>
              <input type="text" name="exp_company[]">
            </div>
            <div class="form-field">
              <label>Job Title</label>
              <input type="text" name="exp_title[]">
            </div>
          </div>
          <div class="form-field">
            <label>Roles</label>
            <textarea name="exp_roles[]" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Years Exp</label>
              <input type="number" name="exp_years[]" min="0">
            </div>
            <div class="form-field">
              <label>Start Date</label>
              <input type="date" name="exp_start[]">
            </div>
            <div class="form-field">
              <label>End Date</label>
              <input type="date" name="exp_end[]">
            </div>
          </div>
        </div>`;
    }

    // Add Education button
    const addEducationBtn = document.getElementById('addEducationBtn');
    const educationList = document.getElementById('educationList');
    if (addEducationBtn && educationList) {
      addEducationBtn.addEventListener('click', () => {
        educationList.insertAdjacentHTML('beforeend', createEducationBlock());
      });
    }

    // Add Experience button
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    const experienceList = document.getElementById('experienceList');
    if (addExperienceBtn && experienceList) {
      addExperienceBtn.addEventListener('click', () => {
        experienceList.insertAdjacentHTML('beforeend', createExperienceBlock());
      });
    }

    // Remove Education / Experience block (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item-btn')) {
        const block = e.target.closest('.item-block');
        if (block) block.remove();
      }
    });

    // =====================================================
    // END of new Member Profile code
    // =====================================================

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

// my training
const addTrainingLink = document.getElementById('addTrainingLink');
const addTrainingPanel = document.getElementById('addTrainingPanel');
const cancelAddTraining = document.getElementById('cancelAddTraining');
if (addTrainingLink && addTrainingPanel && dbMainContent) {
  addTrainingLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    addTrainingPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAddTraining && addTrainingPanel && dbMainContent) {
  cancelAddTraining.addEventListener('click', (e) => {
    e.preventDefault();
    addTrainingPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

const trainingOpportunitiesLink = document.getElementById('trainingOpportunitiesLink');
const trainingOpportunitiesPanel = document.getElementById('trainingOpportunitiesPanel');
const cancelTrainingOpportunities = document.getElementById('cancelTrainingOpportunities');
if (trainingOpportunitiesLink && trainingOpportunitiesPanel && dbMainContent) {
  trainingOpportunitiesLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    trainingOpportunitiesPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelTrainingOpportunities && trainingOpportunitiesPanel && dbMainContent) {
  cancelTrainingOpportunities.addEventListener('click', (e) => {
    e.preventDefault();
    trainingOpportunitiesPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

// training registrtation
const trainingRegistrationsLink = document.getElementById('trainingRegistrationsLink');
const trainingRegistrationsPanel = document.getElementById('trainingRegistrationsPanel');
const cancelTrainingRegistrations = document.getElementById('cancelTrainingRegistrations');

if (trainingRegistrationsLink && trainingRegistrationsPanel && dbMainContent) {
  trainingRegistrationsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    trainingRegistrationsPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelTrainingRegistrations && trainingRegistrationsPanel && dbMainContent) {
  cancelTrainingRegistrations.addEventListener('click', (e) => {
    e.preventDefault();
    trainingRegistrationsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here

// guides start here
const uploadGuidesLink = document.getElementById('uploadGuidesLink');
const uploadGuidesPanel = document.getElementById('uploadGuidesPanel');
const cancelUploadGuide = document.getElementById('cancelUploadGuide');

if (uploadGuidesLink && uploadGuidesPanel && dbMainContent) {
  uploadGuidesLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    uploadGuidesPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelUploadGuide && uploadGuidesPanel && dbMainContent) {
  cancelUploadGuide.addEventListener('click', (e) => {
    e.preventDefault();
    uploadGuidesPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

const guideUploadArea = document.getElementById('guideUploadArea');
const guideUploadInput = document.getElementById('guideUploadInput');
if (guideUploadArea && guideUploadInput) {
  guideUploadArea.addEventListener('click', () => guideUploadInput.click());
  guideUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('guideUploadedFile').style.display = 'block';
      document.getElementById('guideFileName').textContent = e.target.files[0].name;
    }
  });
}
// end here

// Add Lesson
const addLessonLink = document.getElementById('addLessonLink');
const addLessonPanel = document.getElementById('addLessonPanel');
const cancelAddLesson = document.getElementById('cancelAddLesson');
if (addLessonLink && addLessonPanel && dbMainContent) {
  addLessonLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; addLessonPanel.style.display='block'; });
}
if (cancelAddLesson) cancelAddLesson.addEventListener('click', (e) => { e.preventDefault(); addLessonPanel.style.display='none'; dbMainContent.style.display='block'; });

// Upload Material
const uploadMaterialLink = document.getElementById('uploadMaterialLink');
const uploadMaterialPanel = document.getElementById('uploadMaterialPanel');
const cancelUploadMaterial = document.getElementById('cancelUploadMaterial');
if (uploadMaterialLink && uploadMaterialPanel && dbMainContent) {
  uploadMaterialLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; uploadMaterialPanel.style.display='block'; });
}
if (cancelUploadMaterial) cancelUploadMaterial.addEventListener('click', (e) => { e.preventDefault(); uploadMaterialPanel.style.display='none'; dbMainContent.style.display='block'; });

const materialUploadArea = document.getElementById('materialUploadArea');
const materialUploadInput = document.getElementById('materialUploadInput');
if (materialUploadArea && materialUploadInput) {
  materialUploadArea.addEventListener('click', () => materialUploadInput.click());
  materialUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('materialUploadedFile').style.display = 'block';
      document.getElementById('materialFileName').textContent = e.target.files[0].name;
    }
  });
}
// end here

/* ---------- Create Ticket panel ---------- */
const createTicketLink = document.getElementById('createTicketLink');
const createTicketPanel = document.getElementById('createTicketPanel');
const cancelCreateTicket = document.getElementById('cancelCreateTicket');
if (createTicketLink && createTicketPanel && dbMainContent) {
  createTicketLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; createTicketPanel.style.display='block'; });
}
if (cancelCreateTicket) cancelCreateTicket.addEventListener('click', (e) => { e.preventDefault(); createTicketPanel.style.display='none'; dbMainContent.style.display='block'; });

/* ---------- My Messages panel ---------- */
const myMessagesLink = document.getElementById('myMessagesLink');
const myMessagesPanel = document.getElementById('myMessagesPanel');
const cancelMyMessages = document.getElementById('cancelMyMessages');
if (myMessagesLink && myMessagesPanel && dbMainContent) {
  myMessagesLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; myMessagesPanel.style.display='block'; });
}
if (cancelMyMessages) cancelMyMessages.addEventListener('click', (e) => { e.preventDefault(); myMessagesPanel.style.display='none'; dbMainContent.style.display='block'; });

/* ---------- Support Tickets panel (ICT) ---------- */
const supportTicketsLink = document.getElementById('supportTicketsLink');
const supportTicketsPanel = document.getElementById('supportTicketsPanel');
const cancelSupportTickets = document.getElementById('cancelSupportTickets');
if (supportTicketsLink && supportTicketsPanel && dbMainContent) {
  supportTicketsLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; supportTicketsPanel.style.display='block'; });
}
if (cancelSupportTickets) cancelSupportTickets.addEventListener('click', (e) => { e.preventDefault(); supportTicketsPanel.style.display='none'; dbMainContent.style.display='block'; });

const viewAllTicketsLink = document.getElementById('viewAllTicketsLink');
if (viewAllTicketsLink && supportTicketsLink) {
  viewAllTicketsLink.addEventListener('click', (e) => {
    e.preventDefault();
    supportTicketsLink.click();
  });
}


/* ---------- Ticket expand/collapse + lazy-load messages ---------- */
document.querySelectorAll('.ticket-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.ticket-item');
    const ticketId = item.dataset.ticketId;
    const wasOpen = item.classList.contains('is-open');
    item.classList.toggle('is-open');

    if (!wasOpen) {
      fetch(`/account/tickets/${ticketId}/messages`)
        .then(res => res.json())
        .then(messages => {
          const container = document.getElementById(`messages-${ticketId}`);
          if (!container) return;
          if (messages.length === 0) {
            container.innerHTML = '<p style="font-size:0.8rem; color:#9ca3af;">No replies yet.</p>';
            return;
          }
          container.innerHTML = messages.map(m => {
            const isIct = m.account_type === 'ict_staff' || m.account_type === 'admin';
            const cls = isIct ? 'ticket-msg-theirs' : 'ticket-msg-mine';
            const time = new Date(m.created_at).toLocaleString('en-GB');
            return `<div class="ticket-msg ${cls}">${m.message}<div class="ticket-msg-meta">${m.full_name} &middot; ${time}</div></div>`;
          }).join('');
        })
        .catch(() => {
          const container = document.getElementById(`messages-${ticketId}`);
          if (container) container.innerHTML = '<p style="font-size:0.8rem; color:#c0392b;">Failed to load messages.</p>';
        });
    }
  });
});
//end here

/*****************
 * 
 * Delivery get all members
 * 
 */
const allMembersLink = document.getElementById('allMembersLink');
const allMembersPanel = document.getElementById('allMembersPanel');
const cancelAllMembers = document.getElementById('cancelAllMembers');

if (allMembersLink && allMembersPanel && dbMainContent) {
  allMembersLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    allMembersPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAllMembers && allMembersPanel && dbMainContent) {
  cancelAllMembers.addEventListener('click', (e) => {
    e.preventDefault();
    allMembersPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

// end here

/********************
 * 
 * Delivery team member
 */
const addTeamMemberLink = document.getElementById('addTeamMemberLink');
const addTeamMemberPanel = document.getElementById('addTeamMemberPanel');
const cancelAddTeamMember = document.getElementById('cancelAddTeamMember');

if (addTeamMemberLink && addTeamMemberPanel && dbMainContent) {
  addTeamMemberLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    addTeamMemberPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAddTeamMember && addTeamMemberPanel && dbMainContent) {
  cancelAddTeamMember.addEventListener('click', (e) => {
    e.preventDefault();
    addTeamMemberPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

const teamPhotoUploadArea = document.getElementById('teamPhotoUploadArea');
const teamPhotoUploadInput = document.getElementById('teamPhotoUploadInput');
if (teamPhotoUploadArea && teamPhotoUploadInput) {
  teamPhotoUploadArea.addEventListener('click', () => teamPhotoUploadInput.click());
  teamPhotoUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('teamPhotoUploadedFile').style.display = 'block';
      document.getElementById('teamPhotoFileName').textContent = e.target.files[0].name;
    }
  });
}
// end here team member.

// Delivery admin to see all team member
const allTeamMembersLink = document.getElementById('allTeamMembersLink');
const allTeamMembersPanel = document.getElementById('allTeamMembersPanel');
const cancelAllTeamMembers = document.getElementById('cancelAllTeamMembers');

if (allTeamMembersLink && allTeamMembersPanel && dbMainContent) {
  allTeamMembersLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    allTeamMembersPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAllTeamMembers && allTeamMembersPanel && dbMainContent) {
  cancelAllTeamMembers.addEventListener('click', (e) => {
    e.preventDefault();
    allTeamMembersPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// admin see all team member end here

//  edit profile photo (original code kept)
const profilePhotoUpload = document.getElementById('profilePhotoUpload');
const profilePhotoInput = document.getElementById('profilePhotoInput');

if (profilePhotoUpload && profilePhotoInput) {
  profilePhotoUpload.addEventListener('click', () => profilePhotoInput.click());

  profilePhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const oldPreview = document.getElementById('profilePhotoPreview');
      if (oldPreview) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.id = 'profilePhotoPreview';
        img.className = 'profile-photo-preview';
        oldPreview.replaceWith(img);
      }
    };
    reader.readAsDataURL(file);
  });
}
// end here

// message read
const messagesLink = document.getElementById('messagesLink');
const messagesPanel = document.getElementById('messagesPanel');
const cancelMessages = document.getElementById('cancelMessages');

if (messagesLink && messagesPanel && dbMainContent) {
  messagesLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    messagesPanel.style.display = 'block';
  });
}
if (cancelMessages && messagesPanel && dbMainContent) {
  cancelMessages.addEventListener('click', (e) => {
    e.preventDefault();
    messagesPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}

document.querySelectorAll('.message-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.ticket-item');
    item.classList.toggle('is-open');
  });
});
// end here messages

/**************************
 * Delivery registered users for events.
 */
const registeredUsersLink = document.getElementById('registeredUsersLink');
const registeredUsersPanel = document.getElementById('registeredUsersPanel');
const cancelRegisteredUsers = document.getElementById('cancelRegisteredUsers');

if (registeredUsersLink && registeredUsersPanel && dbMainContent) {
  registeredUsersLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    registeredUsersPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelRegisteredUsers && registeredUsersPanel && dbMainContent) {
  cancelRegisteredUsers.addEventListener('click', (e) => {
    e.preventDefault();
    registeredUsersPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here

/* ---------- Dashboard search ---------- */
const dashboardSearchInput = document.getElementById('dashboardSearchInput');
const dashboardSearchResults = document.getElementById('dashboardSearchResults');

if (dashboardSearchInput && dashboardSearchResults) {
  const roleAttr = document.body.getAttribute('data-role') || '';
  let searchEndpoint = '/account/search/member';
  if (roleAttr === 'admin') searchEndpoint = '/account/search/admin';
  if (roleAttr === 'ict_staff') searchEndpoint = '/account/search/ict';

  let debounceTimer;

  dashboardSearchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = dashboardSearchInput.value.trim();

    if (query.length < 2) {
      dashboardSearchResults.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(() => {
      fetch(`${searchEndpoint}?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => renderSearchResults(data))
        .catch(() => {
          dashboardSearchResults.innerHTML = '<div class="search-no-results">Search failed. Try again.</div>';
          dashboardSearchResults.style.display = 'block';
        });
    }, 300);
  });

  function renderSearchResults(data) {
    let html = '';
    let hasResults = false;

    if (data.accounts && data.accounts.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">Users</div>';
      data.accounts.forEach(a => {
        html += `<div class="search-result-item"><b>${a.full_name}</b><small>${a.email} &middot; ${a.account_type}</small></div>`;
      });
      html += '</div>';
    }

    if (data.jobs && data.jobs.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">Jobs</div>';
      data.jobs.forEach(j => {
        html += `<div class="search-result-item"><b>${j.title}</b><small>${j.region} &middot; ${j.job_type}</small></div>`;
      });
      html += '</div>';
    }

    if (data.news && data.news.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">News</div>';
      data.news.forEach(n => {
        html += `<div class="search-result-item"><b>${n.title}</b></div>`;
      });
      html += '</div>';
    }

    if (data.events && data.events.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">Events</div>';
      data.events.forEach(e => {
        html += `<div class="search-result-item"><b>${e.title}</b></div>`;
      });
      html += '</div>';
    }

    if (data.tickets && data.tickets.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">Tickets</div>';
      data.tickets.forEach(t => {
        html += `<div class="search-result-item"><b>#${t.ticket_number} — ${t.subject}</b><small>${t.full_name}</small></div>`;
      });
      html += '</div>';
    }

    if (data.trainings && data.trainings.length > 0) {
      hasResults = true;
      html += '<div class="search-result-group"><div class="search-result-group-title">Trainings</div>';
      data.trainings.forEach(t => {
        html += `<div class="search-result-item"><b>${t.title}</b></div>`;
      });
      html += '</div>';
    }

    dashboardSearchResults.innerHTML = hasResults ? html : '<div class="search-no-results">No results found.</div>';
    dashboardSearchResults.style.display = 'block';
  }

  document.addEventListener('click', (e) => {
    if (!dashboardSearchInput.contains(e.target) && !dashboardSearchResults.contains(e.target)) {
      dashboardSearchResults.style.display = 'none';
    }
  });
}
// end here search.

// payments
const allPaymentsLink = document.getElementById('allPaymentsLink');
const allPaymentsLink2 = document.getElementById('allPaymentsLink2');
const allPaymentsPanel = document.getElementById('allPaymentsPanel');
const cancelAllPayments = document.getElementById('cancelAllPayments');

function openAllPayments(e) {
  e.preventDefault();
  dbMainContent.style.display = 'none';
  allPaymentsPanel.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (allPaymentsLink && allPaymentsPanel && dbMainContent) allPaymentsLink.addEventListener('click', openAllPayments);
if (allPaymentsLink2 && allPaymentsPanel && dbMainContent) allPaymentsLink2.addEventListener('click', openAllPayments);

if (cancelAllPayments && allPaymentsPanel && dbMainContent) {
  cancelAllPayments.addEventListener('click', (e) => {
    e.preventDefault();
    allPaymentsPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here

// show all members
const ictAllMembersLink = document.getElementById('ictAllMembersLink');
const ictAllMembersPanel = document.getElementById('ictAllMembersPanel');
const cancelIctAllMembers = document.getElementById('cancelIctAllMembers');

if (ictAllMembersLink && ictAllMembersPanel && dbMainContent) {
  ictAllMembersLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    ictAllMembersPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelIctAllMembers && ictAllMembersPanel && dbMainContent) {
  cancelIctAllMembers.addEventListener('click', (e) => {
    e.preventDefault();
    ictAllMembersPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here show all members

// delivery admin
const adminManagementLink = document.getElementById('adminManagementLink');
const adminManagementPanel = document.getElementById('adminManagementPanel');
const cancelAdminManagement = document.getElementById('cancelAdminManagement');
if (adminManagementLink && adminManagementPanel && dbMainContent) {
  adminManagementLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; adminManagementPanel.style.display='block'; });
}
if (cancelAdminManagement) cancelAdminManagement.addEventListener('click', (e) => { e.preventDefault(); adminManagementPanel.style.display='none'; dbMainContent.style.display='block'; });

// notifications area
const notifToggle = document.getElementById('notifToggle');
const notifDropdown = document.getElementById('notifDropdown');
const notifCount = document.getElementById('notifCount'); 
const notifDot = document.getElementById('notifDot');
const notifList = document.getElementById('notifList');
const markAllReadBtn = document.getElementById('markAllReadBtn');

function loadNotifications() {
  fetch('/account/notifications')
    .then(res => res.json())
    .then(items => {
      if (notifCount) {
        if (items.length > 0) {
          notifCount.textContent = items.length > 9 ? '9+' : items.length;
          notifCount.style.display = 'flex';
        } else {
          notifCount.style.display = 'none';
        }
      }
    

      notifList.innerHTML = items.map(n => `
        <div class="db-notif-item" data-id="${n.id}">
          <div class="db-notif-item-body">
            <b>${n.title}</b>
            <span>${n.message}</span><br>
            <small>${new Date(n.created_at).toLocaleString('en-GB')}</small>
          </div>
          <div class="db-notif-item-actions">
            <button class="notif-mark-read" title="Mark as read"><i class="bi bi-check-circle"></i></button>
            <button class="notif-delete" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      `).join('');

      notifList.querySelectorAll('.notif-mark-read').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.db-notif-item');
          const id = item.dataset.id;
          fetch(`/account/notifications/${id}/read`, { method: 'POST',
             headers: { 'x-csrf-token': csrfToken },
           })
            .then(() => { item.remove(); loadNotifications(); });
        });
      });

      notifList.querySelectorAll('.notif-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.db-notif-item');
          const id = item.dataset.id;
          fetch(`/account/notifications/${id}/delete`, { method: 'POST',
             headers: { 'x-csrf-token': csrfToken },
           })
            .then(() => { item.remove(); loadNotifications(); });
        });
      });
    })
    .catch(() => {
      if (notifList) notifList.innerHTML = '<p class="db-notif-empty">Failed to load.</p>';
    });
}

if (notifToggle && notifDropdown) {
  notifToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = notifDropdown.classList.toggle('open');
    if (isOpen) loadNotifications();
  });

  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && e.target !== notifToggle) {
      notifDropdown.classList.remove('open');
    }
  });

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fetch('/account/notifications/mark-all-read', { method: 'POST',
         headers: { 'x-csrf-token': csrfToken },
       })
        .then(() => loadNotifications());
    });
  }

  loadNotifications();
  setInterval(loadNotifications, 30000);
}
// end here

// Delivery ict staff create
const addIctStaffLink = document.getElementById('addIctStaffLink');
const addIctStaffPanel = document.getElementById('addIctStaffPanel');
const cancelAddIctStaff = document.getElementById('cancelAddIctStaff');

if (addIctStaffLink && addIctStaffPanel && dbMainContent) {
  addIctStaffLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    addIctStaffPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelAddIctStaff && addIctStaffPanel && dbMainContent) {
  cancelAddIctStaff.addEventListener('click', (e) => {
    e.preventDefault();
    addIctStaffPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here. 

// delivery ict staff management
const ictManagementLink = document.getElementById('ictManagementLink');
const ictManagementPanel = document.getElementById('ictManagementPanel');
const cancelIctManagement = document.getElementById('cancelIctManagement');

if (ictManagementLink && ictManagementPanel && dbMainContent) {
  ictManagementLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    ictManagementPanel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
if (cancelIctManagement && ictManagementPanel && dbMainContent) {
  cancelIctManagement.addEventListener('click', (e) => {
    e.preventDefault();
    ictManagementPanel.style.display = 'none';
    dbMainContent.style.display = 'block';
  });
}
// end here ict staff management.

// task management
const taskManagementLink = document.getElementById('taskManagementLink');
const taskManagementPanel = document.getElementById('taskManagementPanel');
const cancelTaskManagement = document.getElementById('cancelTaskManagement');
if (taskManagementLink && taskManagementPanel && dbMainContent) {
  taskManagementLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; taskManagementPanel.style.display='block'; });
}
if (cancelTaskManagement) cancelTaskManagement.addEventListener('click', (e) => { e.preventDefault(); taskManagementPanel.style.display='none'; dbMainContent.style.display='block'; });

const myTasksLink = document.getElementById('myTasksLink');
const myTasksPanel = document.getElementById('myTasksPanel');
const cancelMyTasks = document.getElementById('cancelMyTasks');
if (myTasksLink && myTasksPanel && dbMainContent) {
  myTasksLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; myTasksPanel.style.display='block'; });
}
if (cancelMyTasks) cancelMyTasks.addEventListener('click', (e) => { e.preventDefault(); myTasksPanel.style.display='none'; dbMainContent.style.display='block'; });

document.querySelectorAll('.ticket-toggle-simple').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.ticket-item').classList.toggle('is-open'));
});
// end here

// testimonials delivery here

const addTestimonialLink = document.getElementById('addTestimonialLink');
const addTestimonialPanel = document.getElementById('addTestimonialPanel');
const cancelAddTestimonial = document.getElementById('cancelAddTestimonial');
if (addTestimonialLink && addTestimonialPanel && dbMainContent) {
  addTestimonialLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; addTestimonialPanel.style.display='block'; });
}
if (cancelAddTestimonial) cancelAddTestimonial.addEventListener('click', (e) => { e.preventDefault(); addTestimonialPanel.style.display='none'; dbMainContent.style.display='block'; });

const testimonialUploadArea = document.getElementById('testimonialUploadArea');
const testimonialUploadInput = document.getElementById('testimonialUploadInput');
if (testimonialUploadArea && testimonialUploadInput) {
  testimonialUploadArea.addEventListener('click', () => testimonialUploadInput.click());
  testimonialUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      document.getElementById('testimonialUploadedFile').style.display = 'block';
      document.getElementById('testimonialFileName').textContent = e.target.files[0].name;
    }
  });
}
// end here.

// chatbots
const liveChatsLink = document.getElementById('liveChatsLink');
const liveChatsPanel = document.getElementById('liveChatsPanel');
const cancelLiveChats = document.getElementById('cancelLiveChats');
const waitingChatsList = document.getElementById('waitingChatsList');
const activeChatThread = document.getElementById('activeChatThread');
const activeChatMessages = document.getElementById('activeChatMessages');
const ictChatReplyForm = document.getElementById('ictChatReplyForm');
const ictChatReplyInput = document.getElementById('ictChatReplyInput');
let activeSessionId = null;
let ictPollTimer = null;

if (liveChatsLink && liveChatsPanel && dbMainContent) {
  liveChatsLink.addEventListener('click', (e) => {
    e.preventDefault();
    dbMainContent.style.display = 'none';
    liveChatsPanel.style.display = 'block';
    loadWaitingChats();
  });
}
if (cancelLiveChats) cancelLiveChats.addEventListener('click', (e) => {
  e.preventDefault();
  liveChatsPanel.style.display = 'none';
  dbMainContent.style.display = 'block';
  clearInterval(ictPollTimer);
});

function loadWaitingChats() {
  fetch('/account/chat/waiting')
    .then(res => res.json())
    .then(sessions => {
      if (sessions.length === 0) {
        waitingChatsList.innerHTML = '<p style="text-align:center; color:#9ca3af;">No visitors waiting right now.</p>';
        return;
      }
      waitingChatsList.innerHTML = sessions.map(s => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #f5f5f5;">
          <span>${s.visitor_name}</span>
          <button type="button" class="btn-outline-sm accept-chat-btn" data-session-id="${s.id}">Accept</button>
        </div>
      `).join('');

      document.querySelectorAll('.accept-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sid = btn.dataset.sessionId;
          fetch(`/account/chat/${sid}/accept`, { method: 'POST',
            headers: { 'x-csrf-token': csrfToken },
           })
            .then(() => openChatThread(sid));
        });
      });
    });
}

function openChatThread(sid) {
  activeSessionId = sid;
  activeChatThread.style.display = 'block';
  pollActiveChat();
  clearInterval(ictPollTimer);
  ictPollTimer = setInterval(pollActiveChat, 3000);
}

function pollActiveChat() {
  fetch(`/chat/${activeSessionId}/messages`)
    .then(res => res.json())
    .then(messages => {
      activeChatMessages.innerHTML = messages.map(m => `
        <div style="align-self:${m.sender_type === 'ict' ? 'flex-end' : 'flex-start'}; background:${m.sender_type === 'ict' ? 'var(--primary-green)' : '#f1f8e9'}; color:${m.sender_type === 'ict' ? '#fff' : '#000'}; padding:8px 12px; border-radius:12px; max-width:75%; font-size:0.85rem;">
          ${m.message}
        </div>
      `).join('');
      activeChatMessages.scrollTop = activeChatMessages.scrollHeight;
    });
}

if (ictChatReplyForm) {
  ictChatReplyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = ictChatReplyInput.value.trim();
    if (!text || !activeSessionId) return;
    fetch(`/chat/${activeSessionId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','x-csrf-token': csrfToken  },
      body: JSON.stringify({ message: text, sender_type: 'ict', sender_name: '<%= account.full_name %>' }),
    }).then(() => {
      ictChatReplyInput.value = '';
      pollActiveChat();
    });
  });
}
// end here.

// delivery FAQ
          const siteFaqsLink = document.getElementById('siteFaqsLink');
          const siteFaqsPanel = document.getElementById('siteFaqsPanel');
          const cancelSiteFaqs = document.getElementById('cancelSiteFaqs');
       if (siteFaqsLink && siteFaqsPanel && dbMainContent) {
           siteFaqsLink.addEventListener('click', (e) => { e.preventDefault(); dbMainContent.style.display='none'; siteFaqsPanel.style.display='block'; });
       }
       if (cancelSiteFaqs) cancelSiteFaqs.addEventListener('click', (e) => { e.preventDefault(); siteFaqsPanel.style.display='none'; dbMainContent.style.display='block'; });
     // END HERE

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



