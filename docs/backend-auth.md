# Admart Auth — Backend-Owned Identity

> Audience: backend + frontend + future Android/iOS  
> Goal: One auth system that works on web and mobile without replacing Clerk/Firebase later  
> Related: `README.md` (`/api/auth/*`), `src/pages/AuthPage.jsx`, Django `users`  
> Decision date: 2026-08-31

---

## 1. Decision

**Admart owns the user and the session.** Google, Facebook, Apple, etc. only prove who the person is.

| Layer | Role |
| ----- | ---- |
| Google / Facebook / Apple | Identity provider (ID token) |
| Django `User` + SimpleJWT | Source of truth: user row, access token, refresh token |
| Web / Android / iOS | Call **only** `/api/auth/*`; store **Admart** tokens |

Do **not** make Clerk or Firebase Auth the product session. They can stay as optional helpers, but APIs, credits, projects, and mobile clients must trust **Admart JWT** only.

Clerk on the current frontend is a **web shortcut** (Google SSO via `@clerk/react`). Email/password already goes to Django. Target state: Google (and later Facebook) also go to Django, same JWT pair as login.

---

## 2. Why not Clerk or Firebase as the long-term system

| | Clerk | Firebase Auth | Admart JWT + Google OIDC |
| --- | --- | --- | --- |
| Who owns the user | Clerk | Google/Firebase | **Django `User`** |
| Mobile | Clerk SDKs | Firebase SDKs | **Same REST API** |
| Extra providers later | Their catalog + pricing | Their catalog + pricing | New endpoint, same JWT |
| Email verification | Their product | Their product | Token/code + our SMTP |
| Cost (email + Google, &lt;50k MAU) | Hobby $0 | $0 | **$0** |
| Cost after ~50k MAU | Pro ~$20–25/mo + MRU | ~$0.0055/MAU (Identity Platform) | **$0** (Google Sign-In is free) |
| Swap later | Rewrite every client | Rewrite every client | Apps unchanged |

Firebase is still useful later for **FCM, Crashlytics, Analytics** — not for “who is logged in.”

Phone/SMS OTP is the expensive auth feature (per-message). Skip it until product requires it.

---

## 3. Client contract (web + Android + iOS)

All clients use the same endpoints. Success for login / register / Google / Facebook returns:

```json
{
  "accessToken": "…",
  "refreshToken": "…",
  "user": {
    "id": "…",
    "email": "user@example.com",
    "firstName": "…",
    "lastName": "…",
    "emailVerified": true
  }
}
```

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/auth/register` | Email + password sign up |
| `POST` | `/api/auth/login` | Email + password |
| `POST` | `/api/auth/google` | Exchange Google ID token / auth code |
| `POST` | `/api/auth/facebook` | Future — Facebook Login token |
| `POST` | `/api/auth/apple` | Future — required on iOS if other social login is offered |
| `POST` | `/api/auth/refresh` | New access token |
| `POST` | `/api/auth/logout` | Blacklist refresh |
| `GET` / `PATCH` | `/api/auth/me` | Current user |
| `POST` | `/api/auth/forgot-password` | Request reset email |
| `POST` | `/api/auth/reset-password` | Complete reset |
| `POST` | `/api/auth/verify-email` | Confirm email token/code |
| `POST` | `/api/auth/resend-verification` | Resend verify email |

Every authenticated API call:

```
Authorization: Bearer <accessToken>
```

Refresh storage:

- Web: httpOnly cookie preferred; current SPA uses `localStorage` — migrate when possible
- Android: EncryptedSharedPreferences
- iOS: Keychain

---

## 4. Google Sign-In (large-app procedure)

OAuth 2.0 + OpenID Connect. Google never becomes the session for billing or jobs.

```
Web / Android / iOS
        │  Google Sign-In → Google ID token (or auth code)
        ▼
POST /api/auth/google  { "idToken": "…" }
        │
        ▼
Django verifies token (signature, iss, aud, exp)
        │
        ▼
Find or create User (link by verified email)
        │
        ▼
