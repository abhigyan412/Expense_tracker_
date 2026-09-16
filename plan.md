# Expense Tracker — Build Plan

**Stack:** Next.js (frontend) · FastAPI (backend) · SQLite (database)
**Approach:** Small, clean, production-shaped. Layered backend, hook-based frontend, no unnecessary tooling.

> ⚠️ **STRICT RULE — applies to every phase below, no exceptions:**
> Build exactly what each phase's checklist specifies. No extra files, helpers, abstractions, config options, or "while I'm here" additions beyond what's listed. If a phase's checklist doesn't ask for it, it doesn't get built — even if it seems like good practice. Anything that feels missing gets raised as a question, not added silently. See [DECISION.md#adr-008](./DECISION.md#adr-008-no-over-engineering-governing-rule).

---

## Phase 0 — Setup (15 min)

- [ ] Create root folder `expense-tracker/` with `backend/` and `frontend/`
- [ ] Backend: `python -m venv venv`, activate, `pip install fastapi uvicorn sqlalchemy pydantic`
- [ ] Freeze: `pip freeze > requirements.txt`
- [ ] Frontend: `npx create-next-app@latest frontend` (JS, App Router, no TypeScript needed for this scope, Tailwind optional — see Phase 4)
- [ ] Confirm both run: `uvicorn app.main:app --reload` and `npm run dev`
- [ ] Initialize git, `.gitignore` (venv, node_modules, `*.db`, `.env`)

**Exit criteria:** both servers boot with a placeholder route/page.

---

## Phase 1 — Database Layer (20 min)

- [ ] `database.py`: SQLAlchemy `engine`, `SessionLocal`, `Base`, `get_db()` dependency
- [ ] `models.py`:
  - `Category`: `id`, `name` (unique, not null)
  - `Expense`: `id`, `title`, `amount` (Numeric), `category_id` (FK, `ON DELETE RESTRICT`), `created_at` (server-side default `now()`)
  - Relationship both directions (`category.expenses`, `expense.category`)
- [ ] `Base.metadata.create_all(bind=engine)` on startup in `main.py`
- [ ] Sanity check: open `expenses.db` in a SQLite viewer, confirm both tables + FK exist

**Exit criteria:** tables created correctly, FK constraint verified (try inserting a bad `category_id` directly in SQL — should fail).

---

## Phase 2 — Backend Core (45 min)

- [ ] `schemas.py`:
  - `CategoryCreate`, `CategoryResponse`, `CategoryWithCount`
  - `ExpenseCreate` (validators: `amount > 0`, `title` non-empty/stripped), `ExpenseResponse`
  - `SummaryResponse`
- [ ] `exceptions.py`: `DuplicateCategoryError`, `CategoryNotFoundError`
- [ ] `crud/categories.py`: `create_category`, `get_categories_with_counts`
- [ ] `crud/expenses.py`: `create_expense` (validates category exists), `get_expenses_with_category`
- [ ] `crud/summary.py` (or inline in router): aggregate `total`, `count`, `average` — guard divide-by-zero
- [ ] `routers/categories.py`, `routers/expenses.py`, `routers/summary.py` — thin, call crud only
- [ ] `main.py`: app factory, CORS (restrict to `http://localhost:3000`), mount routers, global exception handlers mapping custom exceptions → `409`/`404` with consistent error envelope

**Exit criteria:** all 5 endpoints work correctly via Swagger UI (`/docs`), including error cases:
- duplicate category name → 409
- expense with bad `category_id` → 404
- negative amount / empty title → 422
- empty summary → `{total: 0, count: 0, average: 0}`, no crash

---

## Phase 3 — Backend Tests (15 min, optional but recommended)

- [ ] `tests/test_api.py` using `pytest` + `TestClient`, separate test DB
- [ ] Cases: create category happy path, duplicate category, create expense happy path, expense with invalid category, negative amount rejected, summary on empty DB, summary with data

**Exit criteria:** `pytest` green.

---

## Phase 4 — Frontend Foundation (25 min)

- [ ] `lib/api.js`: single `request()` wrapper — base URL from `NEXT_PUBLIC_API_URL`, normalizes errors into `ApiError`
- [ ] `lib/api.js` functions: `getCategories`, `createCategory`, `getExpenses`, `createExpense`, `getSummary`
- [ ] `globals.css`: design tokens (colors, spacing, radius, shadow) as CSS variables
- [ ] `components/ui/`: `Card`, `Button`, `Input`, `Select`, `Badge` — small, dumb, reusable
- [ ] Decide: Tailwind vs plain CSS modules — either is fine; don't mix

