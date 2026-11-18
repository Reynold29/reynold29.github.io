// YKC One — small progressive enhancements. Every page reads fine without this file.
(function () {
  "use strict";

  const DEVELOPER_EMAIL = "reynold29clare@gmail.com";
  const SCROLL_BORDER_OFFSET = 8;
  const COPY_RESET_MS = 3000;

  // The old site used tabs at #privacy and #delete-account. Store listings and shared
  // links may still point there, so send them to the real pages.
  const LEGACY_HASHES = {
    "#privacy": "privacy.html",
    "#delete-account": "account-deletion.html"
  };

  function redirectLegacyHash() {
    const target = LEGACY_HASHES[window.location.hash];
    const onIndex = !/\/(privacy|account-deletion)\.html$/.test(window.location.pathname);
    if (target && onIndex) window.location.replace(target);
  }

  function initNav() {
    const nav = document.querySelector(".site-nav");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("nav-links");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_BORDER_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!toggle || !links) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      links.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ---------- Deletion request (account-deletion.html) ----------

  function makeReference() {
    const bytes = new Uint8Array(4);
    window.crypto.getRandomValues(bytes);
    const code = Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
    return "YKC-DEL-" + code;
  }

  function buildRequest({ reference, name, contact, scopes, notes }) {
    const subject = `[YKC One] Account & Data Deletion Request - ${reference}`;
    const lines = [
      "Hello Reynold,",
      "",
      "I am requesting the deletion of my account / personal data from YKC One (CSI Yesu Krupalaya Church):",
      "",
      `• Reference Code: ${reference}`,
      `• Parish Member / Family Name: ${name}`,
      `• Registered Contact (Phone / Email): ${contact}`,
      "• Requested Deletion Scope:",
      ...scopes.map((s) => `  - ${s}`)
    ];
    if (notes) lines.push("", "• Additional Notes / Remarks:", `  ${notes}`);
    lines.push(
      "",
      `• Submitted At: ${new Date().toLocaleString()} (Local Time)`,
      "",
      "Please process this request and permanently remove the specified records and login credentials.",
      "",
      "Thank you."
    );
    const body = lines.join("\n");
    return { subject, body, plain: `To: ${DEVELOPER_EMAIL}\nSubject: ${subject}\n\n${body}` };
  }

  function initDeletionForm() {
    const form = document.getElementById("deletionForm");
    if (!form) return;

    const errorBox = document.getElementById("deletion-error");
    const errorText = errorBox.querySelector("[data-message]");
    const receipt = document.getElementById("deletionReceipt");
    const nameInput = document.getElementById("memberName");
    const contactInput = document.getElementById("contactInfo");
    const notesInput = document.getElementById("deletionReason");
    const scopeFieldset = document.getElementById("scopeFieldset");
    const scopeFull = document.getElementById("scopeFull");
    const partialScopes = [document.getElementById("scopeGeo"), document.getElementById("scopeProfile")].filter(Boolean);
    const copyBtn = document.getElementById("copyDetailsBtn");
    const copyLabel = document.getElementById("copyBtnText");
    let requestText = "";

    // A full wipe already covers the partial options, so keep the choices exclusive.
    scopeFull.addEventListener("change", () => {
      if (scopeFull.checked) partialScopes.forEach((s) => { s.checked = false; });
    });
    partialScopes.forEach((s) => s.addEventListener("change", () => {
      if (s.checked) scopeFull.checked = false;
    }));

    const showError = (message, focusEl) => {
      errorText.textContent = message;
      errorBox.hidden = false;
      if (focusEl) focusEl.focus();
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorBox.hidden = true;
      [nameInput, contactInput].forEach((el) => el.removeAttribute("aria-invalid"));
      scopeFieldset.removeAttribute("aria-invalid");

      const name = nameInput.value.trim();
      const contact = contactInput.value.trim();
      const scopes = Array.from(form.querySelectorAll('input[name="deleteScope"]:checked'), (cb) => cb.value);

      if (!name) {
        nameInput.setAttribute("aria-invalid", "true");
        showError("Please enter the parishioner or family head name.", nameInput);
        return;
      }
      if (!contact) {
        contactInput.setAttribute("aria-invalid", "true");
        showError("Please enter the mobile number or email you use to sign in.", contactInput);
        return;
      }
      if (scopes.length === 0) {
        scopeFieldset.setAttribute("aria-invalid", "true");
        showError("Please choose what you would like deleted.", form.querySelector('input[name="deleteScope"]'));
        return;
      }

      const reference = makeReference();
      const request = buildRequest({ reference, name, contact, scopes, notes: notesInput.value.trim() });
      requestText = request.plain;

      const subject = encodeURIComponent(request.subject);
      const body = encodeURIComponent(request.body);
      document.getElementById("receiptId").textContent = reference;
      document.getElementById("receiptMember").textContent = name;
      document.getElementById("receiptContact").textContent = contact;
      document.getElementById("receiptScope").textContent = scopes.join(", ");
      document.getElementById("gmailWebBtn").href =
        `https://mail.google.com/mail/?view=cm&fs=1&to=${DEVELOPER_EMAIL}&su=${subject}&body=${body}`;
      document.getElementById("mailtoBtn").href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;

      receipt.hidden = false;
      receipt.focus();
      receipt.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    copyBtn.addEventListener("click", async () => {
      if (!requestText) return;
      try {
        await navigator.clipboard.writeText(requestText);
        copyLabel.textContent = "Copied";
      } catch (err) {
        copyLabel.textContent = "Copy failed, use the email buttons";
      }
      window.setTimeout(() => { copyLabel.textContent = "Copy request text"; }, COPY_RESET_MS);
    });
  }

  redirectLegacyHash();
  initNav();
  initDeletionForm();
})();
