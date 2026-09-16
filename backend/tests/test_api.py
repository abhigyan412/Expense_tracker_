import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_create_category_happy_path(client):
    resp = client.post("/categories/", json={"name": "Food"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Food"


def test_duplicate_category(client):
    client.post("/categories/", json={"name": "Food"})
    resp = client.post("/categories/", json={"name": "Food"})
    assert resp.status_code == 409


def test_create_expense_happy_path(client):
    category = client.post("/categories/", json={"name": "Food"}).json()
    resp = client.post(
        "/expenses/",
        json={"title": "Lunch", "amount": 10, "category_id": category["id"]},
    )
    assert resp.status_code == 201
    assert resp.json()["category"]["id"] == category["id"]


def test_expense_with_invalid_category(client):
    resp = client.post(
        "/expenses/", json={"title": "Bad", "amount": 10, "category_id": 999}
    )
    assert resp.status_code == 404


def test_negative_amount_rejected(client):
    category = client.post("/categories/", json={"name": "Food"}).json()
    resp = client.post(
        "/expenses/",
        json={"title": "X", "amount": -5, "category_id": category["id"]},
    )
    assert resp.status_code == 422


def test_summary_on_empty_db(client):
    resp = client.get("/summary/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 0
    assert float(data["total"]) == 0
    assert float(data["average"]) == 0


def test_summary_with_data(client):
    category = client.post("/categories/", json={"name": "Food"}).json()
    client.post(
        "/expenses/",
        json={"title": "Lunch", "amount": 10, "category_id": category["id"]},
    )
    client.post(
        "/expenses/",
        json={"title": "Dinner", "amount": 20, "category_id": category["id"]},
    )
    resp = client.get("/summary/")
    data = resp.json()
    assert data["count"] == 2
    assert float(data["total"]) == 30
    assert float(data["average"]) == 15
