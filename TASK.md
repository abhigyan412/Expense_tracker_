# Expense Tracker — Task Tracker

Status legend: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`
This file tracks execution against [plan.md](./plan.md). Update status inline as work proceeds; do not reorder completed tasks.

> ⚠️ **STRICT RULE — every phase, no exceptions:** only the tasks listed in a phase's row get built. No extra files, helpers, abstractions, or "nice to have" additions outside the checklist — flag anything that seems missing as a question instead of adding it. See [DECISION.md#adr-008](./DECISION.md#adr-008-no-over-engineering-governing-rule).

---

## Phase 0 — Setup

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | Create root folder `expense-tracker/` with `backend/` and `frontend/` | DONE | |
| 0.2 | Backend venv + install `fastapi uvicorn sqlalchemy pydantic` | DONE | |
| 0.3 | `pip freeze > requirements.txt` | DONE | |
| 0.4 | Scaffold frontend with `create-next-app` (JS, App Router) | DONE | No TS, no Tailwind (deferred to Phase 4 per plan) |
| 0.5 | Confirm both dev servers boot | DONE | Backend `{"status":"ok"}`, frontend HTTP 200 |
| 0.6 | Init git + `.gitignore` (venv, node_modules, `*.db`, `.env`) | DONE | Verified via `git status --ignored`; not committed (not requested) |

**Exit gate:** both servers boot with a placeholder route/page.

---

## Phase 1 — Database Layer

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | `database.py` — engine, `SessionLocal`, `Base`, `get_db()` | DONE | Also enables `PRAGMA foreign_keys=ON` via event listener — required for SQLite to enforce the FK at all |
| 1.2 | `models.py` — `Category` model (id, unique name) | DONE | |
| 1.3 | `models.py` — `Expense` model (id, title, amount, category_id FK `ON DELETE RESTRICT`, created_at) | DONE | See [DECISION.md#adr-004](./DECISION.md#adr-004-on-delete-restrict-on-categoryexpense-fk) |
| 1.4 | Bidirectional relationship (`category.expenses`, `expense.category`) | DONE | |
| 1.5 | `create_all()` on startup in `main.py` | DONE | See [DECISION.md#adr-002](./DECISION.md#adr-002-no-alembic-migrations) |
| 1.6 | Sanity check tables + FK in SQLite viewer | DONE | Verified via sqlite3 CLI: tables + FK present, bad category_id insert rejected |

**Exit gate:** tables created correctly; FK constraint verified with a bad `category_id` insert.

---

## Phase 2 — Backend Core

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | `schemas.py` — Category schemas (`Create`, `Response`, `WithCount`) | DONE | |
| 2.2 | `schemas.py` — Expense schemas + validators (`amount > 0`, non-empty title) | DONE | |
| 2.3 | `schemas.py` — `SummaryResponse` | DONE | |
| 2.4 | `exceptions.py` — `DuplicateCategoryError`, `CategoryNotFoundError` | DONE | See [DECISION.md#adr-003](./DECISION.md#adr-003-custom-exceptions-over-inline-httpexception) |
| 2.5 | `crud/categories.py` — `create_category`, `get_categories_with_counts` | DONE | |
| 2.6 | `crud/expenses.py` — `create_expense` (validates category exists), `get_expenses_with_category` | DONE | |
| 2.7 | Summary aggregation (`total`, `count`, `average`) — guard divide-by-zero | DONE | Fixed a `Decimal('0E-10')` formatting bug on empty DB so total renders as clean `0` |
| 2.8 | `routers/categories.py`, `routers/expenses.py`, `routers/summary.py` (thin, call crud only) | DONE | |
| 2.9 | `main.py` — app factory, CORS to `localhost:3000`, mount routers, exception handlers → 409/404 envelope | DONE | See [DECISION.md#adr-006](./DECISION.md#adr-006-consistent-error-envelope) |

**Exit gate:** all 5 endpoints verified via Swagger (`/docs`), including error cases (409 duplicate, 404 bad category, 422 invalid input, empty summary = zeros).

---

## Phase 3 — Backend Tests *(optional but recommended)*

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | `tests/test_api.py` scaffold with `pytest` + `TestClient`, separate test DB | DONE | Separate SQLite file (`tests/test.db`) via `dependency_overrides`; not committed |
| 3.2 | Test: create category happy path | DONE | |
| 3.3 | Test: duplicate category → 409 | DONE | |
| 3.4 | Test: create expense happy path | DONE | |
| 3.5 | Test: expense with invalid category → 404 | DONE | |
| 3.6 | Test: negative amount rejected → 422 | DONE | |
| 3.7 | Test: summary on empty DB | DONE | |
| 3.8 | Test: summary with data | DONE | |

**Exit gate:** `pytest` green.

---

## Phase 4 — Frontend Foundation

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | `lib/api.js` — `request()` wrapper, `NEXT_PUBLIC_API_URL`, `ApiError` normalization | DONE | Added `frontend/.env.local` (gitignored) so the URL is actually set for dev |
| 4.2 | `lib/api.js` — `getCategories`, `createCategory`, `getExpenses`, `createExpense`, `getSummary` | DONE | |
| 4.3 | `globals.css` — design tokens as CSS variables | DONE | Extended scaffold's existing tokens, didn't replace |
| 4.4 | `components/ui/` — `Card`, `Button`, `Input`, `Select`, `Badge` | DONE | |
| 4.5 | Decide Tailwind vs CSS modules (commit to one) | DONE | CSS Modules — frontend was scaffolded without Tailwind |

**Exit gate:** api.js functions callable from console / test page, return real data.

---

## Phase 5 — Frontend Data Hooks

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | `hooks/useCategories.js` (`data`, `loading`, `error`, `refetch`, `create`) | DONE | |
| 5.2 | `hooks/useExpenses.js` (same pattern) | DONE | |
| 5.3 | `hooks/useSummary.js` (same pattern) | DONE | |
| 5.4 | `page.js` — compose hooks, `refreshAll()`, pass down as props | DONE | See [DECISION.md#adr-001](./DECISION.md#adr-001-no-reduxcontext). Minimal interim rendering only — Phase 6 builds the real UI sections |

**Exit gate:** page loads real data on mount, no console errors.

---

## Phase 6 — Frontend UI Sections

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | `CategorySection.jsx` — create form + list w/ expense-count badge | DONE | |
| 6.2 | `ExpenseSection.jsx` — title/amount/category form | DONE | Disabled + hinted when no categories exist yet |
| 6.3 | `ExpenseList.jsx` — cards (mobile) / table (desktop), formatted amount + date | DONE | CSS-breakpoint toggle at 640px |
| 6.4 | `SummaryCards.jsx` — total / count / average, pinned near top | DONE | |
| 6.5 | Client-side validation mirrored, inline errors (no `alert()`) | DONE | |
| 6.6 | Disable submit buttons while request in-flight | DONE | |
| 6.7 | Empty states for categories & expenses | DONE | Exact wording from plan |
| 6.8 | Loading skeletons/spinners per section | DONE | Simple text, per plan's explicit "or simple spinners" allowance |

**Exit gate:** full flow works end-to-end without a manual page refresh.

---

## Phase 7 — Polish & Edge Cases

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Error toast/banner surfacing `error.message` from envelope | TODO | |
| 7.2 | Currency formatting (`Intl.NumberFormat`) | TODO | |
| 7.3 | Date formatting (`Intl.DateTimeFormat` / `date-fns`) | TODO | |
| 7.4 | Responsive check at 375px and 1280px | TODO | |
| 7.5 | Keyboard: Enter-to-submit, visible focus states | TODO | |
| 7.6 | Re-test backend edge cases through the UI (not just Swagger) | TODO | |

**Exit gate:** every user action has visible feedback (success, error, or loading).

---

## Phase 8 — Documentation & Submission

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | Root `README.md` (stack, setup, `.env.example`, run instructions, architecture note) | DONE | Also copied `plan.md`/`TASK.md`/`DECISION.md` into the repo so README's links resolve on GitHub |
| 8.2 | Confirm `.gitignore` covers `venv/`, `node_modules/`, `*.db`, `.env` | DONE | Fixed a bug: `create-next-app`'s own `frontend/.gitignore` had a blanket `.env*` rule silently swallowing `.env.example` too; added `!.env.example` negation |
| 8.3 | Final smoke test from a clean clone (if time allows) | DONE | `pytest` 7/7 green; both dev servers confirmed still responsive |
| 8.4 | Push / zip / submit per challenge instructions | IN PROGRESS | Pushing to https://github.com/abhigyan412/Expense_tracker.git |

---

## Progress Summary

| Phase | Tasks | Done | Status |
|---|---|---|---|
| 0. Setup | 6 | 6 | DONE |
| 1. Database Layer | 6 | 6 | DONE |
| 2. Backend Core | 9 | 9 | DONE |
| 3. Backend Tests | 8 | 8 | DONE |
| 4. Frontend Foundation | 5 | 5 | DONE |
| 5. Frontend Data Hooks | 4 | 4 | DONE |
| 6. Frontend UI Sections | 8 | 8 | DONE |
| 7. Polish & Edge Cases | 6 | 0 | TODO |
| 8. Docs & Submission | 4 | 3 | In progress |
| **Total** | **56** | **49** | **In progress** |
