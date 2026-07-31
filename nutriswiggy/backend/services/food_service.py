import os
import json
import sqlite3
from typing import List, Dict, Any, Optional

DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "nutriswiggy_foods.db"
)
FALLBACK_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
    "data_ingestion",
    "output",
    "nutriswiggy_foods.db"
)


class FoodService:
    def __init__(self, db_path: Optional[str] = None):
        if db_path and os.path.exists(db_path):
            self.db_path = db_path
        elif os.path.exists(DEFAULT_DB_PATH):
            self.db_path = DEFAULT_DB_PATH
        elif os.path.exists(FALLBACK_DB_PATH):
            self.db_path = FALLBACK_DB_PATH
        else:
            self.db_path = DEFAULT_DB_PATH

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _format_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "code": row["code"],
            "name": row["name"],
            "scientific_name": row["scientific_name"],
            "food_group": row["food_group"],
            "language_names": json.loads(row["language_names"]) if row["language_names"] else {},
            "nutrients": json.loads(row["nutrients"]) if row["nutrients"] else {},
        }

    def get_food_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Retrieves complete food profile by unique food code."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM foods WHERE code = ? OR code = ?", (code, code.upper()))
        row = cursor.fetchone()
        conn.close()
        return self._format_row(row) if row else None

    def search_foods(
        self,
        query: Optional[str] = None,
        food_group: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Fuzzy search foods by name, scientific name, or local language names."""
        conn = self.get_connection()
        cursor = conn.cursor()

        sql = "SELECT * FROM foods WHERE 1=1"
        params: List[Any] = []

        if query:
            q_pattern = f"%{query.strip()}%"
            sql += " AND (name LIKE ? OR scientific_name LIKE ? OR language_names LIKE ?)"
            params.extend([q_pattern, q_pattern, q_pattern])

        if food_group:
            sql += " AND food_group LIKE ?"
            params.append(f"%{food_group.strip()}%")

        sql += " ORDER BY name ASC LIMIT ?"
        params.append(limit)

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()

        return [self._format_row(row) for row in rows]

    def filter_foods_by_nutrient(
        self,
        nutrient: str,
        min_val: Optional[float] = None,
        max_val: Optional[float] = None,
        food_group: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Filter foods based on nutrient threshold values.
        Supports nutrient standard aliases (e.g., protein, energy, fat, fiber, calcium, iron, vitamin_c)
        or direct column codes (e.g. protcnt, enerc, fatce).
        """
        nutrient_clean = nutrient.strip().lower()

        # Alias mapping dictionary
        alias_map = {
            "protein": "protein",
            "protcnt": "protein",
            "energy": "energy",
            "enerc": "energy",
            "fat": "fat",
            "fatce": "fat",
            "fiber": "fiber",
            "fibtg": "fiber",
            "carbohydrates": "carbohydrates",
            "choavldf": "carbohydrates",
            "calcium": "calcium",
            "ca": "calcium",
            "iron": "iron",
            "fe": "iron",
            "vitamin_c": "vitamin_c",
            "vitc": "vitamin_c",
        }

        key = alias_map.get(nutrient_clean, nutrient_clean)

        conn = self.get_connection()
        cursor = conn.cursor()

        # We fetch records and check json_extract or Python filtering for max precision
        cursor.execute("SELECT * FROM foods")
        rows = cursor.fetchall()
        conn.close()

        matched: List[Dict[str, Any]] = []
        for row in rows:
            food_dict = self._format_row(row)
            if food_group and food_group.lower() not in (food_dict["food_group"] or "").lower():
                continue

            nutrients = food_dict.get("nutrients", {})
            nut_entry = nutrients.get(key) or nutrients.get(nutrient_clean)

            if not nut_entry:
                continue

            val = nut_entry.get("value")
            if val is None:
                continue

            if min_val is not None and val < min_val:
                continue

            if max_val is not None and val > max_val:
                continue

            matched.append(food_dict)

        # Sort matched items descending by nutrient value
        matched.sort(
            key=lambda x: (x.get("nutrients", {}).get(key) or {}).get("value", 0),
            reverse=True
        )

        return matched[:limit]
