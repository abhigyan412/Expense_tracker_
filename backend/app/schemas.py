from decimal import Decimal
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, field_validator


class CategoryCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be empty")
        return v


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class CategoryWithCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    expense_count: int


class ExpenseCreate(BaseModel):
    title: str
    amount: Decimal
    category_id: int

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title must not be empty")
        return v

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("amount must be greater than 0")
        return v


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: Decimal
    category_id: int
    created_at: datetime
    category: CategoryResponse

    @field_validator("created_at")
    @classmethod
    def mark_utc(cls, v: datetime) -> datetime:
        # SQLite stores CURRENT_TIMESTAMP as naive UTC; attach the tzinfo
        # explicitly so clients don't misinterpret it as local time.
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v


class SummaryResponse(BaseModel):
    total: Decimal
    count: int
    average: Decimal
