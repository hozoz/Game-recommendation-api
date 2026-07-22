# PartsLeb — Car Parts Marketplace for Lebanon 🇱🇧

A single-file marketplace website for buying and selling new & used car parts across Lebanon, similar to PickPart. Buyers browse and filter parts, then contact sellers directly on WhatsApp. Sellers submit new listings through a form that sends you the details on WhatsApp.

Everything lives in one file: **`index.html`** — no build step, no server, no database needed.

## Features

- 🔍 Search + filters: car make, category, condition (New / Used / Refurbished), and city
- 🗂️ 8 part categories (Engine, Brakes, Suspension, Electrical, Body, Interior, Tires & Rims, Accessories)
- 💬 WhatsApp "contact seller" button on every listing, with a pre-filled message
- 📤 "Sell a Part" form that sends listing requests to your WhatsApp
- 📱 Fully responsive (works great on phones)
- 🇱🇧 English UI with Arabic tagline, prices in USD

## Setup — 2 things to change

Open `index.html` and find the `CONFIG` block near the top of the `<script>` section:

```js
const CONFIG = {
  whatsappNumber: "96170123456",  // ← put YOUR WhatsApp number here
  currency: "$",
};
```

The number must be in international format, digits only. For a Lebanese number like `70 123 456`, write `"96170123456"`.

## Adding / editing listings

All parts are in the `LISTINGS` array in `index.html`. Copy an existing entry and edit it:

```js
{
  id: 17,                          // unique number
  name: "Fuel Pump",
  make: "Toyota",                  // new makes appear in the filter automatically
  model: "Corolla 2015–2019",
  category: "Engine",              // must match one of the category names
  condition: "Used",               // "New" | "Used" | "Refurbished"
  price: 60,                       // USD
  city: "Beirut",                  // must match one of the CITIES
  seller: "My Shop Name",
  phone: "96170123456",            // seller's WhatsApp, international format
  icon: "🔧",                      // emoji shown as the part image
  desc: "Tested and working, 1-month warranty."
},
```

Cities and categories are also editable at the top of the script (`CITIES` and `CATEGORIES` arrays).

## Publishing the site (free, via GitHub Pages)

1. Go to your repository **Settings → Pages**
2. Under "Build and deployment", set Source to **Deploy from a branch**
3. Pick your branch and the **/ (root)** folder, then Save
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/` in a minute or two

## Ideas for later

- Replace emoji icons with real part photos (`<img>` in the card thumb)
- Add a real backend (e.g. Firebase or Supabase) so sellers can post listings themselves
- Add Arabic as a full second language with an EN/AR toggle
