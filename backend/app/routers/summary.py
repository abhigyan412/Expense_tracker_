from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SummaryResponse
from app.crud import summary as crud_summary

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    return crud_summary.get_summary(db)