Return Admart accessToken + refreshToken
```

### Backend must verify

- Signature against Google’s JWKS
- `iss` is Google
- `aud` is **this app’s** Google client ID (web / Android / iOS each have their own client ID; accept the set you issued)
- `exp` not expired
- Prefer `email_verified === true` before treating email as trusted

Then: upsert `User`, issue SimpleJWT pair. Discard the Google token.

### Clients

| Platform | How they get the Google token |
| -------- | ----------------------------- |
| Web | Google Identity Services (GIS) or auth-code redirect; **not** Clerk as session owner |
| Android | Credential Manager / Google Sign-In SDK |
| iOS | Google Sign-In SDK |

Never put a Google **client secret** in a mobile app. Web auth-code flow: secret stays on the server.

`POST /api/auth/google` already exists in the API map. Frontend Google button should call it instead of `signIn.sso()` from Clerk.

---

## 5. More login options later (Facebook, Apple, …)

Same pattern — new provider, same JWT.

```
POST /api/auth/facebook  { "accessToken": "…" }
POST /api/auth/apple     { "identityToken": "…" }
```

### Login vs publish (do not mix)

| | Facebook **Login** | Facebook **Publish** |
| --- | --- | --- |
| Purpose | Sign in to Admart | Connect a Page to post content |
| Token | Short-lived login token → Admart JWT | Long-lived Page token on `SocialAccount` |
| API | `/api/auth/facebook` | `/api/projects/:id/social/connect/facebook` |

Publishing OAuth is not the product session.

### Account linking

If `me@gmail.com` registers with password, then later signs in with Facebook/Google using the same **verified** email → **one** `User`. Do not create a second account.

If emails differ, create a new user or require an explicit “link account” step while already logged in.

### Apple

If the iOS app offers Google (or Facebook) login, Apple typically requires **Sign in with Apple** as well. Plan `POST /api/auth/apple` before App Store social login.

### Cost

Google Sign-In, Facebook Login, and Sign in with Apple are **free**. Cost appears only if you wrap them in Clerk/Firebase.

Ship **email + Google** first. Add Facebook login when product needs it.

---

## 6. Email verification

Not a paid Clerk/Firebase feature. Same idea as password reset: a secret the backend issued.

You already have `forgot-password` / `reset-password`. Verification is parallel.

### Flow

1. `POST /api/auth/register` creates `User` with `email_verified=false`.
2. Backend emails a **one-time token** or 6-digit code (TTL 15–60 minutes).
3. User hits `/verify-email?token=…` or submits the code.
4. `POST /api/auth/verify-email` sets `email_verified=true`.
5. Until verified: **block generation, credits spend, and publish** (login may still be allowed so they can resend). Tightest option: also block login.

Resend: `POST /api/auth/resend-verification` with rate limits (example: 1/minute, 5/hour) to stop email bombs.

Social login: treat email as verified **only if** the provider asserts `email_verified`.

### Cost

The check is free. You pay **SMTP**:

| Sender | Use |
| ------ | --- |
| Gmail SMTP | Local/dev only |
| Resend / Postmark / Amazon SES | Production; free/cheap starter tiers, then cents per 1k emails |

Do not buy Clerk for verification emails.

---

## 7. Security baseline

Implement on the **API**. This is what scales.

- Passwords hashed by Django (never store plaintext).
- Verify all third-party tokens **on the server**; never trust the client.
- `aud` must match **our** OAuth client IDs.
- Email verify before generation / billing.
- Reset and verify tokens: single-use, short TTL.
- Rate-limit `login`, `register`, `forgot-password`, `resend-verification`, social exchange.
- HTTPS only.
- Lock or CAPTCHA after repeated failed logins.
- One user row for the same verified email across providers.
- Refresh tokens rotatable + blacklist on logout (`POST /api/auth/logout`).
- TOTP MFA can be added later on Django if needed; SMS MFA is paid and optional.

---

## 8. Frontend migration (current hybrid → target)

**Today**

- Email/password → `/api/auth/register` + `/login` → `localStorage` JWT
- Google → Clerk `signIn.sso` / `ClerkProvider`
- API interceptor prefers Clerk `getToken()`, else `accessToken`

**Target**

1. Backend: `POST /api/auth/google` verifies Google token and returns the same JWT shape as login.
2. Auth page: Google button obtains Google ID token (GIS), posts to `/api/auth/google`, stores Admart tokens.
3. `ProtectedRoute` and `api.js` use Admart JWT only (drop `ClerkApiBridge` as session owner).
4. Remove `@clerk/react` / `ClerkProvider` when Google no longer depends on it.
5. Android/iOS reuse the same endpoints.

Until step 2–3 ship, do not add Firebase Auth as a second identity system.

---

## 9. Backend checklist

- [ ] `POST /api/auth/google` accepts ID token (and/or auth code), verifies `aud`/`iss`/`exp`
- [ ] Same response shape as login (`accessToken`, `refreshToken`, `user`)
- [ ] Link-or-create by verified email
- [ ] `email_verified` on `User`; social respects provider flag
- [ ] Verify-email + resend endpoints + transactional email (SES or Resend)
- [ ] Rate limits on auth endpoints
- [ ] Register Google OAuth client IDs: web, Android, iOS (same backend audience list)
- [ ] Later: `POST /api/auth/facebook` and `POST /api/auth/apple` without changing JWT contract

---

## 10. What not to do

- Call Google/Clerk/Firebase on every Admart API request
- Use Facebook **publish** tokens as login sessions
- Put OAuth client secrets in mobile apps
- Run Clerk users and Django users as two sources of truth
- Replace Clerk with Firebase Auth “so mobile works” — mobile should call Admart

---

*Pair with `README.md` API map. Frontend Google wiring is the remaining gap vs this contract.*
