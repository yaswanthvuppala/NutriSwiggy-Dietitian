import os
import json
import sqlite3
from typing import List, Dict, Any


def init_db(db_path: str) -> sqlite3.Connection:
    """Initializes the SQLite database schema."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS foods (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        scientific_name TEXT,
        food_group TEXT,
        language_names TEXT,
        nutrients TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_foods_group ON foods(food_group);")

    conn.commit()
    return conn


def load_json_to_sqlite(json_filepath: str, db_path: str) -> int:
    """Loads normalized JSON dataset into SQLite database table."""
    if not os.path.exists(json_filepath):
        raise FileNotFoundError(f"JSON data file not found: {json_filepath}")

    with open(json_filepath, "r", encoding="utf-8") as f:
        foods_data: List[Dict[str, Any]] = json.load(f)

    conn = init_db(db_path)
    cursor = conn.cursor()

    inserted_count = 0
    for food in foods_data:
        code = food.get("code")
        name = food.get("name")
        scientific_name = food.get("scientific_name")
        food_group = food.get("food_group")
        language_names_json = json.dumps(food.get("language_names", {}), ensure_ascii=False)
        nutrients_json = json.dumps(food.get("nutrients", {}), ensure_ascii=False)

        cursor.execute("""
            INSERT OR REPLACE INTO foods (code, name, scientific_name, food_group, language_names, nutrients)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (code, name, scientific_name, food_group, language_names_json, nutrients_json))

        inserted_count += 1

    conn.commit()
    conn.close()

    print(f"Successfully loaded {inserted_count} food items into SQLite database: {db_path}")
    return inserted_count
