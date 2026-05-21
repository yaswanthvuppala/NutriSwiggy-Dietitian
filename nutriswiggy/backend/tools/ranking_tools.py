import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def to_dict_recursive(val):
    """
    Recursively converts dict-like objects (including Protobuf MapComposite)
    to standard native Python dictionaries/lists.
    """
    if isinstance(val, (list, tuple)):
        return [to_dict_recursive(x) for x in val]
    elif isinstance(val, dict):
        return {k: to_dict_recursive(v) for k, v in val.items()}
    elif hasattr(val, "items"):
        return {k: to_dict_recursive(v) for k, v in val.items()}
    return val

def rank_meals(meals: List[Dict], goal: str = "") -> List[Dict]:
    """
    Ranks meals based on a comprehensive nutrition health score:
    Score = (Protein * 2) - (Calories / 25) - Penalties + Bonuses + (Fiber * 1.5)
    
    Penalties:
      - Deep Fried / Crispy Foods: -15
      - High Sugar Drinks / Shakes: -20
      - Heavy Cream / Processed Cheese: -10
      
    Bonuses:
      - Whole grains / Millets / Quinoa / Oats: +5
      
    Args:
        meals (List[Dict]): List of meals, where each meal contains 'item', 
                             'description', and 'macros' (calories, protein, carbs, fats, fiber).
        goal (str, optional): The user's specific fitness goal to customize ranking weights or badges.
        
    Returns:
        List[Dict]: The ranked meals with 'health_score', 'penalties_applied', 'bonuses_applied', 
                    and premium health badges.
    """
    # Recursively convert all meals to native Python dictionaries to handle MapComposite objects from Gemini SDK
    meals = [to_dict_recursive(m) for m in meals]
    
    ranked_list = []
    
    for meal in meals:
        macros = meal.get("macros", {})
        protein = float(macros.get("protein", 0))
        calories = float(macros.get("calories", 0))
        fiber = float(macros.get("fiber", 0))
        
        text = (meal.get("item", "") + " " + meal.get("description", "")).lower()
        
        # Penalties
        fried_penalty = 0.0
        sugar_penalty = 0.0
        cream_penalty = 0.0
        
        penalties_desc = []
        if any(k in text for k in ["deep fried", "fried", "crispy", "breaded", "fritter"]):
            fried_penalty = 15.0
            penalties_desc.append("Deep fried / high saturated fat")
            
        if any(k in text for k in ["shake", "chocolate syrup", "sugary", "high-sugar", "fudge cream", "loaded chocolate"]) \
                and not any(k in text for k in ["no sugar", "zero sugar", "sugar-free", "erythritol"]):
            sugar_penalty = 20.0
            penalties_desc.append("High refined sugars")
            
        if any(k in text for k in ["heavy cream", "processed cheese", "butter chicken", "liquid cheese"]):
            cream_penalty = 10.0
            penalties_desc.append("Heavy cream or high processed dairy")
            
        total_penalties = fried_penalty + sugar_penalty + cream_penalty
        
        # Bonuses
        whole_grain_bonus = 0.0
        bonuses_desc = []
        if any(k in text for k in ["millet", "ragi", "quinoa", "brown rice", "red rice", "oats", "whole wheat"]):
            whole_grain_bonus = 5.0
            bonuses_desc.append("Complex carbs & whole grains")
            
        # Core Formula Calculation
        raw_score = (protein * 2.0) - (calories / 25.0) - total_penalties + (fiber * 1.5) + whole_grain_bonus
        
        # Convert to an aesthetic 0-100 Health Score with wider spread
        # Raw score typical range: -40 to +55. We map to 5-100.
        # Formula: normalized = (raw - min_raw) / (max_raw - min_raw) * 94 + 5
        normalized_score = raw_score * 1.2 + 42
        health_score = max(5, min(100, round(normalized_score)))
        
        # Generate Smart Badges based on goal and properties
        badges = []
        if health_score >= 80:
            badges.append("Top Pick")
            
        if protein >= 20:
            badges.append("Protein Rich")
            
        if fiber >= 5:
            badges.append("High Fiber")
            
        if macros.get("carbohydrates", 0) <= 10 and health_score > 50:
            badges.append("Keto Friendly")
            
        if calories < 350 and health_score > 60:
            badges.append("Low Calorie")
            
        # Specific Dietitian rationale summary for quick-display
        match_why = "Balanced meal with clean ingredients."
        goal_lower = goal.lower()
        
        if "keto" in goal_lower or "low carb" in goal_lower:
            if "Keto Friendly" in badges or macros.get("carbohydrates", 0) <= 15:
                match_why = "Excellent low-carb selection matching your ketogenic profile."
            else:
                match_why = "Contains moderate/high carbs; recommended in small portions."
        elif "protein" in goal_lower or "muscle" in goal_lower:
            if protein >= 20:
                match_why = f"High protein content ({protein}g) optimizes muscle repair and synthesis."
            else:
                match_why = "Moderate protein; high in vitamins and supporting micronutrients."
        elif "loss" in goal_lower or "calorie" in goal_lower or "fat" in goal_lower:
            if calories < 400:
                match_why = f"Only {calories} kcal helps sustain a calorie deficit while feeling full."
            else:
                match_why = "Nutrient-dense, but consume mindfully to match your daily calorie goal."
                
        # Append score details to a copy of the meal
        meal_copy = meal.copy()
        meal_copy.update({
            "raw_score": round(raw_score, 2),
            "health_score": health_score,
            "badges": badges,
            "penalties_applied": penalties_desc,
            "bonuses_applied": bonuses_desc,
            "match_rationale": match_why
        })
        ranked_list.append(meal_copy)
        
    # Sort in descending order of health_score
    ranked_list.sort(key=lambda x: x.get("health_score", 0), reverse=True)
    return ranked_list

# Quick test if run directly
if __name__ == "__main__":
    test_meals = [
        {
            "item": "Grilled Chicken Protein Bowl",
            "description": "Grilled chicken breast, brown rice, broccoli.",
            "macros": {"calories": 315.0, "protein": 32.0, "carbohydrates": 30.0, "fats": 6.0, "fiber": 4.5}
        },
        {
            "item": "Triple Cheese Crispy Crust Pizza",
            "description": "Deep-fried crispy crust topped with rich heavy cream sauce and cheese.",
            "macros": {"calories": 720.0, "protein": 15.0, "carbohydrates": 65.0, "fats": 35.0, "fiber": 1.5}
        }
    ]
    ranked = rank_meals(test_meals, "muscle gain")
    for r in ranked:
        print(f"\nItem: {r['item']} | Health Score: {r['health_score']}/100 | Badges: {r['badges']}")
        print(f"Rationale: {r['match_rationale']}")
