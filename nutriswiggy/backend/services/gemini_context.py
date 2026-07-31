import json
from typing import Dict, Any, Optional


def format_food_for_gemini(food_data: Dict[str, Any], include_micros: bool = True) -> Dict[str, Any]:
    """
    Formats a food's full nutrient profile into a compact, low-token JSON context block
    specifically optimized for passing into Gemini API personalized food recommendation prompts.

    Args:
        food_data: Dict containing raw food record with fields:
                   code, name, scientific_name, food_group, language_names, nutrients.
        include_micros: Whether to include key micronutrients in the context block.

    Returns:
        Compact dictionary structure formatted for LLM system/user context injection.
    """
    if not food_data:
        return {}

    code = food_data.get("code", "")
    name = food_data.get("name", "")
    scientific_name = food_data.get("scientific_name")
    food_group = food_data.get("food_group")
    language_names = food_data.get("language_names", {})
    nutrients = food_data.get("nutrients", {})

    # Helper function to extract nutrient value
    def get_nut(key: str) -> Optional[float]:
        entry = nutrients.get(key)
        if isinstance(entry, dict):
            return entry.get("value")
        return None

    # Key Macros per 100g edible portion
    macros = {
        "energy_kJ": get_nut("enerc") or get_nut("energy"),
        "protein_g": get_nut("protcnt") or get_nut("protein"),
        "total_fat_g": get_nut("fatce") or get_nut("fat"),
        "carbs_g": get_nut("choavldf") or get_nut("carbohydrates"),
        "dietary_fiber_g": get_nut("fibtg") or get_nut("fiber"),
        "moisture_g": get_nut("water"),
    }
    # Filter out None values to minimize token footprint
    compact_macros = {k: v for k, v in macros.items() if v is not None}

    # Extract key local language names (top 4 for prompt compactness)
    selected_langs = {}
    priority_langs = ["Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Gujarati"]
    for lang in priority_langs:
        if lang in language_names:
            selected_langs[lang] = language_names[lang]

    context_block: Dict[str, Any] = {
        "food_code": code,
        "food_name": name,
        "category": food_group,
        "scientific_name": scientific_name,
        "local_names": selected_langs,
        "macros_per_100g": compact_macros,
    }

    if include_micros:
        micros = {
            "calcium_mg": get_nut("ca") or get_nut("calcium"),
            "iron_mg": get_nut("fe") or get_nut("iron"),
            "magnesium_mg": get_nut("mg") or get_nut("magnesium"),
            "potassium_mg": get_nut("k") or get_nut("potassium"),
            "sodium_mg": get_nut("na") or get_nut("sodium"),
            "zinc_mg": get_nut("zn") or get_nut("zinc"),
            "vitamin_c_mg": get_nut("vitc") or get_nut("vitamin_c"),
            "folate_b9_ug": get_nut("folsum") or get_nut("folate_b9"),
            "retinol_vita_ug": get_nut("retol") or get_nut("retinol_vita"),
        }
        compact_micros = {k: v for k, v in micros.items() if v is not None}
        context_block["key_micros_per_100g"] = compact_micros

    return context_block


def build_gemini_recommendation_prompt(food_data: Dict[str, Any], user_profile: Dict[str, Any]) -> str:
    """
    Sample prompt builder demonstrating how the formatted food context block
    is injected into a Gemini prompt for diet recommendations.
    """
    food_context = format_food_for_gemini(food_data)
    json_context_str = json.dumps(food_context, indent=2)

    prompt = f"""
You are NutriSwiggy's AI Dietitian Assistant powered by Gemini.

[User Profile]
Target Calories: {user_profile.get('target_calories', 2000)} kcal
Target Protein: {user_profile.get('target_protein', 120)} g
Dietary Preferences: {user_profile.get('dietary_preference', 'Vegetarian')}

[Food Composition Context (IFCT 2017 Dataset)]
{json_context_str}

Instruction: Based on the food composition context above, explain why this food fits or does not fit the user's daily dietary goals, and suggest an ideal meal serving size.
"""
    return prompt
