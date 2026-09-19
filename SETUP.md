# SETUP.md — Google Forms Integration Guide

Connect this survey page to a Google Form so all responses flow into a Google Sheet automatically.

---

## Step 1: Create the Google Form

1. Go to [forms.google.com](https://forms.google.com) and click **Blank form**
2. Title it: `OG Derma — Skincare Survey`
3. Add a **Short Answer** question for each field below:

| # | Question Title (exact) | Type |
|---|---|---|
| 1 | Product Selected | Short answer |
| 2 | Q1 – Core Motivator | Short answer |
| 3 | Q2 – Pain Point | Short answer |
| 4 | Q3 – Brand Resonance | Short answer |
| 5 | Q4 – Learning Preference | Short answer |

> **Tip:** Make all questions optional — the hidden POST won't trigger Google's required-field validation.

---

## Step 2: Find Your Form Action URL

1. Open your Google Form in the browser
2. Click the **⋮ menu** (top right) → **Get pre-filled link**
3. Fill in dummy values in all 5 fields and click **Get link**
4. Copy the URL — it will look like:
   ```
   https://docs.google.com/forms/d/e/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform?usp=pp_url&entry.000000001=dummy&entry.000000002=dummy...
   ```
5. Your **Form Action URL** is that URL with `viewform` replaced by `formResponse`:
   ```
   https://docs.google.com/forms/d/e/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/formResponse
   ```

---

## Step 3: Find Your Field Entry IDs

From the pre-filled URL you copied, extract the `entry.XXXXXXXXX` values for each field.

Example URL fragment:
```
...entry.ALl_ingridents_acbe_oily_skin.png89=dummy&entry.987654321=dummy...
```

Your entry IDs will be something like `entry.ALl_ingridents_acbe_oily_skin.png89`.

---

## Step 4: Update `survey.js`

Open `js/survey.js` and replace the TODO constants at the top of the file:

```js
// TODO: Replace with your actual Google Form values
const FORM_ACTION = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
const FIELD_PRODUCT = 'entry.000000001';
const FIELD_Q1      = 'entry.000000002';
const FIELD_Q2      = 'entry.000000003';
const FIELD_Q3      = 'entry.000000004';
const FIELD_Q4      = 'entry.000000005';
```

Replace with your actual values:

```js
const FORM_ACTION = 'https://docs.google.com/forms/d/e/XXXXXXXXXXXXXXX/formResponse';
const FIELD_PRODUCT = 'entry.ALl_ingridents_acbe_oily_skin.png89';
const FIELD_Q1      = 'entry.234567890';
const FIELD_Q2      = 'entry.345678901';
const FIELD_Q3      = 'entry.456789012';
const FIELD_Q4      = 'entry.567890123';
```

---

## Step 5: Test the Integration

1. Open `index.html` in a browser (or your deployed GitHub Pages URL)
2. Click **Buy Now** on either product
3. Complete all 4 survey questions and click **Submit**
4. Open your Google Form responses tab (or the linked Google Sheet)
5. You should see a new row within a few seconds

> **Note on browser errors:** When you submit, your browser's DevTools Network tab will show a CORS error or "opaque" response. **This is expected and normal.** The `no-cors` mode means the browser blocks reading the response, but the data still reaches Google. If the Thank You screen appears, the submission worked.

---

## Step 6: Link Google Sheets (optional but recommended)

1. In your Google Form, click the **Responses** tab
2. Click the **Google Sheets icon** → Create a new spreadsheet
3. All future submissions will appear there in real-time, with timestamps

---

## Step 7: Deploy to GitHub Pages

1. Create a public GitHub repository
2. Push all files (keep `index.html` at the root):
   ```
   index.html
   css/style.css
   js/app.js
   js/survey.js
   assets/images/ALl_ingridents_acbe_oily_skin.png
   assets/images/Simplified_skincare_acne_oily_skin.png
   SETUP.md
   ```
3. Go to **Settings → Pages → Source**: `main` branch, `/ (root)` folder
4. Your live URL will be: `https://<username>.github.io/<repo-name>/`

---

## Step 8: Replace Placeholder Images (when ready)

| File to replace | What it shows |
|---|---|
| `assets/images/ALl_ingridents_acbe_oily_skin.png` | Veritas product photo |
| `assets/images/Simplified_skincare_acne_oily_skin.png` | Skn. product photo |

Just drop your JPG/PNG files at those exact paths and names — no code changes needed.

---

## Step 9: Update the Skn. QR Code URL

In `js/app.js`, find the Skn. product object and update `qrUrl`:

```js
{
  id: 'skn',
  // ...
  qrUrl: '#', // TODO: Replace with video URL
}
```

Change to:
```js
qrUrl: 'https://youtube.com/your-video-link',
```
