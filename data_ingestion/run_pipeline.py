import os
import sys
import shutil

# Ensure workspace paths are in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_ingestion.etl.ifct2017_ingestor import IFCT2017Ingestor
from data_ingestion.etl.db_loader import load_json_to_sqlite


def run():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, "data_ingestion", "raw", "ifct2017")
    output_json = os.path.join(base_dir, "data_ingestion", "output", "ifct2017_normalized.json")
    output_db = os.path.join(base_dir, "data_ingestion", "output", "nutriswiggy_foods.db")

    backend_json = os.path.join(base_dir, "nutriswiggy", "backend", "data", "ifct2017_normalized.json")
    backend_db = os.path.join(base_dir, "nutriswiggy", "backend", "data", "nutriswiggy_foods.db")

    print(f"Starting IFCT 2017 ETL Pipeline...")
    print(f"Raw data source: {raw_dir}")

    # 1. Parse IFCT 2017 CSVs
    ingestor = IFCT2017Ingestor(raw_dir)
    foods = ingestor.export_json(output_json)

    # 2. Populate SQLite Database
    count = load_json_to_sqlite(output_json, output_db)

    # 3. Copy to Backend directory
    os.makedirs(os.path.dirname(backend_json), exist_ok=True)
    shutil.copy2(output_json, backend_json)
    shutil.copy2(output_db, backend_db)

    print(f"ETL Pipeline successfully completed!")
    print(f"Processed {len(foods)} foods.")
    print(f"Generated JSON: {output_json} & {backend_json}")
    print(f"Generated SQLite DB: {output_db} & {backend_db}")


if __name__ == "__main__":
    run()
