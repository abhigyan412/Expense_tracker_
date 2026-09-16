from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.exceptions import DuplicateCategoryError, CategoryNotFoundError
from app.routers import categories, expenses, summary

Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(DuplicateCategoryError)
    def duplicate_category_handler(request: Request, exc: DuplicateCategoryError):
        return JSONResponse(
            status_code=409,
            content={"message": f"category '{exc.name}' already exists"},
        )

    @app.exception_handler(CategoryNotFoundError)
    def category_not_found_handler(request: Request, exc: CategoryNotFoundError):
        return JSONResponse(
            status_code=404,
            content={"message": f"category {exc.category_id} not found"},
        )

    app.include_router(categories.router)
    app.include_router(expenses.router)
    app.include_router(summary.router)

    return app


app = create_app()


@app.get("/")
def root():
    return {"status": "ok"}
