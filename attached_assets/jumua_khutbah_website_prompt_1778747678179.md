# 🕌 Full Build Prompt — Jumu'ah Khutbah Website

---

## Project Overview

Build a full-stack multilingual website for a university Jumu'ah (Friday prayer) Imam to publish weekly khutbahs (sermons). Visitors select their language and read the khutbah in it. An admin panel (hidden behind a password) lets the Imam add, edit, and delete khutbahs.

---

## 🌐 Supported Languages

Arabic (default/RTL), English, Turkish, French, Urdu (RTL), Farsi/Persian (RTL)

The site must fully support RTL for Arabic, Urdu, and Farsi — flip layout direction, text alignment, and font accordingly.

---

## 📄 Page Structure (Single Page, Scrollable)

### 1. Language Selector — first screen the user sees
- Full-screen splash with the site name in all 6 languages
- 6 large flag/language buttons
- Once selected, the entire site renders in that language
- Language choice is saved in localStorage so it's remembered on return

### 2. About Section
- Brief explanation of what the website is and who it's for
- Content stored in the database per language (admin can edit it)

### 3. Today's Khutbah
- Displays the most recent khutbah
- Shows: Title, Date, Full body text
- All content shown in the currently selected language

### 4. Previous Khutbahs Archive
- A list/grid of all past khutbahs (excluding the current one)
- Each card shows: Title + Date
- Clicking a card expands or opens it to show the full text

### 5. Developer Info Section
- Static footer-like section with developer name, contact, and a short credit line

### 6. Hidden Admin Button
- A very small, discreet button at the very bottom of the page (e.g., a small lock icon or a subtle "•••")
- On click: shows a password input modal
- On correct password: opens the Admin Panel

---

## 🗄️ Database — Firebase Firestore

### Collections

**`khutbahs` collection**, each document:
```json
{
  "id": "auto",
  "date": "timestamp",
  "isCurrent": "boolean",
  "title": { "ar": "", "en": "", "tr": "", "fr": "", "ur": "", "fa": "" },
  "body":  { "ar": "", "en": "", "tr": "", "fr": "", "ur": "", "fa": "" }
}
```

**`settings` collection**, single document:
```json
{
  "adminPassword": "string",
  "aboutText": { "ar": "", "en": "", "tr": "", "fr": "", "ur": "", "fa": "" }
}
```

---

## 🤖 AI Translation (Admin Panel)

- Admin types the Arabic title and body
- A **"Translate All"** button calls the **Anthropic Claude API** (`claude-sonnet-4-20250514`) to auto-translate into English, Turkish, French, Urdu, and Farsi
- Each translated field is shown in an editable text area so the admin can manually correct or override any translation before saving
- Translation prompt must preserve religious tone and terminology (e.g., keep "الله", "رسول", "صلى الله عليه وسلم" respected in translation)

---

## 🔐 Admin Panel (shown after correct password)

### Tab 1 — Add New Khutbah
- Arabic title + body input
- "Translate All" button (calls Claude API)
- Editable fields for all 6 languages
- Date picker (defaults to today)
- "Mark as current khutbah" toggle
- Save button → writes to Firestore

### Tab 2 — Manage Previous Khutbahs
- List of all khutbahs with Edit / Delete buttons
- Edit opens the same form as Add, pre-filled
- Delete asks for confirmation before removing

### Tab 3 — Change Password
- Input: current password
- Input: new password
- Input: confirm new password
- Updates the `settings` document in Firestore

### Tab 4 — Edit About Text
- Editable text area per language for the About section
- Save updates Firestore

---

## 🎨 Design — Islamic / Traditional

| Property | Value |
|---|---|
| Primary color | Deep green `#1B4D2E` |
| Accent color | Gold/amber `#C9A84C` |
| Background | Off-white `#F9F5EC` / dark parchment |
| Arabic font | `Amiri` or `Scheherazade New` (Google Fonts) |
| Latin font | `Lato` or `Open Sans` (Google Fonts) |

- Subtle Islamic geometric patterns as background or section dividers (SVG or CSS-based, no external images required)
- Header: site name in Arabic calligraphy style + a small mosque SVG icon
- Cards: rounded, soft shadow, parchment background with gold border accent
- Smooth scroll, clean transitions between sections
- Fully mobile responsive

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) — preferred |
| Database | Firebase Firestore |
| Auth | None — password stored in Firestore, checked client-side |
| AI Translation | Anthropic Claude API via `fetch` |
| API Key Storage | `.env` file as `VITE_ANTHROPIC_API_KEY` |
| Hosting | Firebase Hosting or Vercel |

---

## ⚙️ Additional Notes

- The Anthropic API key must never be exposed to regular users — the translation call is only triggered inside the password-protected admin panel
- When no khutbah is marked as current, show the most recent by date automatically
- All date formatting should adapt to the selected language locale
- Suggested site name: **"منبر الجمعة"** (The Friday Pulpit) — with a translated subtitle in each language

---

## 🗂️ Suggested File Structure

```
src/
├── components/
│   ├── LanguageSelector.jsx
│   ├── AboutSection.jsx
│   ├── CurrentKhutbah.jsx
│   ├── KhutbahArchive.jsx
│   ├── KhutbahCard.jsx
│   ├── DeveloperInfo.jsx
│   └── AdminPanel/
│       ├── AdminModal.jsx
│       ├── AddKhutbah.jsx
│       ├── ManageKhutbahs.jsx
│       ├── ChangePassword.jsx
│       └── EditAbout.jsx
├── firebase/
│   ├── config.js
│   └── firestore.js
├── utils/
│   └── translate.js        ← Claude API call
├── i18n/
│   └── rtlLanguages.js     ← ['ar', 'ur', 'fa']
├── App.jsx
└── main.jsx
```

---

*Prompt authored for use with AI code builders such as Lovable, Bolt, v0, or Cursor.*
