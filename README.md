# KAVERI DIGITAL SOLUTIONS — Krushna Kalamkar Portfolio & Studio CMS

Official full-stack portfolio, digital product studio showcase, and CMS for **Krushna Kalamkar** (Founder of **KAVERI DIGITAL SOLUTIONS**, Maharashtra, India).

---

## Key Features

- **Editorial Portfolio & 6 Creative Page Scroll Animations:**
  - **Home (`/`):** Left-aligned editorial hero, interactive portrait card, capabilities showcase, and selected work.
  - **About (`/about`):** Founder story, studio philosophy, and values.
  - **Services (`/services`):** Searchable & filterable catalog of **65 services across 7 categories**.
  - **Work (`/work`):** Portfolio case studies with category filtering and detailed project views.
  - **Résumé (`/resume`):** Printable/downloadable curriculum vitae and timeline.
  - **Contact (`/contact`):** Client enquiry form routed to `kalamkarkrushna007@gmail.com` and `icondigital.pvt.ltd@gmail.com`.
- **Google Sheets Live Visitor Intake Sync (`'Sheet1'!A:G`):**
  - Connected to Google Spreadsheet ID `1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg`.
  - Records `[NAME, AGE, STATE, DATE, TIME, CONSENT, SUBMISSION_ID]` in `Asia/Kolkata` (IST) format.
  - Supports Google OAuth 2.0 (`Google Sheets API v4`), Service Account, and 100% free Google Apps Script Web App Webhook.
- **Studio Admin CMS (`/admin`):**
  - Manage Projects, 65 Services & 7 Categories, Client Enquiries Inbox, Visitor Intake Sheet Records, Skills, Profile, Résumé, and Site Settings.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express (`server.ts`), Vite Middleware
- **Integrations:** Google Sheets API v4, Firebase Google OAuth 2.0

---

## Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server on http://localhost:3000
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## Pushing to Your GitHub Repository

If you downloaded this project as a ZIP or cloned it locally, run:

```bash
git init
git add .
git commit -m "Initial commit: Kaveri Digital Solutions Portfolio & Studio CMS"
git branch -M main
git remote add origin https://github.com/<your-github-username>/<your-repo-name>.git
git push -u origin main
```

---

## Contact

- **Founder:** Krushna Kalamkar
- **Primary Email:** kalamkarkrushna007@gmail.com
- **Business Email:** icondigital.pvt.ltd@gmail.com
- **Location:** Maharashtra, India
