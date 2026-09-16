from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse, CategoryWithCount
from app.crud import categories as crud_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return crud_categories.create_category(db, category)


@router.get("/", response_model=list[CategoryWithCount])
def list_categories(db: Session = Depends(get_db)):
    return crud_categories.get_categories_with_counts(db)
