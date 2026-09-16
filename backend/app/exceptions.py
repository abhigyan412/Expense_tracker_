class DuplicateCategoryError(Exception):
    def __init__(self, name: str):
        self.name = name


class CategoryNotFoundError(Exception):
    def __init__(self, category_id: int):
        self.category_id = category_id
