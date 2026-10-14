/**
 * YKC One — Interactive Web Portal & Deletion Engine
 * CSI Yesu Krupalaya Church, Mysuru
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Tab Switching Logic ──────────────────────────────────────────────────
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navTabs = document.getElementById('navTabs');

  function switchTab(tabId, updateHash = true) {
    if (!tabId) tabId = 'overview';
    const targetContent = document.getElementById(`tab-${tabId}`);
    if (!targetContent) return;

    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    if (updateHash) {
      history.pushState(null, null, `#${tabId}`);
    }

    // Close mobile nav menu if open
    if (navTabs) navTabs.classList.remove('mobile-open');

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle Tab Click
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Handle Hash on Load and Change
  function handleHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      switchTab(hash, false);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  // Mobile Menu Toggle
  if (mobileToggle && navTabs) {
    mobileToggle.addEventListener('click', () => {
      navTabs.classList.toggle('mobile-open');
    });
  }

  // ── Account Deletion Form Handling ───────────────────────────────────────
  const deletionForm = document.getElementById('deletionForm');
  const successBox = document.getElementById('deletionSuccessBox');
  const receiptId = document.getElementById('receiptId');
  const receiptMember = document.getElementById('receiptMember');
  const receiptContact = document.getElementById('receiptContact');
  const receiptScope = document.getElementById('receiptScope');
  const gmailWebBtn = document.getElementById('gmailWebBtn');
  const mailtoBtn = document.getElementById('mailtoBtn');
  const copyDetailsBtn = document.getElementById('copyDetailsBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  const scopeFull = document.getElementById('scopeFull');
  const otherScopes = [
    document.getElementById('scopeGeo'),
    document.getElementById('scopeProfile')
  ].filter(Boolean);

  let fullEmailText = '';

  // If full account is checked, uncheck individual partial components
  if (scopeFull) {
    scopeFull.addEventListener('change', () => {
      if (scopeFull.checked) {
        otherScopes.forEach(s => { if (s) s.checked = false; });
      }
    });
  }

  otherScopes.forEach(s => {
    if (!s) return;
    s.addEventListener('change', () => {
      if (s.checked && scopeFull) {
        scopeFull.checked = false;
      }
    });
  });

  if (deletionForm) {
    deletionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const memberName = document.getElementById('memberName').value.trim();
      const contactInfo = document.getElementById('contactInfo').value.trim();
      const reason = document.getElementById('deletionReason').value.trim();

      const selectedBoxes = Array.from(document.querySelectorAll('input[name="deleteScope"]:checked'))
        .map(cb => cb.value);

      if (selectedBoxes.length === 0) {
        alert('Please select at least one item to delete.');
        return;
      }

      // Generate verification receipt ID
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const refId = 'YKC-DEL-' + randomCode;
      const targetDevEmail = 'reynold29clare@gmail.com';

      // Update UI elements
      if (receiptId) receiptId.textContent = refId;
      if (receiptMember) receiptMember.textContent = memberName;
      if (receiptContact) receiptContact.textContent = contactInfo;
      if (receiptScope) receiptScope.textContent = selectedBoxes.join(', ');

      // Formulate Subject & Body
      const subject = `[YKC One] Account & Data Deletion Request - ${refId}`;
      const body =
`Hello Reynold,

I am requesting the deletion of my account / personal data from YKC One (CSI Yesu Krupalaya Church):

• Reference Code: ${refId}
• Parish Member / Family Name: ${memberName}
• Registered Contact (Phone / Email): ${contactInfo}
• Requested Deletion Scope:
  - ${selectedBoxes.join('\n  - ')}
` + (reason ? `\n• Additional Notes / Remarks:\n  ${reason}\n` : '') +
`\n• Submitted At: ${new Date().toLocaleString()} (Local Time)

Please process this request and permanently remove the specified records and login credentials.

Thank you.`;

      fullEmailText = `To: ${targetDevEmail}\nSubject: ${subject}\n\n${body}`;

      const subjectEncoded = encodeURIComponent(subject);
      const bodyEncoded = encodeURIComponent(body);

      // Direct Gmail Web Compose URL
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetDevEmail}&su=${subjectEncoded}&body=${bodyEncoded}`;
      if (gmailWebBtn) gmailWebBtn.href = gmailUrl;

      // Native Mailto Link
      const mailtoUrl = `mailto:${targetDevEmail}?subject=${subjectEncoded}&body=${bodyEncoded}`;
      if (mailtoBtn) mailtoBtn.href = mailtoUrl;

      // Show success receipt
      if (successBox) {
        successBox.classList.add('visible');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Copy Details Handler
  if (copyDetailsBtn) {
    copyDetailsBtn.addEventListener('click', () => {
      if (!fullEmailText) return;
      navigator.clipboard.writeText(fullEmailText).then(() => {
        if (copyBtnText) copyBtnText.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Request Details';
        }, 3000);
      }).catch(() => {
        alert('Request Details:\n\n' + fullEmailText);
      });
    });
  }
});
