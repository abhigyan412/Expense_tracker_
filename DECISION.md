# Expense Tracker — Architecture Decision Records

Each entry: **Context** (the problem/tension), **Decision** (what we chose), **Consequences** (what we accept as a result). Referenced from [TASK.md](./TASK.md) and [plan.md](./plan.md) where relevant.

---

## ADR-001: No Redux/Context

**Context:** Frontend has three independent data domains — categories, expenses, summary — each needing fetch/loading/error state and a refetch trigger after mutations.

**Decision:** Use three independent custom hooks (`useCategories`, `useExpenses`, `useSummary`) composed in `page.js`, with a `refreshAll()` that calls each hook's `refetch`. No Redux, no Context provider.

**Consequences:** Prop-drilling is acceptable at this scale (single page, shallow component tree). If the app grows multiple routes/pages needing the same state, this decision should be revisited — the hooks are already isolated enough to lift into a Context later without a rewrite.

---

## ADR-002: No Alembic migrations

**Context:** Schema is two tables (`Category`, `Expense`) and is not expected to change during this build.

**Decision:** Use SQLAlchemy's `Base.metadata.create_all(bind=engine)` on app startup instead of introducing Alembic.

**Consequences:** No migration history, no safe path for schema changes on a populated DB. Fine for a fresh SQLite file scoped to this exercise; would need Alembic (or equivalent) before this schema goes anywhere with real, persistent data.

---

## ADR-003: Custom exceptions over inline `HTTPException`

**Context:** Business rules (duplicate category name, expense referencing a missing category) need to produce specific HTTP status codes, but CRUD/business logic shouldn't depend on FastAPI/HTTP concepts.

**Decision:** Raise domain exceptions (`DuplicateCategoryError`, `CategoryNotFoundError`) from the `crud/` layer; map them to HTTP status codes in one place via global exception handlers in `main.py`.

**Consequences:** CRUD functions stay framework-agnostic and are easier to unit test in isolation. Adds one layer of indirection (exception → handler → status code) versus raising `HTTPException` directly in the route.

---

## ADR-004: `ON DELETE RESTRICT` on Category→Expense FK

**Context:** Deleting a category that still has expenses attached to it could silently orphan or cascade-delete financial records.

**Decision:** The `category_id` foreign key on `Expense` uses `ON DELETE RESTRICT`, so a category cannot be deleted while expenses reference it.

**Consequences:** Category deletion (not in current scope, but a likely future feature) will need an explicit "reassign or block" flow rather than a bare delete. This is treated as correct default behavior for financial data, not an oversight to work around.

---

## ADR-005: DB-generated timestamps

**Context:** `Expense.created_at` needs to reflect when the row was actually written, correctly even under concurrent writes from multiple app instances.

**Decision:** Use `server_default=func.now()` so SQLite generates the timestamp, rather than setting it from the application clock (e.g., `datetime.now()` in Python).

**Consequences:** Timestamp correctness doesn't depend on app server clock sync. Slight cost: the value isn't available on the in-memory object until the row is actually flushed/refreshed from the DB.

---

## ADR-006: Consistent error envelope

**Context:** Backend errors (409 duplicate, 404 not found, 422 validation) need to be handled by the frontend in one predictable way rather than one-off per endpoint.

**Decision:** All error responses share one JSON shape (status code + `message`, from the global exception handlers established in [ADR-003](#adr-003-custom-exceptions-over-inline-httpexception)). The frontend's `lib/api.js` `request()` wrapper normalizes every failure into a single `ApiError` type.

**Consequences:** One error-handling code path on the frontend (toast/banner reads `error.message`) instead of five ad hoc ones. Any new backend error type must conform to the envelope or it silently falls outside this handling.

---

## ADR-007: No auth

**Context:** The exercise is scoped to demonstrating CRUD + aggregation across a clean layered backend and hook-based frontend, within a ~4 hour window.

**Decision:** No authentication or authorization is implemented. This is stated explicitly as a scope boundary, not an oversight.

**Consequences:** All data is effectively public/shared within a single local instance. Not suitable to deploy as-is; would need auth (and likely per-user data scoping) before any real-world use.

---

## ADR-008: No over-engineering (governing rule)

**Context:** User directive: build exactly what each phase of [plan.md](./plan.md) specifies, strictly, in every phase, with no exceptions.

**Decision:** No files, helpers, abstractions, config options, or speculative additions are built beyond what a phase's checklist in plan.md / TASK.md explicitly lists — even when they would be reasonable general practice. If something seems missing or worth adding while implementing a phase, it is raised as a question to the user rather than added silently. This rule sits above and constrains every other ADR in this document: e.g. ADR-003's exception layer and ADR-006's error envelope are only built to the extent each phase's checklist calls for, not extended further on initiative.

**Consequences:** Slower to add convenience/robustness that isn't explicitly scoped yet, even if it would obviously be needed later. Trades a small amount of upfront thoroughness for a codebase that stays exactly as large as the plan says it should be, and for the user retaining control over every addition. Applies for the lifetime of this build, across all phases.
