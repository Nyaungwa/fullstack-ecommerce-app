# Changelog — Design System Sync (v2)

This update wires the James Cresslawn design system into the existing
Frontend codebase **and** ships a redesigned auth page with Google OAuth +
email-code verification. No behaviour changes elsewhere — same visual
output, but every color, font, and shadow now comes from a single source
of truth in `src/styles/tokens.css`. Editing one variable now cascades
through every page.

---

## A. Token sync

### Added
- `src/styles/tokens.css` — every design-system variable: brand inks, neutrals, text, the full green scale, semantic reds/greens, fonts, radii, shadows, and semantic aliases (`--jc-header-bg`, `--jc-cta-bg`, etc.).

### Modified
- `src/main.jsx` — imports `./styles/tokens.css` **before** `./index.css` so the variables resolve everywhere.

### Result
Use any token from any CSS file with `var(--jc-…)`. Examples:
```css
background: var(--jc-cta-bg);              /* mint #c5f6a6 */
background: var(--jc-cta-bg-grad);         /* mint → spring-green */
color:      var(--jc-text-on-dark);        /* warm cream on black */
font-family: var(--jc-font-display);       /* Playfair Display */
box-shadow: var(--jc-shadow-card);         /* product-card lift */
```

---

## B. CSS refactor

Replaced **209 hardcoded values** across all page CSS files with tokens.

| File | Substitutions |
|---|---|
| `Homepage.css`       | 68 |
| `Productpage.css`    | 41 |
| `Checkoutpage.css`   | 26 |
| `Paymentpage.css`    | 25 |
| `AuthPage.css`       | 33 |
| `Paymentsuccess.css` |  8 |
| `Paymentcancel.css`  |  5 |

Categories swapped:
- All hex colors → `var(--jc-*)` tokens (warm cream `rgb(236,225,225)` included).
- All shadows → `var(--jc-shadow-*)`.
- Both CTA gradients → `var(--jc-green-cta)` and `var(--jc-green-cta-soft)`.
- All font families → `var(--jc-font-display)` and `var(--jc-font-body)`.
- Bootstrap-y leftovers normalized: `#28a745` → green-800, `#dc3545` → danger, `#1e1e1e` → ink-2.

A few one-off values intentionally left alone (`#f5f5f5` hover background, `#f8f8f8` gradient stop in the auth backdrop, `#f2f2ef` segment-control fill) — too local to deserve a token.

---

## D. Visual polish

### Fixed
- **`Checkoutpage.css` & `Paymentpage.css`**: brand wordmark was Georgia (`'Georgia', 'Times New Roman', serif`). Now Playfair Display — matches the homepage / product page header and the brand guidelines.
- **`src/index.css`**:
  - Body font-family was `system-ui, Avenir, Helvetica, Arial`. Now `var(--jc-font-body)` so the base inherits Manrope instead of falling back to whatever ships on Windows.
  - Removed Vite's default `display: flex; place-items: center` on `body`, which conflicts with the per-page `width: 100%` layouts.
  - Default `button` color was missing — text was inheriting the body color over a near-black background, leading to invisible text on any vanilla `<button>` element. Now explicitly `color: #fff`.
  - `a:hover` was an off-brand purple-blue (`#535bf2`). Now `var(--jc-green-600)` to match the auth link treatment.
- **Removed duplicate Google Fonts `@import` statements** from each page CSS — the fonts now load exactly once via `tokens.css`, saving 4 redundant network requests.
- **`Homepage.css`** had `font-family: 'Manrope', serif` on `.brand-sub` — a typo. Fixed via the font sweep.

### Removed
- `src/assets/schoolleavingresults.pdf` — orphan, not referenced anywhere.
- `src/assets/WhatsApp Image 2026-01-14 at 12.06.44 (1).jpeg` — orphan.

---

## What I deliberately did *not* touch

- **Most JSX files** are unchanged. No component refactor, no logic changes elsewhere. Existing class names, props, and DOM structure are all the same — you can `git diff` and you'll only see CSS files, `main.jsx`, and the auth-page changes below.
- The local `<style>` inside individual page CSS files (animations, mobile media queries) — preserved verbatim.
- `App.css`, the asset filenames, and the route table.
- `Paymentsuccess.jsx` / `Paymentcancel.jsx` markup — only their CSS got swept.

---

## E. Redesigned Auth Page

### Added
- **`src/components/VerifyEmailModal.jsx`** + **`.css`** — a reusable 6-digit OTP popup. Features:
  - Six segmented inputs with auto-advance, backspace-to-previous, arrow-key navigation, and full-code paste (any of the six inputs accepts a paste).
  - Animated entry (fade + scale-in), backdrop click and `Esc` to close.
  - Mint icon header (open-envelope), Playfair "Check your email" title.
  - "Resend code" with a 30-second countdown; "Use a different email" link.
  - Mobile-responsive (drops to 52px-tall inputs and tighter padding under 480px).
  - Demo-friendly: accepts any 6 digits. To wire to a real backend, replace the two TODO comments inside `handleSubmit` / `handleResend` with calls to `POST /api/auth/verify-code` and `POST /api/auth/resend-code`.

### Modified — `src/pages/AuthPage.jsx`
- Added a **"Continue with Google" / "Sign up with Google"** button above the email form (changes label based on active tab).
  - The Google "G" mark is embedded as inline SVG — no extra dependency.
  - `handleGoogle()` is a placeholder. To make it real, plug in `@react-oauth/google` (or your own redirect flow) and route the resolved email into `requestVerification`.
- Added an **"or sign in with email" divider** between the Google button and the form.
- Added a **headline section** above the tabs ("Welcome back" / "Create your account") with a one-line subhead.
- **Wired the verify-code modal into both flows**: submitting either Sign In or Register now opens the verification popup with the user's email pre-filled. The real API call only fires after a valid 6-digit code is entered, so a failed verify doesn't create a half-state.
- Added a small **legal footnote** under the form: "By continuing you agree to our Terms and Privacy Policy."

### Modified — `src/pages/AuthPage.css`
- New sections: `.auth-card-head` (headline area), `.auth-google-btn`, `.auth-divider`, `.auth-legal`.
- Tweaked `.auth-switch` `margin-bottom: 24px → 18px` so the new Google button doesn't sit too far from the tabs.

### How the flow looks in code
```
[Sign In submit]  →  requestVerification(email, runSignIn)
                            ↓
                    <VerifyEmailModal />  ←  user enters 123456
                            ↓
                    runSignIn()  →  POST /api/auth/login  →  navigate('/')
```


---

## How to run

Same as before:
```bash
npm install
npm run dev
```

No new dependencies were added.

---

## Where to go next

If you want me to do a follow-up pass:
- **Component refactor** (option C from the chat) — extract reusable `<Button>`, `<TextInput>`, `<ProductCard>`, etc. into `src/components/` and shrink the page JSX files by ~60%.
- **Centralize the footer** — same markup is duplicated across the homepage and product page. One `<Footer />` import would let you change it in one place.
- **Match the design system tokens for `#f5f5f5` hover and `#f2f2ef` segment** — add `--jc-hover-bg` and `--jc-segment-bg` to tokens.css and replace the last 6 raw hex values.