**Exit criteria:** api.js functions callable from browser console / a test page and return real data.

---

## Phase 5 — Frontend Data Hooks (20 min)

- [ ] `hooks/useCategories.js` — state: `data`, `loading`, `error`; exposes `refetch`, `create`
- [ ] `hooks/useExpenses.js` — same pattern
- [ ] `hooks/useSummary.js` — same pattern
- [ ] `page.js`: compose all three hooks, define `refreshAll()` that calls all `refetch`s, pass down as props/callbacks

**Exit criteria:** page loads real data from backend on mount, no console errors.

---

## Phase 6 — Frontend UI Sections (45 min)

- [ ] `CategorySection.jsx`: input + submit → `createCategory` → `refreshAll()`; list below showing name + expense count badge
- [ ] `ExpenseSection.jsx`: title input, amount input, category `<Select>` (populated from categories), submit → `createExpense` → `refreshAll()`
- [ ] `ExpenseList.jsx`: cards on mobile, table on desktop (breakpoint) — title, amount (formatted 2dp + currency), category badge, formatted date
- [ ] `SummaryCards.jsx`: 3 cards — total, count, average — pinned near top of layout
- [ ] Client-side validation mirrored (non-empty title, amount > 0) with inline error text, not `alert()`
- [ ] Submit buttons disabled while request in-flight
- [ ] Empty states: "No categories yet", "No expenses yet — add your first one"
- [ ] Loading skeletons (or simple spinners) per section while fetching

**Exit criteria:** full flow works — create category → appears in dropdown → create expense → appears in list → summary updates — all without a manual page refresh.

---

## Phase 7 — Polish & Edge Cases (25 min)

- [ ] Error toast/banner when backend returns 409/404/422 — show `error.message` from the envelope
- [ ] Currency formatting via `Intl.NumberFormat`
- [ ] Date formatting via `Intl.DateTimeFormat` or `date-fns`
- [ ] Responsive check at 375px and 1280px widths
- [ ] Keyboard: forms submit on Enter, focus states visible
- [ ] Re-test all backend edge cases through the *UI* (not just Swagger) — duplicate category, bad amount, etc.

**Exit criteria:** no dead ends — every user action has visible feedback (success, error, or loading).

---

## Phase 8 — Documentation & Submission (15 min)

- [ ] Root `README.md`: stack summary, setup steps for backend + frontend, `.env.example`, how to run both, brief architecture note (layered backend, hook-based frontend)
- [ ] Confirm `.gitignore` excludes `venv/`, `node_modules/`, `*.db`, `.env`
- [ ] Final smoke test from a clean clone if time allows
- [ ] Push / zip / submit per challenge instructions

---

## Time Summary

| Phase | Est. Time |
|---|---|
| 0. Setup | 15 min |
| 1. Database Layer | 20 min |
| 2. Backend Core | 45 min |
| 3. Backend Tests | 15 min |
| 4. Frontend Foundation | 25 min |
| 5. Frontend Data Hooks | 20 min |
| 6. Frontend UI Sections | 45 min |
| 7. Polish & Edge Cases | 25 min |
| 8. Docs & Submission | 15 min |
| **Total** | **~3h 45min** (buffer built in for a 4h window) |

---

## Architectural Decisions Log (for interview/review talking points)

- **No Redux/Context** — three independent data hooks + prop composition is sufficient for this scope; avoids indirection that doesn't pay for itself here.
- **No Alembic migrations** — `create_all()` on startup is the right-sized tool for a 2-table SQLite app; stated as a deliberate scope decision.
- **Custom exceptions over inline `HTTPException`** — keeps business logic HTTP-agnostic, single place to map errors → status codes.
- **`ON DELETE RESTRICT`** on the category→expense FK — protects financial data from silent cascade deletion.
- **DB-generated timestamps** (`server_default=func.now()`) — correct under concurrency, not app-clock-dependent.
- **Consistent error envelope** — one frontend error-handling path instead of five ad hoc ones.
- **No auth** — explicit non-goal for this scope, not an oversight.
