from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Expense
from app.schemas import SummaryResponse


def get_summary(db: Session) -> SummaryResponse:
    total, count = db.query(
        func.coalesce(func.sum(Expense.amount), 0), func.count(Expense.id)
    ).first()

    total = Decimal(total) if count else Decimal("0")
    average = (total / count) if count else Decimal("0")

    return SummaryResponse(total=total, count=count, average=average)
