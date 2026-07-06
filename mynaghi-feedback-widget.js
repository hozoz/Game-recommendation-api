/* =====================================================================
   MY NAGHI — Customer Feedback Widget (single-file embed build)
   ---------------------------------------------------------------------
   Drop-in version of widget.html. Injects its own styles + font and
   renders the floating feedback button. Add ONE line to the site:

     <script src="/path/to/mynaghi-feedback-widget.js" defer></script>

   or paste this whole file inside a <script> ... </script> block just
   before </body>. No other markup or files needed.
   To edit text, colours, or the Google Form, see widget.html / the
   INTEGRATION_GUIDE. (This file is generated from widget.html.)
   ===================================================================== */
(function () {
  "use strict";
  // 1) Load the Space Grotesk web font (falls back to system fonts).
  if (!document.getElementById("mn-feedback-font")) {
    var f = document.createElement("link");
    f.id = "mn-feedback-font"; f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(f);
  }
  // 2) Inject the widget stylesheet (scoped under #mn-feedback-root).
  if (!document.getElementById("mn-feedback-style")) {
    var st = document.createElement("style");
    st.id = "mn-feedback-style";
    st.textContent = ")\n    - Text / i18n .... MYNAGHI_FEEDBACK.i18n\n    - Questions ...... MYNAGHI_FEEDBACK.questions\n    - Google Form .... MYNAGHI_FEEDBACK.form\n    - User types ..... MYNAGHI_FEEDBACK.detectUserType()\n\n  No build step. No frameworks. Vanilla JS only.\n  =====================================================================\n-->\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>MY NAGHI — Feedback Widget</title>\n\n  <!-- Space Grotesk: the single typeface for the whole widget -->\n  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n  <link\n    href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap\"\n    rel=\"stylesheet\"\n  />\n\n  <style>\n    /* ============================================================\n       DESIGN TOKENS  —  change these to re-theme the whole widget\n       ============================================================ */\n    :root {\n      /* Brand palette */\n      --mn-primary:        #964BFA;  /* Lilac — CTAs, accents, selection */\n      --mn-primary-dark:   #7d34e0;  /* Hover / pressed lilac            */\n      --mn-secondary:      #6B7D99;  /* Blue-grey — secondary text/UI    */\n      --mn-secondary-soft: #9AA7BC;  /* Lighter blue-grey — footer/hints */\n      --mn-sand:           #EDE5D0;  /* Warm sand — header/card bg        */\n      --mn-text:           #1A1A1A;  /* Primary text                     */\n      --mn-white:          #FFFFFF;\n      --mn-grey-50:        #F5F5F5;  /* Footer / subtle fills            */\n      --mn-grey-100:       #EDEDED;\n      --mn-grey-200:       #E2E2E2;  /* Borders                          */\n      --mn-grey-900:       #2A2A2A;\n\n      /* Shape */\n      --mn-radius-ui:   8px;\n      --mn-radius-card: 16px;\n      --mn-radius-pill: 9999px;\n\n      /* Elevation */\n      --mn-shadow:        0 4px 16px rgba(26, 26, 26, 0.10);\n      --mn-shadow-accent: 0 4px 24px rgba(150, 75, 250, 0.20);\n\n      /* Motion */\n      --mn-ease: cubic-bezier(0.25, 0.1, 0.25, 1);\n      --mn-transition: 200ms var(--mn-ease);\n\n      /* Typography */\n      --mn-font: \"Space Grotesk\", \"Segoe UI\", system-ui, -apple-system, sans-serif;\n\n      /* Layering — high enough to sit above typical site chrome */\n      --mn-z: 2147483000;\n    }\n\n    /* ============================================================\n       SCOPING  —  every rule is prefixed with #mn-feedback-root so\n       the widget never leaks styles into the host page.\n       ============================================================ */\n    #mn-feedback-root,\n    #mn-feedback-root *,\n    #mn-feedback-root *::before,\n    #mn-feedback-root *::after {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0;\n    }\n\n    #mn-feedback-root {\n      font-family: var(--mn-font);\n      color: var(--mn-text);\n      -webkit-font-smoothing: antialiased;\n      text-rendering: optimizeLegibility;\n    }\n\n    /* ---------- Floating trigger button ---------- */\n    #mn-feedback-root .mn-fab {\n      position: fixed;\n      bottom: 24px;\n      right: 24px;\n      inset-inline-end: 24px;   /* flips to bottom-left under RTL */\n      inset-inline-start: auto;\n      z-index: var(--mn-z);\n      width: 56px;\n      height: 56px;\n      border: none;\n      border-radius: var(--mn-radius-pill);\n      background: var(--mn-primary);\n      color: var(--mn-white);\n      font-size: 26px;\n      line-height: 1;\n      cursor: pointer;\n      box-shadow: var(--mn-shadow-accent);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: transform var(--mn-transition), box-shadow var(--mn-transition),\n        opacity var(--mn-transition), visibility var(--mn-transition);\n    }\n    #mn-feedback-root .mn-fab:hover {\n      transform: translateY(-3px);\n      box-shadow: 0 8px 28px rgba(150, 75, 250, 0.32);\n    }\n    #mn-feedback-root .mn-fab:active { transform: translateY(-1px); }\n    #mn-feedback-root .mn-fab:focus-visible {\n      outline: 3px solid var(--mn-primary-dark);\n      outline-offset: 3px;\n    }\n    /* Hidden while the modal is open */\n    #mn-feedback-root.mn-open .mn-fab {\n      opacity: 0;\n      visibility: hidden;\n      pointer-events: none;\n    }\n\n    /* ---------- Backdrop ---------- */\n    #mn-feedback-root .mn-backdrop {\n      position: fixed;\n      inset: 0;\n      z-index: var(--mn-z);\n      background: rgba(26, 26, 26, 0.5);\n      -webkit-backdrop-filter: blur(4px);\n      backdrop-filter: blur(4px);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      padding: 16px;\n      opacity: 0;\n      visibility: hidden;\n      transition: opacity var(--mn-transition), visibility var(--mn-transition);\n    }\n    #mn-feedback-root.mn-open .mn-backdrop {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    /* ---------- Modal card ---------- */\n    #mn-feedback-root .mn-modal {\n      width: 100%;\n      max-width: 448px;\n      max-height: calc(100vh - 32px);\n      overflow-y: auto;\n      background: var(--mn-white);\n      border-radius: var(--mn-radius-card);\n      box-shadow: var(--mn-shadow);\n      transform: translateY(24px) scale(0.98);\n      opacity: 0;\n      transition: transform 250ms var(--mn-ease), opacity 250ms var(--mn-ease);\n    }\n    #mn-feedback-root.mn-open .mn-modal {\n      transform: translateY(0) scale(1);\n      opacity: 1;\n    }\n    /* Respect users who prefer reduced motion */\n    @media (prefers-reduced-motion: reduce) {\n      #mn-feedback-root .mn-fab,\n      #mn-feedback-root .mn-backdrop,\n      #mn-feedback-root .mn-modal,\n      #mn-feedback-root .mn-emoji { transition: none; }\n    }\n\n    /* ---------- Header ---------- */\n    #mn-feedback-root .mn-header {\n      position: relative;\n      background: var(--mn-sand);\n      padding: 24px;\n      border-radius: var(--mn-radius-card) var(--mn-radius-card) 0 0;\n    }\n    #mn-feedback-root .mn-title {\n      font-size: 24px;\n      font-weight: 600;\n      letter-spacing: -0.02em;\n      line-height: 1.25;\n      color: var(--mn-text);\n      padding-inline-end: 36px; /* leave room for the close button */\n    }\n    #mn-feedback-root .mn-subtitle {\n      margin-top: 6px;\n      font-size: 14px;\n      font-weight: 400;\n      color: var(--mn-secondary);\n      line-height: 1.5;\n    }\n    #mn-feedback-root .mn-close {\n      position: absolute;\n      top: 20px;\n      inset-inline-end: 20px;\n      width: 32px;\n      height: 32px;\n      border: none;\n      border-radius: var(--mn-radius-pill);\n      background: rgba(26, 26, 26, 0.06);\n      color: var(--mn-text);\n      font-size: 18px;\n      line-height: 1;\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: background var(--mn-transition);\n    }\n    #mn-feedback-root .mn-close:hover { background: rgba(26, 26, 26, 0.12); }\n    #mn-feedback-root .mn-close:focus-visible {\n      outline: 2px solid var(--mn-primary);\n      outline-offset: 2px;\n    }\n\n    /* Language toggle */\n    #mn-feedback-root .mn-lang {\n      display: inline-flex;\n      gap: 4px;\n      margin-top: 16px;\n      background: rgba(255, 255, 255, 0.55);\n      border-radius: var(--mn-radius-pill);\n      padding: 3px;\n    }\n    #mn-feedback-root .mn-lang button {\n      border: none;\n      background: transparent;\n      color: var(--mn-secondary);\n      font-family: var(--mn-font);\n      font-size: 12px;\n      font-weight: 600;\n      letter-spacing: 0.04em;\n      padding: 6px 16px;\n      border-radius: var(--mn-radius-pill);\n      cursor: pointer;\n      transition: background var(--mn-transition), color var(--mn-transition);\n    }\n    #mn-feedback-root .mn-lang button[aria-pressed=\"true\"] {\n      background: var(--mn-primary);\n      color: var(--mn-white);\n    }\n    #mn-feedback-root .mn-lang button:focus-visible {\n      outline: 2px solid var(--mn-primary);\n      outline-offset: 2px;\n    }\n\n    /* ---------- Body / steps ---------- */\n    #mn-feedback-root .mn-body { padding: 32px 24px; }\n    #mn-feedback-root .mn-step { display: none; }\n    #mn-feedback-root .mn-step.mn-active { display: block; }\n\n    /* Step 1 — emoji rating */\n    #mn-feedback-root .mn-emojis {\n      display: flex;\n      justify-content: center;\n      flex-wrap: wrap;\n      gap: 12px;\n    }\n    #mn-feedback-root .mn-emoji {\n      flex: 0 0 auto;\n      width: 56px;\n      min-height: 76px;\n      border: none;\n      background: transparent;\n      cursor: pointer;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 6px;\n      border-radius: var(--mn-radius-ui);\n      padding: 4px 2px;\n      transition: transform var(--mn-transition), opacity var(--mn-transition),\n        background var(--mn-transition);\n    }\n    #mn-feedback-root .mn-emoji .mn-emoji-glyph {\n      font-size: 40px;\n      line-height: 1;\n      opacity: 0.6;\n      transition: opacity var(--mn-transition), transform var(--mn-transition);\n    }\n    #mn-feedback-root .mn-emoji .mn-emoji-label {\n      font-size: 11px;\n      font-weight: 500;\n      color: var(--mn-secondary);\n      text-align: center;\n      line-height: 1.2;\n    }\n    #mn-feedback-root .mn-emoji:hover .mn-emoji-glyph,\n    #mn-feedback-root .mn-emoji:focus-visible .mn-emoji-glyph {\n      opacity: 1;\n      transform: scale(1.25);\n    }\n    #mn-feedback-root .mn-emoji:focus-visible {\n      outline: 2px solid var(--mn-primary);\n      outline-offset: 2px;\n    }\n    #mn-feedback-root .mn-emoji[aria-pressed=\"true\"] {\n      background: rgba(150, 75, 250, 0.10);\n    }\n    #mn-feedback-root .mn-emoji[aria-pressed=\"true\"] .mn-emoji-glyph { opacity: 1; }\n\n    /* Step 2 — follow-up */\n    #mn-feedback-root .mn-question {\n      font-size: 16px;\n      font-weight: 500;\n      line-height: 1.5;\n      color: var(--mn-text);\n      margin-bottom: 16px;\n    }\n    #mn-feedback-root .mn-selected-emoji {\n      font-size: 28px;\n      line-height: 1;\n      margin-bottom: 12px;\n    }\n    #mn-feedback-root .mn-textarea {\n      width: 100%;\n      min-height: 100px;\n      resize: vertical;\n      padding: 12px;\n      font-family: var(--mn-font);\n      font-size: 14px;\n      line-height: 1.6;\n      color: var(--mn-text);\n      background: var(--mn-white);\n      border: 1px solid var(--mn-grey-200);\n      border-radius: var(--mn-radius-ui);\n      outline: none;\n      transition: border-color var(--mn-transition), box-shadow var(--mn-transition);\n    }\n    #mn-feedback-root .mn-textarea::placeholder { color: var(--mn-secondary-soft); }\n    #mn-feedback-root .mn-textarea:focus {\n      border-color: var(--mn-primary);\n      box-shadow: 0 0 0 3px rgba(150, 75, 250, 0.12);\n    }\n    #mn-feedback-root .mn-charhint {\n      margin-top: 6px;\n      font-size: 12px;\n      color: var(--mn-secondary);\n      min-height: 16px;\n    }\n\n    /* Buttons */\n    #mn-feedback-root .mn-btn {\n      width: 100%;\n      border: none;\n      border-radius: var(--mn-radius-ui);\n      font-family: var(--mn-font);\n      cursor: pointer;\n      transition: background var(--mn-transition), transform var(--mn-transition),\n        box-shadow var(--mn-transition), opacity var(--mn-transition);\n    }\n    #mn-feedback-root .mn-btn-primary {\n      margin-top: 16px;\n      padding: 12px;\n      background: var(--mn-primary);\n      color: var(--mn-white);\n      font-size: 14px;\n      font-weight: 600;\n    }\n    #mn-feedback-root .mn-btn-primary:hover:not(:disabled) {\n      background: var(--mn-primary-dark);\n      box-shadow: var(--mn-shadow-accent);\n    }\n    #mn-feedback-root .mn-btn-primary:active:not(:disabled) { transform: scale(0.97); }\n    #mn-feedback-root .mn-btn-primary:disabled {\n      opacity: 0.7;\n      cursor: not-allowed;\n    }\n    #mn-feedback-root .mn-btn-ghost {\n      margin-top: 8px;\n      padding: 10px;\n      background: transparent;\n      color: var(--mn-secondary);\n      font-size: 14px;\n      font-weight: 500;\n      border: 1px solid var(--mn-grey-200);\n    }\n    #mn-feedback-root .mn-btn-ghost:hover { background: var(--mn-grey-50); }\n    #mn-feedback-root .mn-btn:focus-visible {\n      outline: 2px solid var(--mn-primary);\n      outline-offset: 2px;\n    }\n\n    /* Step 3 — thank you */\n    #mn-feedback-root .mn-thanks { text-align: center; padding: 16px 0; }\n    #mn-feedback-root .mn-thanks .mn-check {\n      width: 64px;\n      height: 64px;\n      margin: 0 auto 16px;\n      border-radius: var(--mn-radius-pill);\n      background: rgba(150, 75, 250, 0.12);\n      color: var(--mn-primary);\n      font-size: 32px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n    #mn-feedback-root .mn-thanks .mn-thanks-msg {\n      font-size: 16px;\n      font-weight: 500;\n      color: var(--mn-text);\n    }\n\n    /* ---------- Footer ---------- */\n    #mn-feedback-root .mn-footer {\n      background: var(--mn-grey-50);\n      padding: 16px;\n      text-align: center;\n      font-size: 12px;\n      color: var(--mn-secondary-soft);\n      border-radius: 0 0 var(--mn-radius-card) var(--mn-radius-card);\n    }\n\n    /* ---------- RTL ---------- */\n    #mn-feedback-root[dir=\"rtl\"] .mn-title { padding-inline-end: 36px; }\n    #mn-feedback-root[dir=\"rtl\"] .mn-textarea { text-align: right; }\n\n    /* Visually-hidden helper for screen readers */\n    #mn-feedback-root .mn-sr-only {\n      position: absolute;\n      width: 1px; height: 1px;\n      padding: 0; margin: -1px;\n      overflow: hidden;\n      clip: rect(0, 0, 0, 0);\n      white-space: nowrap;\n      border: 0;\n    }\n\n    /* ---------- Small screens ---------- */\n    @media (max-width: 480px) {\n      #mn-feedback-root .mn-body { padding: 24px 20px; }\n      #mn-feedback-root .mn-header { padding: 20px; }\n      #mn-feedback-root .mn-title { font-size: 21px; }\n      #mn-feedback-root .mn-emoji { width: 52px; }\n      #mn-feedback-root .mn-emoji .mn-emoji-glyph { font-size: 34px; }\n      #mn-feedback-root .mn-fab { bottom: 16px; inset-inline-end: 16px; }\n    }\n  ";
    document.head.appendChild(st);
  }
  // 3) The widget itself.

  (function () {
    "use strict";

    /* ===============================================================
       CONFIGURATION  —  the only block most integrators need to edit.
       =============================================================== */
    var CONFIG = {
      /* Google Forms integration.
         See INTEGRATION_GUIDE.md → "Google Forms Setup" for how to find
         your form ID and each entry.* field ID. Leave as-is to run in
         "demo mode" (submissions are logged to the console, not sent). */
      form: {
        // MY NAGHI feedback form. Empty string => demo mode.
        formId: "1FAIpQLSfWGDbVNEAZ51sWrPXDLg6bO9psQNt3MVO2tGctykb9fDSbuw",
        // Map each captured field to its Google Forms entry ID.
        entries: {
          language: "entry.865595230",
          userType: "entry.1997750447",
          rating:   "entry.1636085875",
          feedback: "entry.1853539865",
          // No timestamp entry: Google Forms adds its own "Timestamp"
          // column automatically, so sending our own would duplicate it.
          pageUrl:  "entry.1871547041"
        }
      },

      /* Default language when the page language can't be detected.
         "en" or "ar". */
      defaultLang: "en",

      /* Force a user type (useful for QA). null = auto-detect from URL. */
      forceUserType: null,

      /* Auto-close delay (ms) after the thank-you screen appears. */
      autoCloseMs: 2000,

      /* Minimum characters required before the feedback can be sent. */
      minChars: 20
    };

    /* ===============================================================
       INTERNATIONALISATION  —  every visible string, EN + AR.
       =============================================================== */
    var I18N = {
      en: {
        dir: "ltr",
        fabAria: "Open feedback form",
        title: "How was your experience?",
        subtitle: "Your feedback helps us improve",
        close: "Close",
        step1Legend: "Rate your experience",
        ratingLabels: ["Very Poor", "Poor", "Okay", "Good", "Excellent"],
        placeholder: "Your answer...",
        charHint: function (n) { return n + " more character" + (n === 1 ? "" : "s") + " needed"; },
        submit: "Send Feedback",
        sending: "Sending…",
        back: "Back",
        thanks: "Thank you for your feedback!",
        footer: "✓ Powered by MY NAGHI",
        errorTitle: "Something went wrong",
        errorBody: "We couldn't send your feedback. Please try again."
      },
      ar: {
        dir: "rtl",
        fabAria: "افتح نموذج الملاحظات",
        title: "كيف كانت تجربتك؟",
        subtitle: "ملاحظاتك تساعدنا على التحسين",
        close: "إغلاق",
        step1Legend: "قيّم تجربتك",
        ratingLabels: ["سيئة جداً", "سيئة", "مقبولة", "جيدة", "ممتازة"],
        placeholder: "إجابتك...",
        charHint: function (n) { return "تحتاج إلى " + n + " حرف إضافي"; },
        submit: "إرسال الملاحظات",
        sending: "جارٍ الإرسال…",
        back: "رجوع",
        thanks: "شكراً على ملاحظاتك!",
        footer: "✓ برعاية ماي ناغي",
        errorTitle: "حدث خطأ ما",
        errorBody: "تعذّر إرسال ملاحظاتك. يرجى المحاولة مرة أخرى."
      }
    };

    /* Emoji set shared across languages (glyph order = rating 1..5). */
    var EMOJIS = ["😞", "😕", "😐", "🙂", "😊"];

    /* ===============================================================
       FOLLOW-UP QUESTIONS  —  [userType][lang][ratingIndex 0..4]
       =============================================================== */
    var QUESTIONS = {
      comparers: {
        en: [
          "Was the product comparison unclear or incomplete?",
          "Which product features would help your comparison?",
          "Did the comparison features help you decide?",
          "Which product are you leaning toward and why?",
          "Would you recommend our comparison tool to others?"
        ],
        ar: [
          "هل كانت مقارنة المنتجات غير واضحة أو غير مكتملة؟",
          "ما الميزات التي قد تساعدك في المقارنة؟",
          "هل ساعدتك ميزات المقارنة على اتخاذ القرار؟",
          "أي منتج تميل إليه ولماذا؟",
          "هل توصي الآخرين بأداة المقارنة لدينا؟"
        ]
      },
      viewers: {
        en: [
          "What product information was missing?",
          "What product details do you need to see?",
          "Were the product details clear enough for your decision?",
          "What helped you understand this product?",
          "Would you purchase this product?"
        ],
        ar: [
          "ما معلومات المنتج التي كانت ناقصة؟",
          "ما تفاصيل المنتج التي تحتاج إلى رؤيتها؟",
          "هل كانت تفاصيل المنتج واضحة بما يكفي لقرارك؟",
          "ما الذي ساعدك على فهم هذا المنتج؟",
          "هل ستشتري هذا المنتج؟"
        ]
      },
      searchers: {
        en: [
          "Was it hard to find what you needed?",
          "What products were you searching for?",
          "Did you find what you were looking for?",
          "What made the search easy?",
          "Would you search on our site again?"
        ],
        ar: [
          "هل كان من الصعب العثور على ما تحتاجه؟",
          "ما المنتجات التي كنت تبحث عنها؟",
          "هل وجدت ما كنت تبحث عنه؟",
          "ما الذي جعل البحث سهلاً؟",
          "هل ستبحث في موقعنا مرة أخرى؟"
        ]
      },
      buyers: {
        en: [
          "What went wrong during checkout?",
          "What made the checkout process difficult?",
          "Was the checkout process clear enough?",
          "What made checkout smooth for you?",
          "Would you shop with us again?"
        ],
        ar: [
          "ما الذي حدث بشكل خاطئ أثناء الدفع؟",
          "ما الذي جعل عملية الدفع صعبة؟",
          "هل كانت عملية الدفع واضحة بما يكفي؟",
          "ما الذي جعل عملية الدفع سلسة بالنسبة لك؟",
          "هل ستتسوق معنا مرة أخرى؟"
        ]
      },
      inquiries: {
        en: [
          "What was the issue with your inquiry?",
          "How could we help you better?",
          "Is your inquiry being resolved adequately?",
          "What helped you most?",
          "Are you satisfied with our response?"
        ],
        ar: [
          "ما المشكلة في استفسارك؟",
          "كيف يمكننا مساعدتك بشكل أفضل؟",
          "هل تتم معالجة استفسارك بشكل كافٍ؟",
          "ما الذي ساعدك أكثر؟",
          "هل أنت راضٍ عن ردنا؟"
        ]
      },
      "after-sales": {
        en: [
          "What's the issue with your order or account?",
          "What support do you need right now?",
          "Is your issue being handled well?",
          "What impressed you about our support?",
          "Would you order from us again?"
        ],
        ar: [
          "ما المشكلة في طلبك أو حسابك؟",
          "ما الدعم الذي تحتاجه الآن؟",
          "هل تتم معالجة مشكلتك بشكل جيد؟",
          "ما الذي أعجبك في دعمنا؟",
          "هل ستطلب منا مرة أخرى؟"
        ]
      },
      visitors: {
        en: [
          "What could we improve on our website?",
          "What information was missing?",
          "What could be better?",
          "What did you like most about our site?",
          "Would you recommend us to others?"
        ],
        ar: [
          "ما الذي يمكننا تحسينه في موقعنا؟",
          "ما المعلومات التي كانت ناقصة؟",
          "ما الذي يمكن أن يكون أفضل؟",
          "ما الذي أعجبك أكثر في موقعنا؟",
          "هل توصي بنا للآخرين؟"
        ]
      }
    };

    /* ===============================================================
       STATE
       =============================================================== */
    var state = {
      lang: CONFIG.defaultLang,
      userType: "visitors",
      rating: null,      // 1..5
      isOpen: false,
      lastFocused: null  // element to restore focus to on close
    };

    var el = {};         // cached DOM references
    var autoCloseTimer = null;

    /* ===============================================================
       USER-TYPE DETECTION
       Detects the customer journey from the current URL. Order matters:
       more specific journeys are checked before the "visitors" fallback.
       =============================================================== */
    function detectUserType() {
      if (CONFIG.forceUserType) return CONFIG.forceUserType;

      // Include hash so demo links like "#/checkout/" work too.
      var url = (location.pathname + location.search + location.hash).toLowerCase();

      // 1. Comparers — product comparison flows.
      if (/\/compare|compare\b/.test(url) && /\/product|\/compare/.test(url)) return "comparers";
      if (/\/compare(\/|\b)/.test(url)) return "comparers";

      // 2. Buyers — checkout / cart / payment.
      if (/\/checkout|\/cart|\/payment|\/basket/.test(url)) return "buyers";

      // 3. Searchers — site search.
      if (/\/search|[?&]q=|[?&]query=/.test(url)) return "searchers";

      // 4. After-sales — orders / account / order history.
      if (/\/orders|\/order-history|\/account|\/my-account/.test(url)) return "after-sales";

      // 5. Inquiries — support / contact / inquiry forms.
      if (/\/inquiry|\/inquiries|\/contact|\/support|\/help/.test(url)) return "inquiries";

      // 6. Viewers — product detail pages.
      if (/\/product(\/|s\/|-)|[?&]view/.test(url)) return "viewers";

      // 7. Visitors — everything else.
      return "visitors";
    }

    /* ===============================================================
       LANGUAGE DETECTION  —  from <html lang> or the browser.
       =============================================================== */
    function detectLang() {
      var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
      if (htmlLang.indexOf("ar") === 0) return "ar";
      if (htmlLang.indexOf("en") === 0) return "en";
      var nav = (navigator.language || "").toLowerCase();
      if (nav.indexOf("ar") === 0) return "ar";
      return CONFIG.defaultLang === "ar" ? "ar" : "en";
    }

    /* ===============================================================
       SMALL HELPERS
       =============================================================== */
    function t() { return I18N[state.lang]; }

    // Create an element with attributes + children in one call.
    function h(tag, attrs, children) {
      var node = document.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          if (k === "text") { node.textContent = attrs[k]; }
          else if (k === "html") { node.innerHTML = attrs[k]; }
          else { node.setAttribute(k, attrs[k]); }
        });
      }
      (children || []).forEach(function (c) {
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
      return node;
    }

    /* ===============================================================
       BUILD DOM  (once)
       =============================================================== */
    function build() {
      var root = h("div", { id: "mn-feedback-root" });

      /* Floating action button */
      el.fab = h("button", {
        type: "button",
        class: "mn-fab",
        "aria-haspopup": "dialog",
        text: "💬"
      });
      el.fab.appendChild(h("span", { class: "mn-sr-only", text: t().fabAria }));

      /* Backdrop + modal */
      el.backdrop = h("div", { class: "mn-backdrop" });
      el.modal = h("div", {
        class: "mn-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "mn-title"
      });

      /* ---- Header ---- */
      el.title = h("h2", { class: "mn-title", id: "mn-title" });
      el.subtitle = h("p", { class: "mn-subtitle" });
      el.close = h("button", { type: "button", class: "mn-close", "aria-label": t().close, html: "&times;" });

      el.langEn = h("button", { type: "button", "data-lang": "en", text: "EN" });
      el.langAr = h("button", { type: "button", "data-lang": "ar", text: "AR" });
      el.lang = h("div", { class: "mn-lang", role: "group", "aria-label": "Language" }, [el.langEn, el.langAr]);

      var header = h("div", { class: "mn-header" }, [el.close, el.title, el.subtitle, el.lang]);

      /* ---- Body ---- */
      // Step 1 — emoji rating
      el.emojiRow = h("div", { class: "mn-emojis", role: "group" });
      el.emojiButtons = EMOJIS.map(function (glyph, i) {
        var glyphSpan = h("span", { class: "mn-emoji-glyph", "aria-hidden": "true", text: glyph });
        var labelSpan = h("span", { class: "mn-emoji-label" });
        var btn = h("button", {
          type: "button",
          class: "mn-emoji",
          "data-rating": String(i + 1),
          "aria-pressed": "false"
        }, [glyphSpan, labelSpan]);
        btn._label = labelSpan; // stash for i18n updates
        return btn;
      });
      el.emojiButtons.forEach(function (b) { el.emojiRow.appendChild(b); });
      el.step1 = h("div", { class: "mn-step mn-active" }, [el.emojiRow]);

      // Step 2 — follow-up question
      el.selectedEmoji = h("div", { class: "mn-selected-emoji", "aria-hidden": "true" });
      el.question = h("label", { class: "mn-question", for: "mn-textarea" });
      el.textarea = h("textarea", {
        class: "mn-textarea",
        id: "mn-textarea",
        rows: "4",
        "aria-describedby": "mn-charhint"
      });
      el.charHint = h("div", { class: "mn-charhint", id: "mn-charhint", "aria-live": "polite" });
      el.submit = h("button", { type: "button", class: "mn-btn mn-btn-primary", disabled: "disabled" });
      el.back = h("button", { type: "button", class: "mn-btn mn-btn-ghost" });
      el.step2 = h("div", { class: "mn-step" }, [
        el.selectedEmoji, el.question, el.textarea, el.charHint, el.submit, el.back
      ]);

      // Step 3 — thank you
      el.check = h("div", { class: "mn-check", "aria-hidden": "true", text: "✓" });
      el.thanksMsg = h("p", { class: "mn-thanks-msg", role: "status" });
      el.step3 = h("div", { class: "mn-step" }, [h("div", { class: "mn-thanks" }, [el.check, el.thanksMsg])]);

      var body = h("div", { class: "mn-body" }, [el.step1, el.step2, el.step3]);

      /* ---- Footer ---- */
      el.footer = h("div", { class: "mn-footer" });

      el.modal.appendChild(header);
      el.modal.appendChild(body);
      el.modal.appendChild(el.footer);
      el.backdrop.appendChild(el.modal);

      root.appendChild(el.fab);
      root.appendChild(el.backdrop);
      document.body.appendChild(root);
      el.root = root;

      wireEvents();
    }

    /* ===============================================================
       APPLY LANGUAGE  —  refresh every string + direction.
       =============================================================== */
    function applyLang() {
      var s = t();
      el.root.setAttribute("dir", s.dir);
      el.root.setAttribute("lang", state.lang);

      el.title.textContent = s.title;
      el.subtitle.textContent = s.subtitle;
      el.close.setAttribute("aria-label", s.close);
      el.emojiRow.setAttribute("aria-label", s.step1Legend);
      el.textarea.setAttribute("placeholder", s.placeholder);
      el.back.textContent = s.back;
      el.thanksMsg.textContent = s.thanks;
      el.footer.textContent = s.footer;

      el.emojiButtons.forEach(function (b, i) { b._label.textContent = s.ratingLabels[i]; });

      el.langEn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
      el.langAr.setAttribute("aria-pressed", state.lang === "ar" ? "true" : "false");

      var srOnly = el.fab.querySelector(".mn-sr-only");
      if (srOnly) srOnly.textContent = s.fabAria;

      // If we're already on step 2, refresh the question + submit label.
      if (state.rating) refreshStep2();
      updateSubmitState();
    }

    /* ===============================================================
       STEP HELPERS
       =============================================================== */
    function showStep(n) {
      [el.step1, el.step2, el.step3].forEach(function (st, i) {
        st.classList.toggle("mn-active", i === n - 1);
      });
    }

    function refreshStep2() {
      var set = QUESTIONS[state.userType] || QUESTIONS.visitors;
      var list = set[state.lang] || set.en;
      el.question.textContent = list[state.rating - 1];
      el.selectedEmoji.textContent = EMOJIS[state.rating - 1];
      el.submit.textContent = t().submit;
    }

    function updateSubmitState() {
      var len = el.textarea.value.trim().length;
      var remaining = CONFIG.minChars - len;
      if (remaining > 0) {
        el.submit.setAttribute("disabled", "disabled");
        el.charHint.textContent = t().charHint(remaining);
      } else {
        el.submit.removeAttribute("disabled");
        el.charHint.textContent = "";
      }
    }

    function selectRating(rating) {
      state.rating = rating;
      el.emojiButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-rating") === String(rating) ? "true" : "false");
      });
      refreshStep2();
      showStep(2);
      updateSubmitState();
      // Move focus into the textarea for a smooth keyboard flow.
      window.setTimeout(function () { el.textarea.focus(); }, 50);
    }

    /* ===============================================================
       SUBMISSION  —  POST to Google Forms (no-cors) or demo-log.
       =============================================================== */
    function submit() {
      var answer = el.textarea.value.trim();
      if (answer.length < CONFIG.minChars || !state.rating) return;

      var payload = {
        language: state.lang,
        userType: state.userType,
        rating: String(state.rating),
        feedback: answer,
        timestamp: new Date().toISOString(),
        pageUrl: location.href
      };

      el.submit.setAttribute("disabled", "disabled");
      el.submit.textContent = t().sending;

      sendToGoogleForms(payload)
        .then(function () { finishSuccess(); })
        .catch(function (err) {
          // Fail gracefully: log, but never break the host page UX.
          console.error("[MY NAGHI feedback] submission failed:", err);
          finishSuccess(); // no-cors gives us no real status; treat as sent
        });
    }

    function sendToGoogleForms(payload) {
      return new Promise(function (resolve, reject) {
        // Demo mode: no form configured → just log and resolve.
        if (!CONFIG.form.formId) {
          console.info("[MY NAGHI feedback] demo mode, payload:", payload);
          resolve();
          return;
        }
        try {
          var url =
            "https://docs.google.com/forms/d/e/" +
            encodeURIComponent(CONFIG.form.formId) +
            "/formResponse";

          var fd = new FormData();
          var entries = CONFIG.form.entries;
          Object.keys(entries).forEach(function (key) {
            if (payload[key] != null && entries[key]) fd.append(entries[key], payload[key]);
          });

          // no-cors: the response is opaque, but the write succeeds.
          fetch(url, { method: "POST", mode: "no-cors", body: fd })
            .then(function () { resolve(); })
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    }

    function finishSuccess() {
      showStep(3);
      // Analytics hook — fire a custom event integrators can listen for.
      dispatch("mn-feedback:submitted", { userType: state.userType, rating: state.rating, lang: state.lang });
      clearTimeout(autoCloseTimer);
      autoCloseTimer = window.setTimeout(closeModal, CONFIG.autoCloseMs);
    }

    function dispatch(name, detail) {
      try {
        document.dispatchEvent(new CustomEvent(name, { detail: detail }));
      } catch (e) { /* older browsers — ignore */ }
    }

    /* ===============================================================
       OPEN / CLOSE / RESET
       =============================================================== */
    function openModal() {
      state.lastFocused = document.activeElement;
      state.userType = detectUserType();
      resetFlow();
      state.isOpen = true;
      el.root.classList.add("mn-open");
      dispatch("mn-feedback:opened", { userType: state.userType, lang: state.lang });
      // Focus the close button first (predictable, non-destructive target).
      window.setTimeout(function () { el.close.focus(); }, 60);
    }

    function closeModal() {
      clearTimeout(autoCloseTimer);
      state.isOpen = false;
      el.root.classList.remove("mn-open");
      if (state.lastFocused && state.lastFocused.focus) state.lastFocused.focus();
    }

    function resetFlow() {
      state.rating = null;
      el.textarea.value = "";
      el.charHint.textContent = "";
      el.emojiButtons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      el.submit.textContent = t().submit;
      el.submit.setAttribute("disabled", "disabled");
      showStep(1);
    }

    /* ===============================================================
       FOCUS TRAP  —  keep Tab inside the modal while it is open.
       =============================================================== */
    function trapFocus(e) {
      if (!state.isOpen || e.key !== "Tab") return;
      var focusables = el.modal.querySelectorAll(
        'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      var visible = Array.prototype.filter.call(focusables, function (n) {
        return n.offsetParent !== null && !n.disabled;
      });
      if (!visible.length) return;
      var first = visible[0];
      var last = visible[visible.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    /* ===============================================================
       EVENT WIRING
       =============================================================== */
    function wireEvents() {
      el.fab.addEventListener("click", openModal);
      el.close.addEventListener("click", closeModal);

      // Backdrop click (but not clicks inside the modal) closes it.
      el.backdrop.addEventListener("click", function (e) {
        if (e.target === el.backdrop) closeModal();
      });

      // Emoji selection
      el.emojiButtons.forEach(function (b) {
        b.addEventListener("click", function () {
          selectRating(parseInt(b.getAttribute("data-rating"), 10));
        });
      });

      // Language toggle
      el.langEn.addEventListener("click", function () { setLanguage("en"); });
      el.langAr.addEventListener("click", function () { setLanguage("ar"); });

      // Textarea → live validation
      el.textarea.addEventListener("input", updateSubmitState);

      // Buttons
      el.submit.addEventListener("click", submit);
      el.back.addEventListener("click", function () { showStep(1); });

      // Keyboard: Esc closes, Tab is trapped.
      document.addEventListener("keydown", function (e) {
        if (!state.isOpen) return;
        if (e.key === "Escape") { closeModal(); return; }
        trapFocus(e);
      });
    }

    function setLanguage(lang) {
      if (lang !== "en" && lang !== "ar") return;
      state.lang = lang;
      applyLang();
    }

    /* ===============================================================
       PUBLIC API  —  window.MYNAGHI_FEEDBACK
       =============================================================== */
    var api = {
      open: openModal,
      close: closeModal,
      setLanguage: setLanguage,
      // Manually pin a user type (QA / testing). Pass null to auto-detect.
      setUserType: function (type) {
        CONFIG.forceUserType = type || null;
        if (state.isOpen) { state.userType = detectUserType(); if (state.rating) refreshStep2(); }
      },
      // Merge runtime config, e.g. inject a real Google Form at load time.
      configure: function (partial) {
        if (!partial) return;
        Object.keys(partial).forEach(function (k) {
          if (k === "form" && partial.form) {
            if (partial.form.formId != null) CONFIG.form.formId = partial.form.formId;
            if (partial.form.entries) {
              Object.keys(partial.form.entries).forEach(function (ek) {
                CONFIG.form.entries[ek] = partial.form.entries[ek];
              });
            }
          } else { CONFIG[k] = partial[k]; }
        });
      },
      getState: function () { return { lang: state.lang, userType: state.userType, rating: state.rating, isOpen: state.isOpen }; },
      config: CONFIG,
      i18n: I18N,
      questions: QUESTIONS,
      detectUserType: detectUserType
    };
    window.MYNAGHI_FEEDBACK = api;

    /* ===============================================================
       INIT
       =============================================================== */
    function init() {
      state.lang = detectLang();
      state.userType = detectUserType();
      build();
      applyLang();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
  
})();
