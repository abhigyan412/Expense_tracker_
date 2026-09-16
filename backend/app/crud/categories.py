from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Category, Expense
from app.schemas import CategoryCreate
from app.exceptions import DuplicateCategoryError


def create_category(db: Session, category: CategoryCreate) -> Category:
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise DuplicateCategoryError(category.name)

    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_categories_with_counts(db: Session):
    return (
        db.query(
            Category.id,
            Category.name,
            func.count(Expense.id).label("expense_count"),
        )
        .outerjoin(Expense, Expense.category_id == Category.id)
        .group_by(Category.id)
        .all()
    )
