# MY NAGHI Customer Feedback Widget — Integration Guide

A self-contained, dependency-free feedback popup for **mynaghi.sa**. It collects a
two-step response (emoji rating → context-aware follow-up question) and submits it to
**Google Forms** — no backend required. Bilingual **English / Arabic** with full RTL
support and automatic user-type detection from the page URL.

- **File:** `widget.html` (~42 KB unminified, single file)
- **Dependencies:** none except the Space Grotesk web font (loaded from Google Fonts)
- **Browsers:** modern Chrome, Firefox, Safari, Edge — mobile-first

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Google Forms Setup](#2-google-forms-setup)
3. [Embedding on the Website (3 Methods)](#3-embedding-on-the-website-3-methods)
4. [Configuration Options](#4-configuration-options)
5. [User-Type Detection](#5-user-type-detection)
6. [Testing Checklist](#6-testing-checklist)
7. [Troubleshooting](#7-troubleshooting)
8. [Analytics Integration (Optional)](#8-analytics-integration-optional)
9. [Field Reference](#9-field-reference)

---

## 1. Quick Start

1. Open `widget.html` directly in a browser to preview it. Click the lilac 💬 button
   in the bottom-right corner.
2. To test a specific customer journey, append a path to the URL, e.g.
   `widget.html#/checkout/` (detected as **Buyers**) or `widget.html#/search/?q=x`
   (detected as **Searchers**).
3. Out of the box the widget runs in **demo mode**: submissions are logged to the
   browser console instead of being sent. Complete [step 2](#2-google-forms-setup) to
   send real responses to Google Forms.

> The widget will **not** send any data until you set a `formId`. This is intentional so
> you can preview it safely.

---

## 2. Google Forms Setup

The widget POSTs responses to a Google Form's `formResponse` endpoint. You need to (a)
create a form with the right fields, then (b) copy its form ID and each field's entry ID
into the widget config.

### Step 2.1 — Create the Google Form

Create a new form at <https://forms.google.com> with these questions, **in this order**:

| # | Question title | Type          | Options                                                                 |
|---|----------------|---------------|-------------------------------------------------------------------------|
| 1 | Language       | Short answer  | (free text — the widget sends `en` or `ar`)                             |
| 2 | User Type      | Short answer  | (free text — `visitors`, `searchers`, `viewers`, `comparers`, `buyers`, `inquiries`, `after-sales`) |
| 3 | Rating         | Short answer  | (free text — `1`–`5`)                                                    |
| 4 | Feedback       | Paragraph     | —                                                                       |
| 5 | Timestamp      | Short answer  | (ISO 8601 string, auto-filled by the widget)                            |
| 6 | Page URL       | Short answer  | (auto-filled by the widget)                                             |

> **Tip:** Use **Short answer / Paragraph** (free-text) fields rather than dropdowns.
> Free-text fields accept any value the widget sends, so a new user type or language
> can never be silently rejected. If your team prefers dropdowns for cleaner reporting,
> make sure every option value matches exactly (case-sensitive).

You can also start from a ready-made template and just duplicate it:

- **Template link (make a copy):**
  `https://docs.google.com/forms/d/e/EXAMPLE_TEMPLATE_ID/viewform`
  *(Replace with your own template URL once created — see the note below.)*

> **Creating a shareable template:** build the form once, then use **Send → Copy link**
> or share the editable URL with `/copy` appended
> (`https://docs.google.com/forms/d/FILE_ID/copy`) so teammates can duplicate it into
> their own Drive.

### Step 2.2 — Find the Form ID

1. Open your form and click **Send → 🔗 (link)**, or open the live form (**👁 Preview**).
2. The live URL looks like:
   `https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxxxxxxxxxxxxx/viewform`
3. The **Form ID** is the long string between `/d/e/` and `/viewform`:
   `1FAIpQLSxxxxxxxxxxxxxxxxxxxx`

### Step 2.3 — Find the Field Entry IDs

Each question has a unique `entry.NNNNNNNNN` ID. The reliable way to get them all:

1. Open the **live form** (Preview 👁), not the editor.
2. Right-click → **View Page Source** (or press `Ctrl/Cmd+U`).
3. Search the source for `entry.` — each input has an id like
   `entry.1234567890`. They appear in the same order as your questions.

Alternative (faster): open the live form, right-click a field → **Inspect**, and read the
`name="entry.NNNNNNNNN"` attribute of the `<input>`/`<textarea>`.

Map them like this:

| Widget field | Your question | Example entry ID     |
|--------------|---------------|----------------------|
| `language`   | Language      | `entry.1000000001`   |
| `userType`   | User Type     | `entry.1000000002`   |
| `rating`     | Rating        | `entry.1000000003`   |
| `feedback`   | Feedback      | `entry.1000000004`   |
| `timestamp`  | Timestamp     | `entry.1000000005`   |
| `pageUrl`    | Page URL      | `entry.1000000006`   |

### Step 2.4 — Update the Widget

Open `widget.html`, find the `CONFIG` block near the top of the `<script>` and fill in
your IDs:

```js
var CONFIG = {
  form: {
    formId: "1FAIpQLSxxxxxxxxxxxxxxxxxxxx",   // ← from Step 2.2
    entries: {
      language:  "entry.1000000001",           // ← from Step 2.3
      userType:  "entry.1000000002",
      rating:    "entry.1000000003",
      feedback:  "entry.1000000004",
      timestamp: "entry.1000000005",
      pageUrl:   "entry.1000000006"
    }
  },
  // ...
};
```

Alternatively, configure it at runtime **without editing the file** (handy for CDN
hosting — see [Method C](#method-c-hosted-on-a-cdn)):

```html
<script>
  window.MYNAGHI_FEEDBACK.configure({
    form: {
      formId: "1FAIpQLSxxxxxxxxxxxxxxxxxxxx",
      entries: {
        language:  "entry.1000000001",
        userType:  "entry.1000000002",
        rating:    "entry.1000000003",
        feedback:  "entry.1000000004",
        timestamp: "entry.1000000005",
        pageUrl:   "entry.1000000006"
      }
    }
  });
</script>
```

> **Why no confirmation on submit?** Google Forms doesn't allow cross-origin reads, so
> the widget posts in `no-cors` mode. The response is opaque (the browser can't read the
> status), but the write succeeds. The widget treats the request as sent and shows the
> thank-you screen. Verify data is arriving in the form's **Responses** tab during testing.

---

## 3. Embedding on the Website (3 Methods)

Pick whichever fits how mynaghi.sa is built. **Method A** is the recommended default.

### Method A: Direct Script Embed (recommended)

Use the ready-made single-file build **`mynaghi-feedback-widget.js`**. It bundles the
styles, the font loader, and the widget into one file, so there is exactly **one line**
to add. Upload the file somewhere on the site (e.g. `/assets/feedback/`) and add this
just before the closing `</body>` tag of the site template:

```html
<script src="/assets/feedback/mynaghi-feedback-widget.js" defer></script>
```

That's the whole integration. The script injects its own styles, font, DOM, and floating
button — no other markup, no `<head>` changes, no server logic. It works immediately.

**No place to host the file?** You can instead paste the *entire contents* of
`mynaghi-feedback-widget.js` inline, wrapped in a script tag, in the same spot:

```html
<script> /* …paste the full contents of mynaghi-feedback-widget.js here… */ </script>
```

> `mynaghi-feedback-widget.js` is generated from `widget.html` and already contains the
> live Google Form configuration. If you edit `widget.html` later, regenerate this file so
> the two stay in sync.

### Method B: iframe Embed

Use this when the page can't run inline JavaScript directly (strict CMS, sandboxed
templates). Host `widget.html` somewhere on your domain, then embed it. Because the
widget's floating button lives inside the iframe, size and position the iframe to the
corner and make it click-through except over the button:

```html
<iframe
  src="/assets/feedback/widget.html"
  title="Customer feedback"
  style="position:fixed; bottom:0; right:0; width:480px; height:640px;
         border:0; z-index:2147483000; background:transparent;"
  allowtransparency="true">
</iframe>
```

> **Note:** iframe embedding limits automatic user-type detection to the iframe's own URL.
> Pass the parent journey in via the `src` (e.g. `widget.html#/checkout/`) or set it with
> `MYNAGHI_FEEDBACK.setUserType('buyers')` inside the iframe. Method A is preferred when
> URL-based detection matters.

### Method C: Hosted on a CDN

Best for performance and caching across many pages.

1. Upload `widget.html` (or a minified single-file build) to your CDN, e.g.
   `https://cdn.mynaghi.sa/feedback/widget.js`. If you extract just the script, save it as
   a `.js` file.
2. Reference it with `defer` so it never blocks page rendering:

```html
<script defer src="https://cdn.mynaghi.sa/feedback/widget.js"></script>
<script defer>
  document.addEventListener('DOMContentLoaded', function () {
    // Optional: inject the form config here instead of editing the file.
    window.MYNAGHI_FEEDBACK.configure({ form: { formId: "…", entries: { /* … */ } } });
  });
</script>
```

Load time impact is negligible (< 100 ms) and the font uses `display=swap` so text never
blocks paint.

---

## 3A. How the Widget Appears (Trigger Options)

**By default, the widget is a floating 💬 button in the bottom-right corner. Nothing pops
up on its own** — the customer chooses to open it by tapping the button. This is the
least intrusive behaviour and the recommended default.

If you'd rather have it **open automatically after a specific action or moment**, the
widget exposes `MYNAGHI_FEEDBACK.open()` — call it from any event. Here are common
patterns (place these after the widget script has loaded):

**Open on the order-confirmation / thank-you page** (great for Buyers feedback):

```html
<script defer>
  window.addEventListener('load', function () {
    if (location.pathname.indexOf('/order-confirmation') !== -1) {
      window.MYNAGHI_FEEDBACK.open();
    }
  });
</script>
```

**Open after the customer has spent ~30 seconds on the page:**

```html
<script defer>
  setTimeout(function () { window.MYNAGHI_FEEDBACK.open(); }, 30000);
</script>
```

**Open on "exit intent"** (when the mouse leaves toward the top of the window — desktop):

```html
<script defer>
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 0) window.MYNAGHI_FEEDBACK.open();
  });
</script>
```

**Only auto-open once per visitor** (so it isn't annoying) — wrap any trigger above:

```html
<script defer>
  if (!localStorage.getItem('mn_feedback_shown')) {
    localStorage.setItem('mn_feedback_shown', '1');
    setTimeout(function () { window.MYNAGHI_FEEDBACK.open(); }, 30000);
  }
</script>
```

You can mix these freely (e.g. keep the floating button **and** auto-open once on the
order-confirmation page). The floating button always remains available unless you hide it
with CSS.

---

## 4. Configuration Options

All configuration lives in the `CONFIG` object at the top of the widget script, or can be
supplied at runtime through `MYNAGHI_FEEDBACK.configure(...)`.

### 4.1 Colors (CSS variables)

Re-theme the entire widget by editing the `:root` variables in the `<style>` block. No
other CSS changes are needed:

```css
:root {
  --mn-primary:      #964BFA;  /* Lilac — CTAs, accents, selection */
  --mn-primary-dark: #7d34e0;  /* Hover / pressed lilac */
  --mn-secondary:    #6B7D99;  /* Blue-grey — secondary text */
  --mn-sand:         #EDE5D0;  /* Warm sand — header background */
  --mn-text:         #1A1A1A;  /* Primary text */
  /* …see the full list at the top of the <style> block… */
}
```

### 4.2 Emoji Icons

Change the rating glyphs by editing the `EMOJIS` array. Keep exactly five, ordered
worst → best:

```js
var EMOJIS = ["😞", "😕", "😐", "🙂", "😊"];
```

The trigger button icon is the `text: "💬"` value passed to `el.fab` in `build()`.

### 4.3 Text & Translations

All strings live in the `I18N` object (`en` and `ar`). Follow-up questions live in
`QUESTIONS[userType][lang]` as an array of five (rating 1 → 5). Edit in place to adjust
wording; the structure is identical for both languages.

### 4.4 Manually Set the User Type (testing / overrides)

```js
// Force a journey — bypasses URL detection:
MYNAGHI_FEEDBACK.setUserType('buyers');

// Return to automatic detection:
MYNAGHI_FEEDBACK.setUserType(null);
```

You can also hard-pin it in config with `forceUserType: 'buyers'`.

### 4.5 Enable / Disable the Widget per Page

Because the widget only initialises when its script runs, the simplest control is to
include the script only on pages where you want it. To gate it dynamically:

```html
<script>
  // Example: skip the widget on the login page.
  if (!location.pathname.startsWith('/login')) {
    /* …load or run the widget script here… */
  }
</script>
```

### 4.6 Other Options

| Option          | Default | Meaning                                                    |
|-----------------|---------|------------------------------------------------------------|
| `defaultLang`   | `"en"`  | Fallback language when the page language can't be detected |
| `autoCloseMs`   | `2000`  | Delay before the thank-you screen auto-closes (ms)         |
| `minChars`      | `20`    | Minimum characters before feedback can be submitted        |
| `forceUserType` | `null`  | Pin a user type; `null` = auto-detect                      |

---

## 5. User-Type Detection

On every open, the widget inspects `location.pathname + search + hash` (lower-cased) and
picks the first matching journey. Order matters — more specific journeys win:

| Priority | User Type     | Matches URLs containing                                   |
|----------|---------------|----------------------------------------------------------|
| 1        | `comparers`   | `/compare`                                                |
| 2        | `buyers`      | `/checkout`, `/cart`, `/payment`, `/basket`              |
| 3        | `searchers`   | `/search`, `?q=`, `?query=`                              |
| 4        | `after-sales` | `/orders`, `/order-history`, `/account`, `/my-account`  |
| 5        | `inquiries`   | `/inquiry`, `/contact`, `/support`, `/help`             |
| 6        | `viewers`     | `/product/…`, `/products/…`, `?view`                    |
| 7        | `visitors`    | everything else (default)                                |

To adjust these rules, edit the `detectUserType()` function in the widget. Each rule is a
plain regular expression, commented inline.

---

## 6. Testing Checklist

- [ ] Widget's floating button appears in the corner on the page
- [ ] Clicking it opens the modal; the button hides while open
- [ ] All five emoji buttons are clickable and advance to step 2
- [ ] Language toggle switches EN ⇄ AR
- [ ] Arabic mode flips the layout to RTL (button moves to bottom-left, text right-aligned)
- [ ] The follow-up question changes with **both** user type and rating
- [ ] Submit stays disabled until at least 20 characters are entered
- [ ] Google Form's **Responses** tab receives a new row on submit
- [ ] Thank-you screen shows, then auto-closes after ~2 seconds
- [ ] Reopening the widget resets all fields
- [ ] Layout holds on mobile (320–480px), tablet, and desktop — no horizontal scroll
- [ ] `Esc` closes the modal; `Tab` stays trapped inside it
- [ ] No console errors (the font request may warn if offline — that's expected)

---

## 7. Troubleshooting

**The widget doesn't appear.**
- Confirm the script actually runs (check the console for `MYNAGHI_FEEDBACK`).
- Ensure nothing on the page sets a higher `z-index` than `2147483000`, or a parent has
  `overflow:hidden` clipping the fixed button.
- If using Method A, verify the script is before `</body>` and not blocked by a Content
  Security Policy. For strict CSP, host the script as a file and allow its origin.

**Google Forms isn't receiving data.**
- Double-check the `formId` and every `entry.*` ID (copy from the **live** form source,
  not the editor).
- Make sure the form is **accepting responses** (not closed) and doesn't require sign-in.
- Confirm you filled in a real `formId` — an empty `formId` keeps the widget in demo mode.
- Open the console: demo mode logs `demo mode, payload:` instead of sending.

**The design looks wrong / unstyled.**
- Verify the `<style>` block was copied along with the script.
- Confirm the Space Grotesk font link is in `<head>`. Without it the widget falls back to
  a system sans-serif but still functions.
- Check that host-page CSS isn't overriding the widget. All widget rules are scoped under
  `#mn-feedback-root`; if your site uses `!important` resets, they may leak in.

**Mobile layout is broken.**
- Ensure the page has `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Test in real device widths; the widget is validated from 320px up.

**Arabic text isn't right-to-left.**
- The widget sets `dir="rtl"` on its own root when Arabic is selected — it does not depend
  on the page direction. If text still reads LTR, confirm the language toggle actually
  switched (the AR button should be highlighted lilac).

---

## 8. Analytics Integration (Optional)

The widget emits DOM `CustomEvent`s you can hook into any analytics tool:

| Event                    | Fires when             | `detail` payload                        |
|--------------------------|------------------------|-----------------------------------------|
| `mn-feedback:opened`     | modal opens            | `{ userType, lang }`                    |
| `mn-feedback:submitted`  | feedback is sent       | `{ userType, rating, lang }`            |

**Google Analytics 4 example:**

```html
<script>
  document.addEventListener('mn-feedback:opened', function (e) {
    gtag('event', 'feedback_open', { user_type: e.detail.userType, language: e.detail.lang });
  });
  document.addEventListener('mn-feedback:submitted', function (e) {
    gtag('event', 'feedback_submit', {
      user_type: e.detail.userType,
      rating: e.detail.rating,
      language: e.detail.lang
    });
  });
</script>
```

Swap `gtag(...)` for your own tracker (GTM `dataLayer.push`, Segment `analytics.track`,
etc.) as needed.

---

## 9. Field Reference

Each submission sends these six fields to Google Forms:

| Field       | Example                              | Source                          |
|-------------|--------------------------------------|---------------------------------|
| `language`  | `en` or `ar`                         | Active language toggle          |
| `userType`  | `buyers`                             | URL detection (or override)     |
| `rating`    | `1`–`5`                              | Selected emoji                  |
| `feedback`  | free text (≥ 20 chars)               | User's textarea answer          |
| `timestamp` | `2026-07-05T12:34:56.789Z`           | Auto-generated (ISO 8601, UTC)  |
| `pageUrl`   | `https://mynaghi.sa/checkout/`       | Auto-captured `location.href`   |

---

### Public API Summary

```js
MYNAGHI_FEEDBACK.open();                 // open the modal
MYNAGHI_FEEDBACK.close();                // close it
MYNAGHI_FEEDBACK.setLanguage('ar');      // 'en' | 'ar'
MYNAGHI_FEEDBACK.setUserType('buyers');  // pin a journey; null = auto
MYNAGHI_FEEDBACK.configure({ form: { … } }); // inject config at runtime
MYNAGHI_FEEDBACK.getState();             // { lang, userType, rating, isOpen }
```

Built for MY NAGHI. Clean, self-contained, and easy to maintain. 🚀
