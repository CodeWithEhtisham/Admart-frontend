# Admart Frontend (Vidify)

Frontend for **Vidify** — an AI video automation platform. Users can create, manage, and publish short-form and long-form videos across social channels from a single dashboard.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Linting | ESLint 9 |

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (or pnpm / yarn)

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

## Project structure

```
src/
├── App.jsx              # Route definitions
├── main.jsx             # App entry + BrowserRouter
├── index.css            # Tailwind theme & global styles
├── components/
│   └── VidifySidebar.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── AuthPage.jsx
│   ├── OnboardingPage.jsx
│   ├── DashboardPage.jsx
│   ├── WizardPage.jsx       # Create video flow
│   ├── ProgressPage.jsx
│   ├── ResultPage.jsx
│   ├── PublishingPage.jsx
│   ├── LibraryPage.jsx
│   ├── TemplatesPage.jsx
│   ├── ImageGenPage.jsx
│   ├── SocialAccountsPage.jsx
│   ├── CalendarPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── BillingPage.jsx
│   ├── BrandKitPage.jsx
│   ├── SettingsPage.jsx
│   ├── NotificationsPage.jsx
│   └── NotFoundPage.jsx
└── assets/
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/auth` | Sign in / sign up |
| `/onboarding` | Onboarding |
| `/dashboard` | Dashboard |
| `/create` | Video creation wizard |
| `/progress` | Generation progress |
| `/result` | Generated video result |
| `/publish` | Publishing |
| `/library` | Video library |
| `/templates` | Templates |
| `/image-gen` | AI image generation |
| `/social` | Connected social accounts |
| `/calendar` | Content calendar |
| `/analytics` | Analytics |
| `/brand-kit` | Brand kit |
| `/billing` | Billing |
| `/notifications` | Notifications |
| `/settings` | Settings |

## Design system

The UI uses a dark theme defined in `src/index.css`:

- **Fonts:** Syne (headings), DM Sans (body), JetBrains Mono (code)
- **Colors:** Custom tokens (`base`, `panel`, `surface`, `accent-blue`, platform colors for TikTok, YouTube, Instagram, Facebook)
- **Utilities:** Shared classes such as `gradient-bg`, `gradient-text`, and glass-style panels

## Notes

- This repo is currently **UI-only**: pages use static/mock data; there is no API client or environment configuration yet.
- The app title and branding in the UI are **Vidify**; the repository name is **Admart-frontend**.

## License

Private — see repository owner for usage terms.
