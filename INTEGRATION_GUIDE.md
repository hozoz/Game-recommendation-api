# MY NAGHI Feedback Widget — Integration Guide

**Star Rating Edition** · `widget.html`

A self-contained customer feedback popup for **mynaghi.sa**: 5-star rating → context-aware follow-up question → thank you. Arabic-first with full RTL, English toggle, automatic user-type detection from the URL, and submission to Google Forms — no backend required.

- **File:** `widget.html` (~40 KB unminified, single file, zero dependencies except the Space Grotesk font from Google Fonts)
- **Browsers:** iOS Safari, Android Chrome, desktop Chrome / Firefox / Safari / Edge

**Contents**

1. [Google Form setup](#1-google-form-setup)
2. [Embedding on mynaghi.sa](#2-embedding-on-mynaghisa)
3. [Configuration reference](#3-configuration-reference)
4. [Testing checklist](#4-testing-checklist)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Google Form setup

The widget POSTs every submission to a Google Form, so responses land in a Google Sheet you control.

### 1.1 Create the form

1. Go to [forms.google.com](https://forms.google.com) and create a **blank form**. Name it e.g. *MY NAGHI Website Feedback*.
2. Add exactly these **5 questions** (types as shown):

   | # | Question title | Type | What the widget sends |
   |---|---|---|---|
   | 1 | Language | Short answer | `ar` or `en` |
   | 2 | User Type | Short answer | `visitors`, `searchers`, `viewers`, `comparers`, `buyers`, `inquiries`, or `after-sales` |
   | 3 | Rating | Short answer | `1`–`5` |
   | 4 | Feedback | Paragraph | The customer's written answer |
   | 5 | Page URL | Short answer | The full URL the widget was opened on |

3. Leave every question **optional** — a question marked *required* that arrives empty makes Google silently reject the whole submission.
4. Click the **Responses** tab → the green Sheets icon → **Create spreadsheet**. This is where feedback arrives.
5. Under **Settings** (⚙️): make sure **“Limit to 1 response”** is **OFF** (it would force customers to sign in to Google, which kills submissions).

### 1.2 Get the Form ID

Click **Send** (top right) → the link icon 🔗. You get a URL like:

```
https://docs.google.com/forms/d/e/1FAIpQLSe_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789/viewform
```

The long token between `/d/e/` and `/viewform` is your **Form ID**:

```
1FAIpQLSe_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789
```

> ⚠️ Use the **`/d/e/` (public) ID** from the Send link — not the shorter edit-page ID visible in your browser's address bar while editing. Only the public ID accepts submissions.

### 1.3 Find each `entry.XXXXXXXXX` field ID (pre-filled link method)

Every question in a Google Form has a hidden numeric name like `entry.123456789`. The widget needs these IDs to file each value under the right column. The official, reliable way to discover them:

1. In the form editor, click the **⋮ (three-dot) menu** top right → **“Get pre-filled link”**.
2. A preview of your form opens. **Type a recognizable dummy value into every field**:
   - Language → `LANG`
   - User Type → `TYPE`
   - Rating → `RATING`
   - Feedback → `ANSWER`
   - Page URL → `URL`
3. Click **“Get link”** at the bottom, then **“Copy link”**.
4. Paste the copied link into a text editor. It looks like this (split here for readability):

   ```
   https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform?usp=pp_url
     &entry.111111111=LANG
     &entry.222222222=TYPE
     &entry.333333333=RATING
     &entry.444444444=ANSWER
     &entry.555555555=URL
   ```

5. Each `entry.NNNNNNNNN=DUMMY` pair tells you which entry ID belongs to which field: the ID paired with `LANG` is your Language field, the one paired with `RATING` is your Rating field, and so on. **Match by the dummy value, not by position** — Google does not guarantee the order of parameters in the URL.

### 1.4 Update `FEEDBACK_CONFIG` in widget.html

Open `widget.html` and find this block at the **top of the `<script>` section** — these are the **only lines you must change**:

```javascript
const FEEDBACK_CONFIG = {
  formId: 'YOUR_FORM_ID',                 // ← paste your Form ID (step 1.2)
  fields: {
    language: 'entry.XXXXXXXXX',          // ← entry ID paired with LANG
    userType: 'entry.XXXXXXXXX',          // ← entry ID paired with TYPE
    rating:   'entry.XXXXXXXXX',          // ← entry ID paired with RATING
    answer:   'entry.XXXXXXXXX',          // ← entry ID paired with ANSWER
    pageUrl:  'entry.XXXXXXXXX'           // ← entry ID paired with URL
  }
};
```

Filled in, it should look like:

```javascript
const FEEDBACK_CONFIG = {
  formId: '1FAIpQLSe_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789',
  fields: {
    language: 'entry.111111111',
    userType: 'entry.222222222',
    rating:   'entry.333333333',
    answer:   'entry.444444444',
    pageUrl:  'entry.555555555'
  }
};
```

> Until `formId` is changed from `YOUR_FORM_ID`, the widget runs fully but **skips the network call** and logs the would-be payload with `console.warn` — handy for testing the UI before the form is ready.

---

## 2. Embedding on mynaghi.sa

### Method A — Paste into the page (fastest, recommended)

1. Open `widget.html` in a text editor.
2. Copy **everything between** these two marker comments, inclusive (the `<link>` font tags, the `<style>` block, the `<div id="mn-feedback-root">` markup, and the `<script>` block):

   ```
   <!-- ================= MYNAGHI WIDGET START ================= -->
   ...
   <!-- ================= MYNAGHI WIDGET END ================= -->
   ```

3. Paste the copied block into your site template **just before the closing `</body>` tag**:

   ```html
       <!-- ...existing page content... -->

       <!-- MY NAGHI feedback widget -->
       <!-- (paste the copied block here) -->

   </body>
   </html>
   ```

That's it. The widget's styles are fully scoped under `#mn-feedback-root`, so nothing leaks into your page CSS and vice versa. Put the block in the shared site-wide template/footer so it appears on every page — user-type detection adapts the questions per page automatically.

### Method B — Host the file + loader script

Host `widget.html` on your domain or CDN (e.g. `https://mynaghi.sa/assets/widget.html`), then add this loader before `</body>` on every page:

```html
<!-- MY NAGHI feedback widget loader -->
<script>
(function () {
  fetch('https://mynaghi.sa/assets/widget.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      // 1. Adopt styles, font links, and the widget markup
      doc.querySelectorAll('link[rel], style, #mn-feedback-root')
        .forEach(function (node) { document.body.appendChild(document.adoptNode(node)); });
      // 2. Re-create scripts so the browser executes them
      doc.querySelectorAll('script').forEach(function (s) {
        var el = document.createElement('script');
        el.textContent = s.textContent;
        document.body.appendChild(el);
      });
    })
    .catch(function (e) { console.warn('MY NAGHI widget failed to load:', e); });
})();
</script>
```

Notes:

- Host the file on the **same domain** as the site, or on a CDN that sends CORS headers (`Access-Control-Allow-Origin` permitting your site) — otherwise the `fetch` is blocked.
- Method B lets you update the widget in one place for the whole site.

---

## 3. Configuration reference

All settings live at the **top of the `<script>` block** in `widget.html`.

### `FEEDBACK_CONFIG`

The Google Forms destination (section 1.4). The only mandatory configuration.

### `FORCE_USER_TYPE`

```javascript
const FORCE_USER_TYPE = null;
```

- `null` (default) — the user type is auto-detected from the page URL.
- Any of `'visitors'`, `'searchers'`, `'viewers'`, `'comparers'`, `'buyers'`, `'inquiries'`, `'after-sales'` — forces that type regardless of URL. **Use for testing** each question set, then set back to `null` for production.

Auto-detection rules (matched against the URL path + query string, most specific first):

| Type | URL contains | Question focus |
|---|---|---|
| `buyers` | `checkout`, `cart`, `payment` | Checkout friction |
| `comparers` | `compare` | Comparison clarity |
| `after-sales` | `orders`, `order-history`, `account` | Post-purchase & delivery |
| `inquiries` | `contact`, `inquiry`, `support` | Support quality |
| `searchers` | `search` | Search & findability |
| `viewers` | `product` | Product info completeness |
| `visitors` | anything else (default) | General site experience |

### Auto-open triggers

```javascript
const AUTO_OPEN_AFTER_MS = null;          // e.g. 30000 → auto-open after 30 s
const AUTO_OPEN_ON_SCROLL_PERCENT = null; // e.g. 60 → auto-open at 60 % scroll
```

Both are `null` by default: **the widget opens only via the floating button**, the recommended behavior for this audience. Auto-open fires **at most once per page load** and never if the visitor already opened the widget themselves.

### Language behavior

Arabic is the default. The widget reads `document.documentElement.lang`, falling back to `navigator.language`; only a value starting with `en` starts the widget in English — anything else (Arabic or undetermined) starts in Arabic. Visitors switch instantly with the **العربية / EN** pills; no reload.

### Colors (CSS variables)

At the top of the `<style>` block, on `#mn-feedback-root`:

```css
--mn-lilac:        #964BFA;   /* primary — CTAs, active states */
--mn-lilac-dark:   #6F2DD4;   /* hover on primary buttons      */
--mn-lilac-subtle: #F2EAFF;   /* hover bg on option buttons    */
--mn-black:        #1A1A1A;   /* primary text                  */
--mn-bluegrey:     #6B7D99;   /* secondary text                */
--mn-bluegrey-lt:  #A8B4C8;   /* muted hints / captions        */
--mn-sand:         #EDE5D0;   /* header accent                 */
--mn-sand-lt:      #F6F1E6;   /* header background             */
--mn-grey-100:     #F5F5F5;   /* footer background             */
--mn-grey-200:     #E8E8E8;   /* borders, unfilled stars       */
--mn-gold:         #F5B301;   /* filled stars ONLY             */
```

Change a value here and the whole widget re-themes — no other edits needed.

### Text and questions

- All UI strings (both languages) live in the `STRINGS` object; the bilingual rating captions live in `RATING_LABELS`.
- All 35 follow-up questions (× 2 languages = 70 strings) live in the `QUESTIONS` object, keyed by user type → star rating (1–5) → language (`en` / `ar`). Edit the text freely; keep the structure.

---

## 4. Testing checklist

Tip: open `widget.html` **directly in a browser** — it works standalone, no server required.

**Stars**

- [ ] Tapping star N fills stars 1…N gold (e.g. tapping star 4 fills stars 1–4)
- [ ] The bilingual caption appears under the stars (e.g. selecting 5 shows «ممتاز · Excellent»)
- [ ] After a tap, the widget pauses ~400 ms (stars visibly filled) then moves to the question step
- [ ] Star order stays left-to-right ascending in **both** Arabic and English modes
- [ ] The selected stars stay visible (small, read-only) at the top of the question step

**User types & questions** (set `FORCE_USER_TYPE` to each type in turn, or append `?search=x`, `?product=1`, `?compare=1`, `?page=checkout`, `?page=contact`, `?page=orders` to the URL)

- [ ] Each of the **7 user types** shows its own question set
- [ ] Within each type, **all 5 ratings** show the correct, distinct question — 35 combinations total
- [ ] `FORCE_USER_TYPE` is back to `null` before going live

**Language & RTL**

- [ ] Widget starts in **Arabic** with full RTL layout: close button top-LEFT, text right-aligned, floating button bottom-LEFT
- [ ] The **EN** pill switches every visible string instantly and flips the layout to LTR — no reload
- [ ] Switching language while on the question step swaps the question itself

**Submission**

- [ ] With the form configured (section 1), submit a rating + answer and confirm a new row appears in the linked **Google Sheet** with Language, User Type, Rating, Feedback, and Page URL
- [ ] Submitting an **empty** answer shows the gentle inline message («من فضلك اكتب إجابتك» / “Please write your answer”) — never a browser alert
- [ ] The button shows «جاري الإرسال...» / “Sending...” while disabled, then the thank-you screen appears, auto-closes after 2 s, and the widget fully resets

**Mobile**

- [ ] At **320 px** viewport width: all five 56 px stars fit, nothing overflows, every control is comfortably tappable

**Accessibility**

- [ ] Keyboard: Tab order is logical; arrow keys move the star selection; Enter confirms; Escape closes; focus returns to the floating button on close
- [ ] Focus stays trapped inside the modal while it is open
- [ ] A screen reader announces the dialog title, the star radio group, and the selected rating caption (live region)
- [ ] With “reduce motion” enabled in the OS, animations are disabled

**Console**

- [ ] Zero errors or warnings through a full open → rate → answer → submit → close cycle (with the form configured)

---

## 5. Troubleshooting

**The widget doesn't appear on the page**

- Confirm the whole block — `<link>`, `<style>`, `<div id="mn-feedback-root">`, **and** `<script>` — was pasted (Method A), or that the loader URL is correct and returns the file (Method B; check the browser's Network tab).
- The script must run **after** the `<div id="mn-feedback-root">` markup exists (it does if you copied the block intact and in order).
- Check the console for a JavaScript error thrown by *other* scripts on the page before the widget's script runs.
- If your site sends a strict **Content-Security-Policy**, allow `fonts.googleapis.com` and `fonts.gstatic.com` (styles + fonts); for Method B also allow `connect-src` to the widget's host.

**Feedback isn't arriving in the Google Sheet**

- The widget deliberately shows the thank-you screen even when submission fails, so watch the **browser console** for `[MY NAGHI feedback]` warnings.
- `formId` still says `YOUR_FORM_ID` → submissions are skipped by design; complete section 1.4.
- Make sure you used the long **`/d/e/` public Form ID** from the Send link, not the edit-page ID.
- Re-check every `entry.` ID against a fresh **pre-filled link** (section 1.3) — one wrong ID makes Google drop that value; a wrong required-field setup drops the whole row.
- In the form's settings, confirm no question is **required** and “Limit to 1 response” is **off**.
- Look in the **linked spreadsheet** (Responses tab → Sheets icon) and in the form's own Responses tab.
- Note: the request uses `mode: 'no-cors'`, so the browser cannot read Google's response — the Network tab shows an opaque “success” even if Google rejected the row. **The Sheet is the source of truth.**

**RTL layout looks wrong**

- The widget manages its own direction; make sure it is not inside a container that forces `direction` with `!important`.
- If the close button isn't top-left in Arabic, the browser may be very old (no `inset-inline-end` support, pre-2021). All current iOS Safari / Android Chrome / desktop browsers are fine.
- Stars intentionally stay **left-to-right** in Arabic — that is the standard convention in Saudi apps, not a bug.

**Font doesn't load / text looks like a system font**

- Space Grotesk loads from Google Fonts, so those domains must be reachable (see the CSP note above). If it's blocked or slow, the widget falls back to a clean system font and remains fully usable.
- Space Grotesk contains **no Arabic glyphs**; Arabic text intentionally renders in the device's Arabic system font. This is expected and correct.

**The widget opens by itself**

- Check `AUTO_OPEN_AFTER_MS` and `AUTO_OPEN_ON_SCROLL_PERCENT` — both should be `null` unless you enabled them on purpose.

**Styles look broken / inherited from the site**

- Keep the widget's `<style>` block intact — every rule is scoped under `#mn-feedback-root`. If your site applies aggressive global `!important` rules (e.g. on `button`), scope them away from `#mn-feedback-root`.
