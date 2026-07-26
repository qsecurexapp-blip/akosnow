/**
 * Akosnow SaaS Website - Main Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  window.akosnowFormSubmitted = false;

  // HTML sanitization helper to prevent DOM XSS
  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // ==========================================================================
  // 1. Theme Toggle Manager
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-theme');
      localStorage.setItem('akosnow-theme', isDark ? 'dark' : 'light');
    });
  }


  // ==========================================================================
  // 2. Sticky Nav & Scroll Progress Indicator
  // ==========================================================================
  const mainHeader = document.getElementById('mainHeader');
  const scrollProgress = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 50) {
      mainHeader.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
    } else {
      mainHeader.style.boxShadow = 'none';
    }

    // Scroll Progress bar
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (windowHeight > 0 && scrollProgress) {
      const scrollPercent = (window.scrollY / windowHeight) * 100;
      scrollProgress.style.width = `${scrollPercent}%`;
    }
  });


  // ==========================================================================
  // 3. Announcement Bar Dismissal
  // ==========================================================================
  const announcementBar = document.getElementById('announcementBar');
  const closeAnnouncement = document.getElementById('closeAnnouncement');

  if (closeAnnouncement) {
    closeAnnouncement.addEventListener('click', () => {
      announcementBar.style.opacity = '0';
      announcementBar.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        announcementBar.style.display = 'none';
      }, 300);
    });
  }


  // ==========================================================================
  // 4. Mobile Menu Toggler (Hamburger)
  // ==========================================================================
  const mobileHamburger = document.getElementById('mobileHamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileHamburger && navMenu) {
    mobileHamburger.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      mobileHamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      
      // Animate hamburger lines
      const lines = mobileHamburger.querySelectorAll('.hamburger-line');
      if (isActive && lines.length >= 3) {
        lines[0].style.transform = 'rotate(45deg) translate(2px, -2px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(2px, 2px)';
      } else if (lines.length >= 3) {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      }
    });
  }

  // Close mobile menu on clicking any link
  if (navLinks && navLinks.length > 0 && navMenu && mobileHamburger) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileHamburger.setAttribute('aria-expanded', 'false');
          const lines = mobileHamburger.querySelectorAll('.hamburger-line');
          if (lines.length >= 3) {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
          }
        }
        
        // Update active nav-link state
        navLinks.forEach(n => n.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }


  // ==========================================================================
  // 5. Scroll-Triggered Animated Statistics Counters (Dynamic Telemetry Stats)
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const fetchTelemetryStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/business/telemetry-stats');
      const result = await response.json();
      if (result.success && result.data) {
        const elLeads = document.getElementById('telemetryLeads');
        const elOrders = document.getElementById('telemetryOrders');
        const elApps = document.getElementById('telemetryAppointments');
        const elUnread = document.getElementById('telemetryUnread');
        
        if (elLeads) {
          elLeads.setAttribute('data-target', result.data.leadsToday);
          elLeads.textContent = result.data.leadsToday;
        }
        if (elOrders) {
          elOrders.setAttribute('data-target', result.data.ordersLogged);
          elOrders.textContent = result.data.ordersLogged;
        }
        if (elApps) {
          elApps.setAttribute('data-target', result.data.appointments);
          elApps.textContent = result.data.appointments;
        }
        if (elUnread) {
          elUnread.setAttribute('data-target', result.data.unreadAlerts);
          elUnread.textContent = result.data.unreadAlerts;
        }
      }
    } catch (e) {
      console.warn('Failed to load live telemetry stats:', e);
    }
  };

  const animateStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dataTarget = entry.target.getAttribute('data-target');
        const target = dataTarget ? parseInt(dataTarget, 10) : parseInt(entry.target.textContent, 10);
        
        if (isNaN(target)) {
          observer.unobserve(entry.target);
          return;
        }

        let current = 0;
        const duration = 1500; // 1.5s animation
        const increment = Math.ceil(target / (duration / 16)); // ~60fps
        
        const counterInterval = setInterval(() => {
          current += increment;
          if (current >= target) {
            entry.target.textContent = target;
            clearInterval(counterInterval);
          } else {
            entry.target.textContent = current;
          }
        }, 16);
        
        observer.unobserve(entry.target);
      }
    });
  };

  const statsObserver = new IntersectionObserver(animateStats, {
    root: null,
    threshold: 0.1
  });

  // Fetch telemetry counts, then observe scroll intersection
  fetchTelemetryStats().finally(() => {
    statNumbers.forEach(stat => statsObserver.observe(stat));
  });


  // ==========================================================================
  // 6. Product Filter & Instant Search Engine
  // ==========================================================================
  const productSearch = document.getElementById('productSearch');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  let activeCategory = 'all';
  let searchQuery = '';

  const updateProductVisibility = () => {
    productCards.forEach(card => {
      const cardCategories = card.getAttribute('data-categories').split(' ');
      const searchData = card.getAttribute('data-name').toLowerCase();
      
      const matchesCategory = (activeCategory === 'all' || cardCategories.includes(activeCategory));
      const matchesSearch = searchData.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });
  };

  // Search input handler
  if (productSearch) {
    productSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updateProductVisibility();
    });
  }

  // Tab filter trigger
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      activeCategory = tab.getAttribute('data-category');
      updateProductVisibility();
    });
  });


  // ==========================================================================
  // 7. Product Modal Database & Controller
  // ==========================================================================
  const productsDB = {
    billing: {
      title: "Akosnow Billing & POS",
      icon: "icons/logo.png",
      category: "Business Operations",
      overview: "Complete billing, inventory & business management software designed for retail stores, supermarkets, wholesalers, hardware stores, textiles, and service businesses.",
      features: [
        "GST Invoice Generator & Tax Reports",
        "Point of Sale (POS) quick checkout",
        "Barcode printing and scanner integration",
        "Real-time Inventory & Low-Stock Alerts",
        "Offline billing with auto-sync backups",
        "Multi-branch system control dashboards"
      ],
      industries: "Supermarkets, Retail Shops, Electronics, Hardwares, Textiles, Wholesalers.",
      platforms: ["Windows", "macOS", "Web Browser", "Android"],
      related: "Akosnow CRM, Akosnow MSGE"
    },
    crm: {
      title: "Akosnow CRM",
      icon: "icons/crm.png",
      category: "Business Operations",
      overview: "Customer Relationship Management Platform to manage every interaction from initial lead generation to quotes dispatch and post-sale technical support.",
      features: [
        "Interactive leads lifecycle funnel tracker",
        "Professional quotations generator",
        "Client database profile registers",
        "Follow-up scheduling reminders",
        "Sales pipelines and revenue reports",
        "Internal team task assignments"
      ],
      industries: "B2B Sales, Distributors, Custom Services, Agencies.",
      platforms: ["Web Portal", "Android App", "iOS App"],
      related: "Akosnow MSGE, Custom Development"
    },
    msge: {
      title: "Akosnow MSGE",
      icon: "icons/logo copy.png",
      category: "Business Operations",
      overview: "Unified business inbox and communication gateway designed to stream website leads, clinic appointments, POS transactions, and CRM alerts directly to your team.",
      features: [
        "Unified business inbox workspace",
        "Real-time webhook alert integrations",
        "Interactive CRM & POS workspaces",
        "Cross-platform push notification chimes",
        "Dynamic custom form fields parsing",
        "Forward-looking AI assistant routing"
      ],
      industries: "SMEs, distributed sales forces, and service support teams.",
      platforms: ["Windows", "macOS", "Linux", "Web", "iOS", "Android"],
      related: "Akosnow CRM, QSecureX"
    },
    clinic: {
      title: "Akosnow Clinic",
      icon: "icons/clinic.png",
      category: "Healthcare",
      overview: "Integrated medical database system managing patient profiles, treatment folders, billing, and doctor appointment grids.",
      features: [
        "Electronic Medical Records (EMR) vault",
        "Appointment calendar schedulers",
        "Digital drug prescriptions writer",
        "Doctor logs dashboard interfaces",
        "Patient visit history charts",
        "Clinic billing and reports"
      ],
      industries: "Medical Clinics, Dentists, Specialist Centers, Healthcare Providers.",
      platforms: ["Web Browser", "Windows", "macOS"],
      related: "Akosnow Pharmacy"
    },
    pharmacy: {
      title: "Akosnow Pharmacy",
      icon: "icons/pharmacy-icon.png",
      category: "Healthcare",
      overview: "Dedicated pharmaceutical records software controlling shelf inventories, batch trackers, drug expirations, and sales desks.",
      features: [
        "Drug inventory tracker",
        "Expiry alerts with batch records",
        "Prescriptions file databases",
        "Supplier invoices register templates",
        "GST billing desks with scanners",
        "Purchase ordering automation"
      ],
      industries: "Pharmacies, Medical Stores, Drug Distributors.",
      platforms: ["Windows Desktop", "macOS", "Web Browser"],
      related: "Akosnow Clinic, Akosnow Billing & POS"
    },
    restaurant: {
      title: "Akosnow Restaurant",
      icon: "icons/restaurant_icon.png",
      category: "Hospitality",
      overview: "Food service POS system streamlining order workflows between tables, serving staff, and the kitchen prep area.",
      features: [
        "Kitchen Order Tickets (KOT) routing",
        "Visual dining room table layouts",
        "Menu category modifiers system",
        "Staff order pad application integration",
        "Fast counter checkout billing",
        "Ingredient tracking & recipe costing"
      ],
      industries: "Fine-Dining Restaurants, Cafés, Fast Food Chains, Pubs.",
      platforms: ["Android Tablet", "iPad", "Windows", "Web Portal"],
      related: "Akosnow Hotel"
    },
    hotel: {
      title: "Akosnow Hotel",
      icon: "icons/hotel-icon.png",
      category: "Hospitality",
      overview: "PMS Property Management System organizing room layouts, guest folders, housekeeper tasks, and check-in billing desks.",
      features: [
        "Live room reservation grid mappings",
        "Guest check-in & check-out sheets",
        "Housekeeper service status board",
        "Tax-compliant hotel billing layouts",
        "Guest profiles database integration",
        "Multi-seasonal room pricing modifiers"
      ],
      industries: "Boutique Hotels, Resorts, Guest Houses, Hostels.",
      platforms: ["Web Portal", "Windows Desktop"],
      related: "Akosnow Restaurant"
    },
    garage: {
      title: "Akosnow Garage",
      icon: "icons/garage-icon.png",
      category: "Automotive",
      overview: "Automobile workshop software tracking service cycles from job card logs to part invoices and team scheduling.",
      features: [
        "Digital job cards generation",
        "Vehicle maintenance repair histories",
        "Technician workshop assignments",
        "Spare parts inventory checkout",
        "Automatic client service reminders",
        "Work invoice print templates"
      ],
      industries: "Automobile Repair Shops, Detailers, Car Dealership Services.",
      platforms: ["Windows", "Web Browser", "Android App"],
      related: "Akosnow Billing & POS"
    },
    school: {
      title: "Akosnow School",
      icon: "icons/school.png",
      category: "Education",
      overview: "Administrative database managing school enrollments, class directories, exam records, fee invoices, and student communications.",
      features: [
        "Student demographic profile directories",
        "Daily attendance logs system",
        "Class exam schedules & reports cards",
        "Fee payments audit registers",
        "Parent notifications chat hooks",
        "Staff payroll registers"
      ],
      industries: "Private Schools, Learning Academies, Colleges, Training Centers.",
      platforms: ["Web Portal", "Android App", "iOS App"],
      related: "Akosnow Community"
    },
    community: {
      title: "Akosnow Community",
      icon: "icons/cum-icon.png",
      category: "Community",
      overview: "Membership management database tracking contributions, member files, event planning, and alerts broadcasts.",
      features: [
        "Member contact database registry",
        "Subscriptions & donation audits tracking",
        "Event RSVP calendar trackers",
        "Announcements email/SMS broadcasts",
        "Committee roles access controls",
        "Annual financial reporting templates"
      ],
      industries: "Associations, Clubs, Apartments Boards, Religious Organizations.",
      platforms: ["Web Portal", "Android App", "iOS App"],
      related: "Akosnow School, Akosnow MSGE"
    },
    qsecurex: {
      title: "QSecureX",
      icon: "icons/favicon.png",
      category: "Security",
      overview: "Zero-knowledge, offline-first cryptographic vault. Privacy by design with local AES-256 encryption protects your credentials, notes, and files without mandatory cloud sync.",
      features: [
        "AES-256 local database encryption",
        "Offline-first vault architecture",
        "Privacy by design principles",
        "Secure credential password safes",
        "Zero-knowledge serverless setup",
        "No mandatory cloud syncing"
      ],
      industries: "Corporate Offices, Executive Staff, Privacy Advocates.",
      platforms: ["Windows Desktop", "macOS Desktop", "Linux Desktop", "Android App"],
      related: "Akosnow MSGE"
    },
    custom: {
      title: "Custom Development",
      icon: "icons/logo2.png",
      category: "Enterprise",
      overview: "Bespoke engineering solutions tailormade by our systems team to automate unique business processes.",
      features: [
        "Custom ERP systems and layouts",
        "Third-party API system link bridges",
        "Dedicated corporate dashboards reports",
        "Secure cloud server configurations",
        "Existing database migration service",
        "Full staff training documentation"
      ],
      industries: "Large Enterprises, Wholesalers, Specialized Service Providers.",
      platforms: ["Tailored (Web, Mobile, Desktop, Cloud)"],
      related: "All Products"
    }
  };

  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnLearnMores = document.querySelectorAll('.btn-learn-more');
  let modalTriggerSource = null;

  const openModal = (productKey) => {
    const data = productsDB[productKey];
    if (!data) return;

    // Save scroll position / triggering element for accessibility focus return
    modalTriggerSource = document.activeElement;

    // Populate Modal Content
    document.getElementById('modalIcon').innerHTML = `<img class="modal-icon-img" src="${data.icon}" alt="${data.title} Logo">`;
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalOverview').textContent = data.overview;
    document.getElementById('modalIndustries').textContent = data.industries;
    document.getElementById('modalRelated').textContent = data.related;

    // Features Checklist
    const featuresList = document.getElementById('modalFeaturesList');
    featuresList.innerHTML = '';
    data.features.forEach(feat => {
      const li = document.createElement('li');
      li.textContent = feat;
      featuresList.appendChild(li);
    });

    // Supported Platforms
    const platformsContainer = document.getElementById('modalPlatforms');
    platformsContainer.innerHTML = '';
    data.platforms.forEach(plat => {
      const span = document.createElement('span');
      span.className = 'platform-chip';
      span.textContent = plat;
      platformsContainer.appendChild(span);
    });

    // Mockup Screen Preview Text
    document.getElementById('modalScreenPreview').innerHTML = `
      <div style="z-index: 2; position: relative; text-align: center; padding: 1rem;">
        <img src="${data.icon}" alt="${data.title} icon" style="width: 2.5rem; height: 2.5rem; margin-bottom: 0.5rem; object-fit: contain; display: inline-block;">
        <strong style="display: block; color: var(--text-primary);">${data.title}</strong>
        <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem;">Production Console Preview</p>
      </div>
    `;

    // Associate Action CTA button with product select trigger
    const modalCtaBtn = document.getElementById('modalCtaBtn');
    modalCtaBtn.onclick = () => {
      closeModal();
      handleDemoSelection(data.title);
    };

    // Open Modal
    productModal.classList.add('active');
    productModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    // Focus Lock Accessibility
    modalCloseBtn.focus();
  };

  const closeModal = () => {
    productModal.classList.remove('active');
    productModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scroll

    // Return focus to triggering link/button
    if (modalTriggerSource) {
      modalTriggerSource.focus();
    }
  };

  // Event Listeners for Modal
  btnLearnMores.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-product');
      openModal(key);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  
  // Close on clicking backdrop overlay
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeModal();
      }
    });
  }

  // Escape key close
  document.addEventListener('keydown', (e) => {
    if (!productModal) return;
    if (e.key === 'Escape' && productModal.classList.contains('active')) {
      closeModal();
    }

    // Modal Focus trapping
    if (e.key === 'Tab' && productModal.classList.contains('active')) {
      const focusables = productModal.querySelectorAll('button, [tabindex="0"]');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });


  // ==========================================================================
  // 8. Demo Selection Dispatcher (Auto-select product in contact form)
  // ==========================================================================
  const productInterest = document.getElementById('productInterest');
  const demoFormSection = document.getElementById('contact');
  const fullNameField = document.getElementById('fullName');

  const handleDemoSelection = (productName) => {
    if (!productName || !productInterest || !demoFormSection || !fullNameField) return;

    // Find and select option in dropdown
    for (let i = 0; i < productInterest.options.length; i++) {
      if (productInterest.options[i].value === productName) {
        productInterest.selectedIndex = i;
        break;
      }
    }

    // Scroll to contact form smoothly
    demoFormSection.scrollIntoView({ behavior: 'smooth' });

    // Focus input field with focus ring highlight
    setTimeout(() => {
      fullNameField.focus();
    }, 800);
  };

  // Card CTA button event triggers
  const btnRequestDemos = document.querySelectorAll('.btn-request-demo');
  btnRequestDemos.forEach(btn => {
    btn.addEventListener('click', () => {
      const productName = btn.getAttribute('data-product');
      handleDemoSelection(productName);
    });
  });

  // Hero CTAs redirection trigger
  const heroDemoBtn = document.getElementById('heroDemoBtn');
  const heroSalesBtn = document.getElementById('heroSalesBtn');

  if (heroDemoBtn && demoFormSection && fullNameField) {
    heroDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      demoFormSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => fullNameField.focus(), 800);
    });
  }

  if (heroSalesBtn && demoFormSection && productInterest && fullNameField) {
    heroSalesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      demoFormSection.scrollIntoView({ behavior: 'smooth' });
      // pre-select custom software as sales general inquiry
      productInterest.value = "Custom Software";
      setTimeout(() => fullNameField.focus(), 800);
    });
  }


  // ==========================================================================
  // 9. FAQ Accordion Handler
  // ==========================================================================
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.parentElement;
      const content = faqItem.querySelector('.faq-content');
      const isActive = faqItem.classList.toggle('active');

      trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');

      if (isActive) {
        // Expand content height dynamically
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
      }

      // Close neighboring accordions for cleaner readability
      const siblings = faqItem.parentElement.querySelectorAll('.faq-item');
      siblings.forEach(sib => {
        if (sib !== faqItem) {
          sib.classList.remove('active');
          const sibTrigger = sib.querySelector('.faq-trigger');
          sibTrigger.setAttribute('aria-expanded', 'false');
          sib.querySelector('.faq-content').style.maxHeight = '0px';
        }
      });
    });
  });


  // ==========================================================================
  // 10. Contact Demo Form Validation & Submission Mock
  // ==========================================================================
  const demoForm = document.getElementById('demoForm');

  const validateField = (element, errorElement, condition, message) => {
    if (condition) {
      element.classList.remove('invalid');
      errorElement.style.display = 'none';
      return true;
    } else {
      element.classList.add('invalid');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      return false;
    }
  };

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName');
      const companyName = document.getElementById('companyName');
      const emailAddress = document.getElementById('emailAddress');
      const phoneNumber = document.getElementById('phoneNumber');
      const productSelection = document.getElementById('productInterest');

      // Errors labels
      const nameErr = document.getElementById('fullNameError');
      const compErr = document.getElementById('companyNameError');
      const emailErr = document.getElementById('emailError');
      const phoneErr = document.getElementById('phoneError');
      const prodErr = document.getElementById('productError');

      // Validation conditions
      const nameValid = validateField(fullName, nameErr, fullName.value.trim().length > 0, "Full name is required.");
      const compValid = validateField(companyName, compErr, companyName.value.trim().length > 0, "Company name is required.");
      
      // Regular expression for validating simple email structures
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValid = validateField(emailAddress, emailErr, emailReg.test(emailAddress.value.trim()), "Please enter a valid company email.");

      // Simple phone verification (minimum 7 digits)
      const phoneValid = validateField(phoneNumber, phoneErr, phoneNumber.value.trim().replace(/\D/g, '').length >= 7, "Valid phone number is required.");
      
      const prodValid = validateField(productSelection, prodErr, productSelection.value !== "", "Please select a product.");

      // Verify all are true
      if (nameValid && compValid && emailValid && phoneValid && prodValid) {
        // Mock Submission Visual States
        const submitBtn = demoForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting Request...";
        
        // Simulate API call processing delay
        setTimeout(() => {
          window.akosnowFormSubmitted = true;
          
          triggerMsgeNotification("Bottom Contact Demo Form", {
            name: fullName.value,
            company: companyName.value,
            email: emailAddress.value,
            phone: phoneNumber.value,
            product: productSelection.value
          });
          sendMsgeFirestoreAlert("Bottom Contact Demo Form", {
            name: fullName.value,
            company: companyName.value,
            email: emailAddress.value,
            phone: phoneNumber.value,
            product: productSelection.value
          });

          // Success panel markup insert
          const parentContainer = demoForm.parentElement;
          parentContainer.style.opacity = '0';
          
          setTimeout(() => {
            parentContainer.innerHTML = `
              <div class="form-success-state" style="text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; animation: fadeIn 0.4s ease-out;">
                <div class="success-icon" style="background-color: var(--color-success-bg); color: var(--color-success); font-size: 3rem; width: 5rem; height: 5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">✓</div>
                <h3 style="font-size: 1.75rem; color: var(--text-primary);">Demo Requested Successfully</h3>
                <p style="color: var(--text-secondary); max-width: 320px; line-height: 1.5;">Thank you, <strong>${fullName.value}</strong>! Our product specialist will call you at <strong>${phoneNumber.value}</strong> or email <strong>${emailAddress.value}</strong> within 24 hours to schedule your session.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top: 1rem;">Back to Website</button>
              </div>
            `;
            parentContainer.style.opacity = '1';
          }, 300);

        }, 1500);
      }
    });
  }

  // 10.1 Hero Demo Form Validation & Submission Handler
  const heroDemoForm = document.getElementById('heroDemoForm');
  if (heroDemoForm) {
    heroDemoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('heroFullName');
      const companyName = document.getElementById('heroCompanyName');
      const emailAddress = document.getElementById('heroEmail');
      const phoneNumber = document.getElementById('heroPhone');
      const productSelection = document.getElementById('heroProduct');

      const nameErr = document.getElementById('heroFullNameError');
      const compErr = document.getElementById('heroCompanyNameError');
      const emailErr = document.getElementById('heroEmailError');
      const phoneErr = document.getElementById('heroPhoneError');
      const prodErr = document.getElementById('heroProductError');

      const nameValid = validateField(fullName, nameErr, fullName.value.trim().length > 0, "Full name is required.");
      const compValid = validateField(companyName, compErr, companyName.value.trim().length > 0, "Company name is required.");
      
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValid = validateField(emailAddress, emailErr, emailReg.test(emailAddress.value.trim()), "Please enter a valid company email.");

      const phoneValid = validateField(phoneNumber, phoneErr, phoneNumber.value.trim().replace(/\D/g, '').length >= 7, "Valid phone number is required.");
      const prodValid = validateField(productSelection, prodErr, productSelection.value !== "", "Please select a product.");

      if (nameValid && compValid && emailValid && phoneValid && prodValid) {
        const submitBtn = heroDemoForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting Request...";

        setTimeout(() => {
          window.akosnowFormSubmitted = true;
          
          triggerMsgeNotification("Hero Lead Demo Form", {
            name: fullName.value,
            company: companyName.value,
            email: emailAddress.value,
            phone: phoneNumber.value,
            product: productSelection.value
          });
          sendMsgeFirestoreAlert("Hero Lead Demo Form", {
            name: fullName.value,
            company: companyName.value,
            email: emailAddress.value,
            phone: phoneNumber.value,
            product: productSelection.value
          });

          const parentContainer = heroDemoForm.parentElement;
          parentContainer.style.opacity = '0';
          
          setTimeout(() => {
            parentContainer.innerHTML = `
              <div class="form-success-state" style="text-align: center; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; animation: fadeIn 0.4s ease-out;">
                <div class="success-icon" style="background-color: var(--color-success-bg); color: var(--color-success); font-size: 2.5rem; width: 4.5rem; height: 4.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">✓</div>
                <h3 style="font-size: 1.5rem; color: var(--text-primary); margin: 0;">Demo Requested!</h3>
                <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.85rem; margin: 0;">Thank you, <strong>${fullName.value}</strong>! Our product specialist will call you at <strong>${phoneNumber.value}</strong> or email <strong>${emailAddress.value}</strong> within 24 hours to schedule your session.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; font-size: 0.85rem;">Back to Website</button>
              </div>
            `;
            parentContainer.style.opacity = '1';
          }, 300);
        }, 1500);
      }
    });
  }

  // Partner Application Form Controller
  const partnerForm = document.getElementById('partnerForm');
  if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const partnerName = document.getElementById('partnerName');
      const partnerCompany = document.getElementById('partnerCompany');
      const partnerEmail = document.getElementById('partnerEmail');
      const partnerPhone = document.getElementById('partnerPhone');
      const partnerRole = document.getElementById('partnerRole');
      const partnerRegion = document.getElementById('partnerRegion');
      const partnerWebsite = document.getElementById('partnerWebsite');
      const partnerExperience = document.getElementById('partnerExperience');
      const partnerIndustries = document.getElementById('partnerIndustries');
      
      const pNameErr = document.getElementById('partnerNameError');
      const pCompErr = document.getElementById('partnerCompanyError');
      const pEmailErr = document.getElementById('partnerEmailError');
      const pPhoneErr = document.getElementById('partnerPhoneError');
      const pRoleErr = document.getElementById('partnerRoleError');
      const pRegErr = document.getElementById('partnerRegionError');
      const pWebErr = document.getElementById('partnerWebsiteError');
      const pExpErr = document.getElementById('partnerExperienceError');
      const pIndErr = document.getElementById('partnerIndustriesError');
      
      const nameVal = validateField(partnerName, pNameErr, partnerName.value.trim().length > 0, "Full name is required.");
      const compVal = validateField(partnerCompany, pCompErr, partnerCompany.value.trim().length > 0, "Company name/Agency is required.");
      
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailVal = validateField(partnerEmail, pEmailErr, emailReg.test(partnerEmail.value.trim()), "Please enter a valid business email.");
      
      const phoneVal = validateField(partnerPhone, pPhoneErr, partnerPhone.value.trim().replace(/\D/g, '').length >= 7, "Valid phone number is required.");
      const roleVal = validateField(partnerRole, pRoleErr, partnerRole.value !== "", "Please select your business category.");
      const regVal = validateField(partnerRegion, pRegErr, partnerRegion.value.trim().length > 0, "Please enter your region/state.");
      
      // Optional Website check
      let webVal = true;
      if (partnerWebsite && partnerWebsite.value.trim().length > 0) {
        const webReg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        webVal = validateField(partnerWebsite, pWebErr, webReg.test(partnerWebsite.value.trim()), "Please enter a valid URL.");
      } else if (pWebErr) {
        pWebErr.style.display = 'none';
        partnerWebsite.classList.remove('invalid');
      }
      
      const expVal = validateField(partnerExperience, pExpErr, partnerExperience.value.trim().length > 0 && parseInt(partnerExperience.value) >= 0, "Years of experience is required.");
      const indVal = validateField(partnerIndustries, pIndErr, partnerIndustries.value.trim().length > 0, "Target industries details are required.");
      
      if (nameVal && compVal && emailVal && phoneVal && roleVal && regVal && webVal && expVal && indVal) {
        const submitBtn = partnerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Application...";
        
        setTimeout(() => {
          triggerMsgeNotification("Partner Program Application Form", {
            name: partnerName.value,
            company: partnerCompany.value,
            email: partnerEmail.value,
            phone: partnerPhone.value,
            product: "Channel Partner: " + partnerRole.value
          });
          sendMsgeFirestoreAlert("Partner Program Application Form", {
            name: partnerName.value,
            company: partnerCompany.value,
            email: partnerEmail.value,
            phone: partnerPhone.value,
            product: "Channel Partner: " + partnerRole.value
          });

          const parent = partnerForm.parentElement;
          parent.style.opacity = '0';
          setTimeout(() => {
            parent.innerHTML = `
              <div class="form-success-state" style="text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; animation: fadeIn 0.4s ease-out;">
                <div class="success-icon" style="background-color: var(--color-success-bg); color: var(--color-success); font-size: 3.5rem; width: 6rem; height: 6rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">✓</div>
                <h3 style="font-size: 2rem; color: var(--text-primary); margin-bottom: 0;">Application Received</h3>
                <p style="color: var(--text-secondary); max-width: 420px; line-height: 1.6; margin-top: 0.5rem;">Thank you for applying, <strong>${escapeHTML(partnerName.value)}</strong>! Our partnership director will review your agency (<strong>${escapeHTML(partnerCompany.value)}</strong>) details and contact you via email at <strong>${escapeHTML(partnerEmail.value)}</strong> within 2 business days.</p>
                <a href="index.html" class="btn btn-outline" style="margin-top: 1rem; text-decoration: none; display: inline-block;">Return to Home</a>
              </div>
            `;
            parent.style.opacity = '1';
          }, 300);
        }, 1500);
      }
    });
  }

  // ==========================================================================
  // 11. Lead Consultation Popup & Mobile Bottom Sheet Trigger & Controller
  // ==========================================================================
  const leadPopupOverlay = document.getElementById('leadPopupOverlay');
  const leadPopupCard = document.getElementById('leadPopupCard');
  const closeLeadPopup = document.getElementById('closeLeadPopup');
  const leadPopupStep1 = document.getElementById('leadPopupStep1');
  const leadPopupStep2 = document.getElementById('leadPopupStep2');
  const leadPopupStepSuccess = document.getElementById('leadPopupStepSuccess');
  const mobileSheetInitial = document.getElementById('mobileSheetInitial');
  const mobileRequestDemoBtn = document.getElementById('mobileRequestDemoBtn');
  const backToStep1 = document.getElementById('backToStep1');
  const leadConsultationForm = document.getElementById('leadConsultationForm');
  const leadSelectedBusiness = document.getElementById('leadSelectedBusiness');
  const leadPopupMsgeBtn = document.getElementById('leadPopupMsgeBtn');
  const mobileMsgeBtn = document.getElementById('mobileMsgeBtn');

  let timeElapsed30 = false;
  let hasScrolled50 = false;
  let popupTriggered = false;

  const popupDismissedKey = 'akosnow-lead-popup-dismissed';
  const popupSubmittedKey = 'akosnow-lead-popup-submitted';

  const checkThrottle = () => {
    const dismissedTime = localStorage.getItem(popupDismissedKey);
    const submitted = localStorage.getItem(popupSubmittedKey);
    
    if (submitted === 'true') return false; 
    if (dismissedTime) {
      const elapsedDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (elapsedDays < 14) {
        return false; 
      }
    }
    return true;
  };

  const showLeadPopup = () => {
    if (popupTriggered || !checkThrottle()) return;
    if (window.akosnowFormSubmitted) return;

    popupTriggered = true;
    if (leadPopupStepSuccess) leadPopupStepSuccess.style.display = 'none';
    if (leadPopupStep1) leadPopupStep1.style.display = 'block';
    if (leadPopupStep2) leadPopupStep2.style.display = 'none';
    if (leadPopupCard) leadPopupCard.classList.remove('mobile-sheet-active');

    leadPopupOverlay.style.display = 'flex';
  };

  window.triggerIndustryPopup = (business) => {
    if (leadPopupOverlay && leadSelectedBusiness) {
      leadSelectedBusiness.value = business;
      
      if (leadPopupStepSuccess) leadPopupStepSuccess.style.display = 'none';
      if (leadPopupStep1) leadPopupStep1.style.display = 'none';
      if (leadPopupStep2) leadPopupStep2.style.display = 'block';
      
      leadPopupOverlay.style.display = 'flex';
      
      if (window.innerWidth < 768) {
        leadPopupCard.classList.add('mobile-sheet-active');
      }
    }
  };

  const closePopupHandler = () => {
    leadPopupOverlay.style.display = 'none';
    localStorage.setItem(popupDismissedKey, Date.now().toString());
  };

  if (leadPopupOverlay) {
    // 30 seconds timer trigger
    setTimeout(() => {
      timeElapsed30 = true;
      if (hasScrolled50) {
        showLeadPopup();
      }
    }, 30000); // 30 seconds

    // Scroll depth trigger listener
    window.addEventListener('scroll', () => {
      if (popupTriggered) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50) {
        hasScrolled50 = true;
        if (timeElapsed30) {
          showLeadPopup();
        }
      }
    });

    closeLeadPopup.addEventListener('click', closePopupHandler);
    
    leadPopupOverlay.addEventListener('click', (e) => {
      if (e.target === leadPopupOverlay && window.innerWidth >= 768) {
        closePopupHandler();
      }
    });

    const optionBtns = document.querySelectorAll('.lead-opt-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const business = btn.getAttribute('data-business');
        leadSelectedBusiness.value = business;
        
        leadPopupStep1.style.display = 'none';
        leadPopupStep2.style.display = 'block';
        
        if (window.innerWidth < 768) {
          leadPopupCard.classList.add('mobile-sheet-active');
        }
      });
    });

    backToStep1.addEventListener('click', () => {
      leadPopupStep2.style.display = 'none';
      leadPopupStep1.style.display = 'block';
    });

    mobileRequestDemoBtn.addEventListener('click', () => {
      leadPopupCard.classList.add('mobile-sheet-active');
      leadPopupStep1.style.display = 'block';
    });

    if (mobileMsgeBtn) {
      mobileMsgeBtn.addEventListener('click', () => {
        leadPopupCard.classList.add('mobile-sheet-active');
        leadPopupStep1.style.display = 'block';
      });
    }

    leadConsultationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const leadEmail = document.getElementById('leadPopupEmail');
      const leadPhone = document.getElementById('leadPopupPhone');
      const leadEmailErr = document.getElementById('leadPopupEmailError');
      const leadPhoneErr = document.getElementById('leadPopupPhoneError');

      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValid = validateField(leadEmail, leadEmailErr, emailReg.test(leadEmail.value.trim()), "Valid email is required.");
      const phoneValid = validateField(leadPhone, leadPhoneErr, leadPhone.value.trim().replace(/\D/g, '').length >= 7, "Valid phone number is required.");

      if (emailValid && phoneValid) {
        const submitBtn = leadConsultationForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Requesting...";

        setTimeout(() => {
          triggerMsgeNotification("Consultation Popup Form", {
            name: "Interested Lead",
            company: "Selected: " + leadSelectedBusiness.value,
            email: leadEmail.value,
            phone: leadPhone.value,
            product: leadSelectedBusiness.value
          });
          sendMsgeFirestoreAlert("Consultation Popup Form", {
            name: "Interested Lead",
            company: "Selected: " + leadSelectedBusiness.value,
            email: leadEmail.value,
            phone: leadPhone.value,
            product: leadSelectedBusiness.value
          });

          leadPopupStep2.style.display = 'none';
          leadPopupStepSuccess.style.display = 'block';
          document.getElementById('successPopupTitle').textContent = "Request Submitted";
          document.getElementById('successPopupDesc').innerHTML = `We received your consultation request for <strong>${escapeHTML(leadSelectedBusiness.value)}</strong>! A software consultant will contact you shortly.`;
          
          localStorage.setItem(popupSubmittedKey, 'true');
          window.akosnowFormSubmitted = true;

          document.getElementById('closeSuccessPopup').addEventListener('click', () => {
            leadPopupOverlay.style.display = 'none';
          });
        }, 1500);
      }
    });

    if (leadPopupMsgeBtn) {
      leadPopupMsgeBtn.addEventListener('click', () => {
        const leadEmail = document.getElementById('leadPopupEmail');
        const leadPhone = document.getElementById('leadPopupPhone');
        const leadEmailErr = document.getElementById('leadPopupEmailError');
        const leadPhoneErr = document.getElementById('leadPopupPhoneError');

        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = validateField(leadEmail, leadEmailErr, emailReg.test(leadEmail.value.trim()), "Valid email is required.");
        const phoneValid = validateField(leadPhone, leadPhoneErr, leadPhone.value.trim().replace(/\D/g, '').length >= 7, "Valid phone number is required.");

        if (emailValid && phoneValid) {
          leadPopupMsgeBtn.disabled = true;
          leadPopupMsgeBtn.textContent = "Triggering...";

          setTimeout(() => {
            triggerMsgeNotification("MSGE Popup Button", {
              name: "Demo Lead",
              company: "Selected: " + leadSelectedBusiness.value,
              email: leadEmail.value,
              phone: leadPhone.value,
              product: leadSelectedBusiness.value
            });
            sendMsgeFirestoreAlert("MSGE Popup Button", {
              name: "Demo Lead",
              company: "Selected: " + leadSelectedBusiness.value,
              email: leadEmail.value,
              phone: leadPhone.value,
              product: leadSelectedBusiness.value
            });

            leadPopupStep2.style.display = 'none';
            leadPopupStepSuccess.style.display = 'block';
            document.getElementById('successPopupTitle').textContent = "Alert Dispatched!";
            document.getElementById('successPopupDesc').innerHTML = `A live demo alert for <strong>${escapeHTML(leadSelectedBusiness.value)}</strong> has been successfully dispatched to MSGE!`;
            
            localStorage.setItem(popupSubmittedKey, 'true');
            window.akosnowFormSubmitted = true;

            document.getElementById('closeSuccessPopup').addEventListener('click', () => {
              leadPopupOverlay.style.display = 'none';
            });
          }, 1000);
        }
      });
    }
  }

  // ==========================================================================
  // 12. MSGE Gateway Notification Dispatcher
  // ==========================================================================
  const triggerMsgeNotification = (formType, leadData) => {
    // 1. Create a Toast Container if it doesn't exist
    let toastContainer = document.getElementById('msgeToastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'msgeToastContainer';
      toastContainer.className = 'msge-toast-container';
      document.body.appendChild(toastContainer);
    }

    // 2. Format details into a payload
    const timestamp = new Date().toISOString();
    const payload = {
      gateway_key: "msge_akosnow_pub_77x82_prod",
      sender_identity: "Website Integration Client",
      recipient_account: "sales@akosnow.com",
      message_channel: "Website Leads Stream",
      timestamp: timestamp,
      payload_data: {
        form_source: formType,
        client_name: leadData.name || "N/A",
        client_company: leadData.company || "N/A",
        client_email: leadData.email || "N/A",
        client_phone: leadData.phone || "N/A",
        product_interest: leadData.product || "N/A"
      }
    };

    // 3. Log simulated POST details to console
    console.group("📡 Akosnow MSGE Gateway API Call");
    console.log("POST https://api.akosnow.com/msge/v1/send HTTP/1.1");
    console.log("Content-Type: application/json");
    console.log("Authorization: Bearer " + payload.gateway_key);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.groupEnd();

    // 4. Construct live desktop alert card
    const toastCard = document.createElement('div');
    toastCard.className = 'msge-toast-card';
    
    const formattedMessage = `[MSGE GATEWAY RECEIVED]
New Form Submission via website!
Source: ${escapeHTML(formType)}
Name: ${escapeHTML(leadData.name)}
Company: ${escapeHTML(leadData.company || 'N/A')}
Email: ${escapeHTML(leadData.email)}
Phone: ${escapeHTML(leadData.phone)}
Interest: ${escapeHTML(leadData.product)}`;

    toastCard.innerHTML = `
      <div class="msge-toast-header">
        <div class="msge-toast-logo-block">
          <span class="msge-toast-logo">💬</span>
          <span class="msge-toast-appname">Akosnow MSGE</span>
          <span class="msge-toast-badge">Live Gateway</span>
        </div>
        <button class="msge-toast-close" aria-label="Close alert">&times;</button>
      </div>
      <div class="msge-toast-body">${formattedMessage}</div>
      <div class="msge-toast-footer">
        <span>To: sales@akosnow.com</span>
        <span>${new Date().toLocaleTimeString()}</span>
      </div>
    `;

    // 5. Append and configure dismissal
    toastContainer.appendChild(toastCard);

    const closeBtn = toastCard.querySelector('.msge-toast-close');
    closeBtn.addEventListener('click', () => {
      toastCard.classList.add('fade-out');
      setTimeout(() => toastCard.remove(), 300);
    });

    setTimeout(() => {
      if (toastCard.parentElement) {
        toastCard.classList.add('fade-out');
        setTimeout(() => toastCard.remove(), 300);
      }
    }, 7000);
  };

  // ==========================================================================
  // 13. sendMsgeFirestoreAlert Integration (via REST API)
  // ==========================================================================
  const sendMsgeFirestoreAlert = async (formType, leadData) => {
    try {
      const savedApiKey = localStorage.getItem('msge_user_api_key');
      const payload = {
        formType: formType,
        name: leadData.name,
        company: leadData.company,
        email: leadData.email,
        phone: leadData.phone,
        product: leadData.product
      };

      if (savedApiKey) {
        payload.apiKey = savedApiKey;
      }

      const response = await fetch("http://localhost:5001/api/business/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        console.log("Successfully synchronized form lead message with MSGE backend API!");
      } else {
        console.warn("Backend API returned failure:", data.error);
      }
    } catch (err) {
      console.error("Error writing message to MSGE backend API:", err);
    }
  };

});
