# Frontend Test Plan — Fake News Detection System

The frontend is a Vite + React SPA with no business logic heavy enough
to warrant a full Jest/RTL/Cypress suite for this project's scope.
Instead, this document is a structured **manual test checklist** plus
guidance for adding automated tests later if the project grows.

Run `npm run dev` and walk through each section below against a
running backend (`uvicorn backend.main:app --reload`) before any
release or demo.

---

## 1. Authentication

| # | Test | Expected Result |
|---|---|---|
| 1.1 | Visit `/dashboard` while logged out | Redirected to `/login` |
| 1.2 | Register with a valid email + password (≥8 chars) | Account created, auto-logged-in, redirected to `/dashboard` |
| 1.3 | Register with a duplicate email | Inline error: "An account with this email already exists." |
| 1.4 | Register with a password < 8 chars | Inline error before submission (client-side) and/or 422 from server |
| 1.5 | Log in with correct credentials | Redirected to `/dashboard` (or the page you were trying to reach) |
| 1.6 | Log in with wrong password | Inline error: "Incorrect email or password." |
| 1.7 | Refresh the page while logged in | Session persists (JWT re-validated via `/api/auth/me`), no redirect to login |
| 1.8 | Click "Sign out" in the navbar user menu | Redirected to `/login`, token cleared |
| 1.9 | Let the JWT expire (or manually corrupt it in localStorage), then make any API call | Automatically redirected to `/login` |

## 2. Detect News page

| # | Test | Expected Result |
|---|---|---|
| 2.1 | Paste an article < 20 characters | Submit button stays disabled; inline length warning shown |
| 2.2 | Paste a valid article and submit | Loading state on button, then a verdict stamp (REAL/FAKE) appears with confidence gauge |
| 2.3 | Submit the same article twice | Two separate history entries are created (each call is independent) |
| 2.4 | Switch to "Upload file" tab, drag a `.txt` file onto the dropzone | File name + size shown, dropzone highlights during drag |
| 2.5 | Try uploading a `.pdf` or `.docx` | Rejected client-side or server returns 400 with a clear error message |
| 2.6 | Submit with the backend stopped | Error banner: "Could not reach the server…" rather than a silent failure |
| 2.7 | Add an optional headline before pasting text | Headline appears in the resulting History entry |

## 3. Dashboard

| # | Test | Expected Result |
|---|---|---|
| 3.1 | Load dashboard with zero predictions | Stat cards show 0; charts show empty-state messaging, not broken/blank charts |
| 3.2 | Load dashboard after several predictions | Stat cards, doughnut chart, and time-series line chart all reflect real counts |
| 3.3 | Resize to mobile width (< 640px) | Stat card grid collapses to 1–2 columns; charts remain readable |

## 4. History page

| # | Test | Expected Result |
|---|---|---|
| 4.1 | Type into the search box | Results update after a short debounce (~350ms), not on every keystroke |
| 4.2 | Filter by "Real" / "Fake" / "All" | Table updates to match; pagination resets to page 1 |
| 4.3 | Paginate with > 10 results | Prev/Next buttons work; Prev disabled on page 1, Next disabled on last page |
| 4.4 | Search for a term with no matches | Empty state with a clear message, not a blank table |

## 5. Analytics page

| # | Test | Expected Result |
|---|---|---|
| 5.1 | View with no predictions yet | Friendly empty-state message, no chart errors |
| 5.2 | View after predictions exist | Verdict breakdown + 30-day trend chart render; model metrics (accuracy/precision/recall/F1) shown if a trained model exists |

## 6. Reports page

| # | Test | Expected Result |
|---|---|---|
| 6.1 | Click "Download PDF" | A `.pdf` file downloads with a summary table + full prediction history |
| 6.2 | Click "Download CSV" | A `.csv` file downloads, opens cleanly in Excel/Sheets with correct columns |
| 6.3 | Download with zero history | PDF/CSV still generate, showing "no records" rather than crashing |

## 7. Admin Panel (admin account only)

| # | Test | Expected Result |
|---|---|---|
| 7.1 | Log in as a non-admin user, visit `/admin` directly via URL | Redirected to `/dashboard` (route guard works even via direct navigation) |
| 7.2 | Log in as admin, visit `/admin` | Sidebar shows "Admin Panel" link; page loads user table + platform stats |
| 7.3 | Deactivate another user | Their status badge updates to "Disabled" without a full page reload |
| 7.4 | Try to deactivate your own admin account | Action is disabled/blocked with a tooltip explaining why |

## 8. Theming & accessibility

| # | Test | Expected Result |
|---|---|---|
| 8.1 | Toggle dark mode from the navbar | All pages re-theme instantly; preference persists across reloads |
| 8.2 | Tab through the login form using only the keyboard | Visible focus ring on every interactive element, logical tab order |
| 8.3 | Check color contrast on verdict badges (REAL/FAKE) in both themes | Text remains legible against its background in light and dark mode |
| 8.4 | Enable "prefers-reduced-motion" at the OS level | Stamp/needle animations are instant rather than animated |

---

## Adding automated frontend tests later

If this project grows past a portfolio/coursework scope, the
recommended next step is:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Priority candidates for automated coverage, in order:
1. `utils/format.js` — pure functions, trivial to unit test exhaustively.
2. `hooks/useAuth.jsx` — mock `services/api.js` and assert login/logout/register state transitions.
3. `components/NewsInputForm.jsx` — assert the submit button's disabled state across input length boundaries.
4. `components/ProtectedRoute.jsx` / `AdminRoute.jsx` — assert redirect behavior for each auth state.

End-to-end coverage (Playwright or Cypress) would be the next investment after that, scripting the full auth → detect → history → report flow against a real running backend.
