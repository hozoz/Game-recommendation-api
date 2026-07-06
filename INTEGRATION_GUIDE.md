# MY NAGHI Feedback Widget — Integration Guide

**3-Step Edition** · `widget.html`

This guide assumes **no coding experience**. It walks you through previewing the widget on your computer, editing its content, connecting it to a Google Form, publishing it on **mynaghi.sa**, and updating it later.

**What the widget does:** a floating button opens a popup with three quick steps — the customer picks a **reason for their visit**, gives a **star rating (1–5)**, and can optionally write a **note** (they can also just press Send with an empty box). Everything is bilingual: Arabic by default, English via a toggle. Each response is saved to a Google Sheet.

**Contents**

- [A. Preview it on your own computer](#a-preview-it-on-your-own-computer)
- [B. Edit the content (no coding needed)](#b-edit-the-content-no-coding-needed)
- [C. Set up the Google Form](#c-set-up-the-google-form)
- [D. Publish it on mynaghi.sa](#d-publish-it-on-mynaghisa)
- [E. Test on the live site](#e-test-on-the-live-site)
- [F. Update it later](#f-update-it-later)
- [G. Troubleshooting](#g-troubleshooting)

---

## A. Preview it on your own computer

Do this **before** touching the website — you can see and click everything locally.

1. Save `widget.html` into any folder on your computer (e.g. `Documents/naghi-widget`).
2. Preview it in one of two ways:

   **Simplest — just open it:**
   Double-click `widget.html`. It opens in your browser and works immediately. You'll see the lilac floating button in the bottom-left corner (bottom-left because Arabic mode is the default).

   **Recommended — Live Server (closer to real website conditions, auto-reloads when you edit):**
   1. Install [VS Code](https://code.visualstudio.com/) (free).
   2. In VS Code: **File → Open Folder…** and pick the folder containing `widget.html`.
   3. Click the **Extensions** icon in the left sidebar (four squares), search for **“Live Server”** (by Ritwick Dey), click **Install**.
   4. In the file list, **right-click `widget.html` → “Open with Live Server”**.
   5. Your browser opens automatically at an address like `http://127.0.0.1:5500/widget.html` — that address also appears in the blue bar at the bottom of VS Code (“Port: 5500”). Keep this tab open; every time you save the file, the preview refreshes by itself.

3. **What to check in the preview:**
   - Click the floating button → the popup opens on the **reason screen** with 6 options.
   - Pick a reason → the **star screen** appears (your reason shows in a small pill).
   - Tap different stars → the caption under them changes (e.g. «ممتاز · Excellent»).
   - After tapping a star you land on the **note screen** — check that **the question matches the reason and the star** you chose (try a 1-star and a 5-star for the same reason).
   - Switch **العربية / EN** at the top — every text should change instantly, and the layout should flip direction.
   - Press **إرسال · Send** with the box **empty** — this is allowed; you should see the thank-you screen, and the popup closes by itself after 2 seconds.

> Note: until you complete part C, pressing Send doesn't go anywhere — the widget just shows the thank-you. That's expected.

---

## B. Edit the content (no coding needed)

Open `widget.html` in any text editor (VS Code, Notepad, TextEdit in plain-text mode). Everything you'd want to change lives in clearly-labelled blocks **near the top of the `<script>` section** (roughly the middle of the file — search for the block names below). Each block has a “HOW TO EDIT THIS” comment above it.

After **any** change: save the file and refresh the preview tab (Live Server refreshes automatically).

### Reorder or remove a reason

Search for `REASONS`. Each reason is one line:

```javascript
const REASONS = [
  { id: 'buy',      ar: 'أرغب في شراء سيارة',   en: 'Looking to buy a car',  icon: 'car' },
  { id: 'browse',   ar: 'أتصفّح فقط',           en: 'Just browsing',         icon: 'eye' },
  ...
];
```

- **Reorder:** move a whole line up or down. The tiles follow this order exactly.
- **Remove:** delete the whole line (including the trailing comma). Its questions in `QUESTIONS` can stay — they're simply unused — or you can delete that block too. **The widget never breaks either way**; if a reason somehow has no questions, a polite generic question is shown instead.

### Add a new reason

1. Copy an existing line in `REASONS` and paste it where you want it in the order.
2. Give it a **new `id`** (short English word, no spaces), the **Arabic and English labels**, and an **icon name** — one of: `car`, `eye`, `wrench`, `map-pin`, `tag`, `message-square`.
3. Search for `QUESTIONS`, copy an entire existing block (e.g. everything from `'other': {` to its closing `},`), paste it, and change the key to your new id and the 10 questions (5 English + 5 Arabic).

### Change any question

Search for `QUESTIONS`. It is organized as **reason → language → star number**:

```javascript
'service': {
  en: {
    1: 'What went wrong with booking your service?',
    ...
  },
  ar: {
    1: 'ما الذي حدث بشكل خاطئ في حجز موعد الصيانة؟',
    ...
  }
},
```

Find the reason id, then `en` or `ar`, then the star number (1–5), and edit the text between the quotes.

### Change other texts (titles, hints, buttons)

Search for `STRINGS` — every title, subtitle, placeholder, and message exists once under `ar:` and once under `en:`. Edit the text to the right of each colon.

### Change colors

Search for `COLORS & DESIGN TOKENS` at the top of the `<style>` block:

```css
--mn-lilac:        #964BFA;   /* primary — active states, CTAs  */
```

Change any hex value (e.g. the lilac line above) and the whole widget re-themes.

### Turn the reason pill on/off

Search for `SHOW_REASON_PILL`:

```javascript
const SHOW_REASON_PILL = true;   // set to false to hide the reason pill on the star step
```

### Change when the widget opens

Search for `AUTO_OPEN`:

```javascript
const AUTO_OPEN_AFTER_MS = null;          // e.g. 30000 = auto-open after 30 seconds
const AUTO_OPEN_ON_SCROLL_PERCENT = null; // e.g. 60 = auto-open at 60% scroll
```

Both `null` (recommended) means the widget opens **only** when the customer taps the floating button. Auto-open fires at most once per page visit.

---

## C. Set up the Google Form

This connects the widget to a Google Sheet where all responses arrive. You only do this once.

### C.1 Create the form

1. Go to [forms.google.com](https://forms.google.com) and create a **blank form**. Name it e.g. *MY NAGHI Website Feedback*.
2. Add these **5 questions** with these types:

   | # | Question title | Type |
   |---|---|---|
   | 1 | Language | Short answer |
   | 2 | Reason | Short answer |
   | 3 | Rating | Short answer |
   | 4 | Feedback | **Paragraph** |
   | 5 | Page URL | Short answer |

3. Leave **every question optional** — do NOT toggle “Required” on any of them. (The note is optional in the widget; a required field that arrives empty makes Google silently reject the entire response.) Google records the **timestamp automatically** — you don't need a field for it.
4. In **Settings (⚙️)**: make sure **“Limit to 1 response” is OFF** (otherwise customers would be forced to sign in to Google).
5. Click the **Responses** tab → the green **Sheets icon** → **Create spreadsheet**. This Sheet is where feedback lands.

### C.2 Get the Form ID

1. Click **Send** (top right) → the **link icon 🔗** → copy the link. It looks like:

   ```
   https://docs.google.com/forms/d/e/1FAIpQLSe_aBcDeF...long-code.../viewform
   ```

2. The long code **between `/d/e/` and `/viewform`** is your **Form ID**. Copy it.

> ⚠️ Use this link from the **Send** button — not the address bar of the editing page. Only the Send link contains the public ID that accepts submissions.

### C.3 Get the five entry IDs (“Get pre-filled link” method)

Each question has a hidden ID like `entry.123456789`. To find them:

1. In the form editor, click the **⋮ three-dot menu** (top right) → **“Get pre-filled link”**.
2. A preview of the form opens. **Type a recognizable dummy word in every field:**
   - Language → `LANG`
   - Reason → `REASON`
   - Rating → `RATING`
   - Feedback → `ANSWER`
   - Page URL → `URL`
3. Click **“Get link”** (bottom) → **“Copy link”**.
4. Paste the link into any text editor. Inside it you'll find five pairs like:

   ```
   entry.111111111=LANG
   entry.222222222=REASON
   entry.333333333=RATING
   entry.444444444=ANSWER
   entry.555555555=URL
   ```

5. The number attached to each dummy word is that field's entry ID. **Match by the word, not the order** — the order in the link is not guaranteed.

### C.4 Paste the IDs into the widget

In `widget.html`, search for `FEEDBACK_CONFIG` (the first block in the script) and replace the placeholders:

```javascript
const FEEDBACK_CONFIG = {
  formId: 'YOUR_FORM_ID',                 // ← paste the Form ID from C.2
  fields: {
    language: 'entry.XXXXXXXXX',          // ← the entry ID paired with LANG
    reason:   'entry.XXXXXXXXX',          // ← the entry ID paired with REASON
    rating:   'entry.XXXXXXXXX',          // ← the entry ID paired with RATING
    answer:   'entry.XXXXXXXXX',          // ← the entry ID paired with ANSWER
    pageUrl:  'entry.XXXXXXXXX'           // ← the entry ID paired with URL
  }
};
```

Keep the quotes; change only the text inside them. Save the file.

### C.5 Confirm it works

1. Refresh the preview, open the widget, pick a reason, tap a star, write “test”, press Send.
2. Open your **Google Sheet** — a new row should appear within seconds with the language, reason, rating, your note, the page address, and a timestamp.
3. If no row appears, see [Troubleshooting](#g-troubleshooting).

---

## D. Publish it on mynaghi.sa

No Replit or any other service is required — the widget is one file. Two ways to put it live:

### Method 1 — Paste into the page (quickest)

1. Open `widget.html` in a text editor.
2. Select and copy **everything between these two marker lines, including them**:

   ```
   <!-- ================= MYNAGHI WIDGET START ================= -->
   ...everything in between...
   <!-- ================= MYNAGHI WIDGET END ================= -->
   ```

3. Paste it into the website **just before the closing `</body>` tag** of the page template.
   - **Custom-built site:** ask whoever maintains the site template to paste it into the shared footer template so it appears on every page.
   - **Site builders / CMS (WordPress, Shopify, Wix, Webflow, Salla, Zid, etc.):** look for a setting called **“Custom HTML”, “Custom code”, “Footer code”, or “Code injection → Footer”** and paste the block there. That is exactly the “before `</body>`” spot.

That's the whole job — the widget carries its own styles and cannot interfere with the site's design.

### Method 2 — Host the file + one loader line (easier to update later)

1. Upload `widget.html` to the site's hosting or CDN, e.g. so it's reachable at
   `https://mynaghi.sa/assets/widget.html` (any static-file location works).
2. Add this **one block** just before `</body>` on every page (same “footer code” spot as above):

   ```html
   <!-- MY NAGHI feedback widget loader -->
   <script>
   (function () {
     fetch('https://mynaghi.sa/assets/widget.html')
       .then(function (r) { return r.text(); })
       .then(function (html) {
         var doc = new DOMParser().parseFromString(html, 'text/html');
         doc.querySelectorAll('link[rel], style, #mn-feedback-root')
           .forEach(function (node) { document.body.appendChild(document.adoptNode(node)); });
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

   (Replace the URL with wherever you uploaded the file. Host it on the **same domain** as the site, or on a CDN configured to allow the site to fetch it.)

**Trade-off:** Method 1 is instant but every future edit means re-pasting into the site. Method 2 means future edits only require **re-uploading one file** — the whole site picks up the new version automatically. If you expect to tweak questions over time, use Method 2.

---

## E. Test on the live site

Go through this list on the real website after publishing:

- [ ] The lilac floating button appears (bottom-left, because Arabic is default).
- [ ] It opens the popup; the page behind is dimmed and blurred.
- [ ] All **6 reasons** show, in the right order, each with its icon and both languages.
- [ ] For **each reason**, each of the **5 stars** leads to the right follow-up question — 30 combinations. (Quick spot-check on live + full check in local preview is fine.)
- [ ] Arabic is the default and the layout is right-to-left: close button top-left, text right-aligned; **stars still fill left-to-right** (that's intentional).
- [ ] The **EN** pill switches every text instantly, including mid-flow.
- [ ] Pressing **Send with an empty box** works and shows the thank-you.
- [ ] A test response **arrives in the Google Sheet** with all five values.
- [ ] Looks right on a phone — also try a very narrow one (or use the browser's device mode at **320 px** width): all five stars fit, nothing overflows.
- [ ] Keyboard works: Tab moves through everything, arrow keys move the star selection, Enter confirms, Escape closes. A screen reader announces the dialog and the selected rating.
- [ ] **No red errors in the browser console.** To open the console: press **F12** (Windows) or **Cmd+Option+I** (Mac), then click the **“Console”** tab. Red lines are errors; the widget should produce none.

---

## F. Update it later

To change a question, a reason, a color, or any text **after** the widget is live:

1. Edit `widget.html` as described in [part B](#b-edit-the-content-no-coding-needed).
2. Check it locally (part A).
3. Publish the change:
   - **Method 2 users:** re-upload `widget.html` to the same location, overwriting the old file. Done — the whole site updates.
   - **Method 1 users:** delete the previously-pasted block from the site template / footer-code box and paste the new version in its place.
4. Refresh the live site and verify.

**If you still see the old version:** it's usually a cache. Hard-refresh the page (**Ctrl+Shift+R** on Windows, **Cmd+Shift+R** on Mac). If your hosting/CDN caches files (Method 2), purge/clear its cache or wait a few minutes.

---

## G. Troubleshooting

**The widget button doesn't show up**

- Make sure the **entire block** was pasted — from the `WIDGET START` marker to the `WIDGET END` marker. Cutting it short (e.g. missing the `<script>` part at the end) breaks it.
- Method 2: open the loader's URL (e.g. `https://mynaghi.sa/assets/widget.html`) directly in the browser — if it doesn't load there, fix the upload/URL first.
- Open the browser console (**F12 → Console**) and look for red errors mentioning `mn-` or the widget URL.
- If the site has a strict Content-Security-Policy, it must allow `fonts.googleapis.com` and `fonts.gstatic.com`; for Method 2 it must also allow fetching the widget file's URL.

**The font looks different / didn't load**

- Space Grotesk comes from Google Fonts; if it's blocked or slow the widget falls back to a clean system font and keeps working.
- Arabic text always uses the device's Arabic system font — Space Grotesk has no Arabic letters. That's normal.

**Responses don't arrive in the Google Sheet**

- Check the console (**F12 → Console**) for a `[MY NAGHI feedback]` warning — it explains what happened.
- If `formId` still says `YOUR_FORM_ID`, the widget skips sending on purpose — finish part C.
- Confirm you used the **long Form ID from the Send link** (the one containing `/d/e/`), not the ID from the editor's address bar.
- Re-do the **pre-filled link** (C.3) and compare all five `entry.` numbers — one wrong digit sends that value nowhere.
- In the form: no question may be **Required**, and “Limit to 1 response” must be **OFF**.
- Look in the **linked spreadsheet** and in the form's **Responses** tab. The browser's Network tab always shows an opaque “success” for Google Forms (that's a technical limitation) — the Sheet is the only real confirmation.

**The Arabic layout looks wrong (not mirrored / close button on the wrong side)**

- The widget must not sit inside a page element that forces a text direction with `!important`.
- Very old browsers (before 2021) don't support the CSS used for mirroring; all current phones and desktop browsers do.
- Stars filling left-to-right in Arabic is **intentional** — it's the convention in Saudi apps.

**Something else is broken**

- Open the console: **F12** (or **Cmd+Option+I** on Mac) → **Console** tab. Copy the red error text — it usually names the problem — and share it with your developer, or compare your recent edit for a missing quote, comma, or bracket (the most common cause after editing questions).
