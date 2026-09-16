from sqlalchemy.orm import Session, joinedload

from app.models import Category, Expense
from app.schemas import ExpenseCreate
from app.exceptions import CategoryNotFoundError


def create_expense(db: Session, expense: ExpenseCreate) -> Expense:
    category = db.query(Category).filter(Category.id == expense.category_id).first()
    if not category:
        raise CategoryNotFoundError(expense.category_id)

    db_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        category_id=expense.category_id,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses_with_category(db: Session):
    return (
        db.query(Expense)
        .options(joinedload(Expense.category))
        .order_by(Expense.created_at.desc())
        .all()
    )
