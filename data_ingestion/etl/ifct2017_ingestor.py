import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from data_ingestion.etl.base_ingestor import BaseFoodIngestor, FoodItem, NutrientValue


class IFCT2017Ingestor(BaseFoodIngestor):
    """
    Parser for IFCT 2017 dataset.
    Loads raw CSV files, joins compositions with descriptions and metadata,
    parses language names, normalizes nutrient units, handles NaNs, and exports JSON.
    """

    def __init__(self, data_dir: str):
        super().__init__(data_dir)
        self.raw_dir = data_dir
        self.lang_map: Dict[str, str] = {}
        self.column_meta: Dict[str, Dict[str, Any]] = {}

    def load_raw_data(self) -> Dict[str, pd.DataFrame]:
        """Loads all relevant CSV files into pandas DataFrames."""
        files = {
            "compositions": os.path.join(self.raw_dir, "compositions", "index.csv"),
            "descriptions": os.path.join(self.raw_dir, "descriptions", "index.csv"),
            "columns": os.path.join(self.raw_dir, "columns", "index.csv"),
            "representations": os.path.join(self.raw_dir, "representations", "index.csv"),
            "languages": os.path.join(self.raw_dir, "languages", "index.csv"),
            "groups": os.path.join(self.raw_dir, "groups", "index.csv"),
        }

        dfs = {}
        for key, filepath in files.items():
            if os.path.exists(filepath):
                dfs[key] = pd.read_csv(filepath, dtype=str)
            else:
                raise FileNotFoundError(f"Required raw dataset file not found: {filepath}")

        # Build language prefix map: e.g. "H." -> "Hindi", "Tam." -> "Tamil"
        if "languages" in dfs:
            for _, row in dfs["languages"].iterrows():
                lang_full = str(row.get("lang", "")).strip()
                abbr = str(row.get("abbr", "")).strip()
                if lang_full and abbr:
                    self.lang_map[abbr] = lang_full

        # Build column metadata map: e.g. "protcnt" -> {"name": "Protein", "unit": "g", "tags": [...]}
        if "columns" in dfs and "representations" in dfs:
            col_df = dfs["columns"].set_index("code")
            rep_df = dfs["representations"].set_index("code")

            for col_code in col_df.index:
                name = col_df.loc[col_code, "name"] if "name" in col_df.columns else col_code
                tags_str = col_df.loc[col_code, "tags"] if "tags" in col_df.columns else ""
                tags = [t.strip() for t in str(tags_str).split() if t.strip()] if pd.notna(tags_str) else []

                unit = ""
                if col_code in rep_df.index:
                    unit_val = rep_df.loc[col_code, "unit"] if "unit" in rep_df.columns else ""
                    if pd.notna(unit_val):
                        unit = str(unit_val).strip()

                self.column_meta[col_code] = {
                    "name": str(name).strip(),
                    "unit": unit,
                    "tags": tags
                }

        return dfs

    def _parse_language_string(self, lang_str: str) -> Dict[str, str]:
        """Parses local language names string into structured dictionary."""
        if not lang_str or pd.isna(lang_str):
            return {}

        res = {}
        # Split entries by ';'
        parts = [p.strip() for p in str(lang_str).split(";") if p.strip()]
        for part in parts:
            # Entry format e.g. "H. Ramdana" or "Kan. Danthu beeja"
            sub_parts = part.split(".", 1)
            if len(sub_parts) == 2:
                prefix = sub_parts[0].strip() + "."
                name = sub_parts[1].strip()
                lang_name = self.lang_map.get(prefix, prefix.rstrip("."))
                if lang_name and name:
                    res[lang_name] = name
            else:
                res["Other"] = part

        return res

    def parse_foods(self) -> List[FoodItem]:
        """Parse raw datasets into normalized list of FoodItem objects."""
        dfs = self.load_raw_data()
        comp_df = dfs["compositions"]
        desc_df = dfs["descriptions"].set_index("code") if "descriptions" in dfs else None

        food_items: List[FoodItem] = []
        meta_cols = {"code", "name", "scie", "lang", "grup", "regn", "tags"}

        # Known common aliases mapping for easy querying
        common_aliases = {
            "protcnt": "protein",
            "enerc": "energy",
            "fatce": "fat",
            "fibtg": "fiber",
            "choavldf": "carbohydrates",
            "water": "water",
            "ca": "calcium",
            "fe": "iron",
            "mg": "magnesium",
            "p": "phosphorus",
            "k": "potassium",
            "na": "sodium",
            "zn": "zinc",
            "vitc": "vitamin_c",
            "thia": "thiamine_b1",
            "ribf": "riboflavin_b2",
            "nia": "niacin_b3",
            "pantac": "pantothenic_acid_b5",
            "vitb6c": "vitamin_b6",
            "biot": "biotin_b7",
            "folsum": "folate_b9",
            "retol": "retinol_vita",
        }

        for idx, row in comp_df.iterrows():
            code = str(row.get("code", "")).strip()
            if not code:
                continue

            name = str(row.get("name", "")).strip()
            scientific_name = str(row.get("scie", "")).strip() if pd.notna(row.get("scie")) else None
            food_group = str(row.get("grup", "")).strip() if pd.notna(row.get("grup")) else None

            # Get description / language info
            lang_str = row.get("lang", "")
            if desc_df is not None and code in desc_df.index:
                desc_row = desc_df.loc[code]
                if pd.notna(desc_row.get("desc")):
                    lang_str = desc_row.get("desc")
                if not scientific_name and pd.notna(desc_row.get("scie")):
                    scientific_name = str(desc_row.get("scie")).strip()
                if not food_group and pd.notna(desc_row.get("grup")):
                    food_group = str(desc_row.get("grup")).strip()

            language_names = self._parse_language_string(lang_str)

            nutrients_dict: Dict[str, Dict[str, Any]] = {}

            # Process columns
            for col in comp_df.columns:
                if col in meta_cols or col.endswith("_e"):
                    continue

                raw_val = row.get(col)
                if pd.isna(raw_val) or raw_val is None:
                    continue

                raw_val_str = str(raw_val).strip()
                if raw_val_str == "" or raw_val_str.lower() in ("nan", "null", "none"):
                    continue

                try:
                    val_float = float(raw_val_str)
                except ValueError:
                    continue

                meta = self.column_meta.get(col, {"name": col, "unit": "", "tags": []})

                nutrient_entry = {
                    "code": col,
                    "name": meta["name"],
                    "value": round(val_float, 4),
                    "unit": meta["unit"],
                    "tags": meta["tags"]
                }

                nutrients_dict[col] = nutrient_entry

                # Add alias mapping for quick nutrient filtering e.g. "protein", "energy", etc.
                if col in common_aliases:
                    alias = common_aliases[col]
                    nutrients_dict[alias] = nutrient_entry

            food_item = FoodItem(
                code=code,
                name=name,
                scientific_name=scientific_name if scientific_name != "nan" else None,
                food_group=food_group if food_group != "nan" else None,
                language_names=language_names,
                nutrients=nutrients_dict,
                source="IFCT 2017"
            )

            food_items.append(food_item)

        return food_items

    def export_json(self, output_filepath: str) -> List[FoodItem]:
        """Parses foods and writes normalized output to clean JSON file."""
        foods = self.parse_foods()
        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)

        data_to_export = [food.to_dict() for food in foods]

        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(data_to_export, f, indent=2, ensure_ascii=False)

        print(f"Successfully exported {len(foods)} normalized foods to {output_filepath}")
        return foods
