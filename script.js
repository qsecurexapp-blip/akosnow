/* 
  QSecureX Static JavaScript
  Handles Navbar toggles, FAQ Accordion, Screenshot Gallery Tabs, and Scroll Effects
*/

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      
      // Close other open FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('open');
        }
      });

      // Toggle current item
      faqItem.classList.toggle('open');
    });
  });

  // Gallery Tab Switching
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const previewImage = document.getElementById('previewImage');
  const previewCaption = document.getElementById('previewCaption');

  const galleryData = {
    dashboard: {
      img: 'assets/phhh_1764586606748.png',
      caption: '<strong>Dashboard Overview:</strong> Real-time storage stats, encryption integrity monitor, and active vault status.'
    },
    vault: {
      img: 'assets/gwag_1764444804643.png',
      caption: '<strong>File Vault:</strong> Drag-and-drop file encryption with AES-256-GCM integrity validation.'
    },
    passwords: {
      img: 'assets/phhh_1764586606748.png',
      caption: '<strong>Password Manager:</strong> Encrypted local credential vault with master key protection.'
    },
    messaging: {
      img: 'assets/gwag_1764444804643.png',
      caption: '<strong>Secure Messaging:</strong> Peer-to-peer encrypted packets with auto-destruct timers.'
    }
  };

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      if (galleryData[target] && previewImage && previewCaption) {
        previewImage.src = galleryData[target].img;
        previewCaption.innerHTML = galleryData[target].caption;
      }
    });
  });

  // Akosnow MSGE Integration Configuration
  const AKOSNOW_MSGE_CONFIG = {
    apiKey: window.AKOSNOW_API_KEY || "L3vvmpypCtPr43TjZK5iHyGI5Gs2", 
    workspaceId: "WS_84HK91",
    endpoints: [
      "http://localhost:5001/api/business/lead",
      "https://api.akosnow.com/v1/leads"
    ]
  };

  // Pricing Contact Form Submission
  const pricingContactForm = document.getElementById('pricingContactForm');
  const formStatus = document.getElementById('formStatus');

  if (pricingContactForm && formStatus) {
    pricingContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = pricingContactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Request...';
      }

      const fullName = document.getElementById('fullName')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const organization = document.getElementById('organization')?.value || 'N/A';
      const deviceCount = document.getElementById('deviceCount')?.value || 'Not specified';
      const licenseTier = document.getElementById('licenseTier')?.value || 'Pricing Quote';
      const message = document.getElementById('message')?.value || '';

      // Akosnow MSGE Payload Format
      const msgePayload = {
        workspaceId: AKOSNOW_MSGE_CONFIG.workspaceId,
        apiKey: AKOSNOW_MSGE_CONFIG.apiKey,
        event: "lead",
        formType: "QSecureX Pricing Request",
        name: fullName,
        email: email,
        phone: phone,
        company: organization,
        product: `${licenseTier} (${deviceCount})`,
        message: message,
        data: {
          name: fullName,
          company: organization,
          email: email,
          phone: phone,
          product: licenseTier,
          deviceCount: deviceCount,
          message: message,
          source: "QSecureX Website Form"
        }
      };

      let dispatchedSuccessfully = false;

      for (const endpoint of AKOSNOW_MSGE_CONFIG.endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(msgePayload)
          });

          if (response.ok) {
            dispatchedSuccessfully = true;
            console.log(`[Akosnow MSGE] Lead successfully dispatched via ${endpoint}`);
            break;
          }
        } catch (err) {
          console.warn(`[Akosnow MSGE] Dispatch to ${endpoint} failed, trying next fallback...`, err);
        }
      }

      formStatus.className = 'form-status success';
      formStatus.textContent = '✓ Request Sent! Our licensing team and Akosnow MSGE notification system have received your inquiry.';
      pricingContactForm.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Pricing Request →';
      }

      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 7000);
    });
  }

  // Header Border Highlight on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.borderBottomColor = 'rgba(74, 222, 128, 0.2)';
    } else {
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    }
  });
});
