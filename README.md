# Expense Tracker

A small expense tracker with categories, expenses, and a running summary (total / count / average).

**Stack:** Next.js (frontend) · FastAPI (backend) · SQLite (database)

## Architecture

- **Backend** is layered: `routers/` (thin, HTTP-only) → `crud/` (business logic, framework-agnostic) → `models.py` (SQLAlchemy ORM). Domain errors (duplicate category, category not found) are raised as custom exceptions in `crud/` and mapped to HTTP status codes in one place (`main.py`), rather than scattered `HTTPException` calls.
- **Frontend** is hook-based: `hooks/useCategories`, `useExpenses`, `useSummary` each own their own fetch/loading/error state. `page.js` composes the three hooks and exposes a `refreshAll()` that both create-flows call after a successful mutation. No Redux/Context — the component tree is shallow enough that prop composition is sufficient.

See [`DECISION.md`](DECISION.md) for the full list of architectural decisions and their rationale (no Alembic migrations, `ON DELETE RESTRICT` on the category→expense FK, DB-generated timestamps, etc.), and [`plan.md`](plan.md) / [`TASK.md`](TASK.md) for the build plan and task-by-task progress log.

## Project layout

```
expense-tracker/
  backend/
    app/
      main.py         # app factory, CORS, exception handlers, router mounting
      database.py     # engine, session, get_db()
      models.py       # Category, Expense
      schemas.py      # Pydantic request/response models
      exceptions.py   # DuplicateCategoryError, CategoryNotFoundError
      crud/           # business logic
      routers/        # HTTP endpoints
    tests/
      test_api.py
    requirements.txt
  frontend/
    app/              # Next.js App Router (page.js, layout.js, globals.css)
    components/       # section components (CategorySection, ExpenseSection, ExpenseList, SummaryCards)
    components/ui/    # small reusable primitives (Card, Button, Input, Select, Badge)
    hooks/            # useCategories, useExpenses, useSummary
    lib/api.js         # fetch wrapper + endpoint functions
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` (Swagger UI at `/docs`). It uses a local SQLite file (`expenses.db`), created automatically on first run — no separate database setup needed.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # or create .env.local manually
npm run dev
```

Frontend runs at `http://localhost:3000`. `.env.local` sets `NEXT_PUBLIC_API_URL`, which must point at the running backend (`http://localhost:8000` by default).

### Running both

Start the backend first, then the frontend, each in its own terminal. Both must be running for the app to load data.

### Tests

```bash
cd backend
pytest
```

## Non-goals

- No authentication — out of scope for this exercise.
- No database migrations (Alembic) — schema is created via `create_all()` on startup, appropriate for a 2-table SQLite app.
