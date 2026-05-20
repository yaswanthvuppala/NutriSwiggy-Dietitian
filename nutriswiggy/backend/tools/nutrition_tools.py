import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

def estimate_macros(item_name: str, description: str) -> Dict[str, float]:
    """
    Estimates the macronutrient composition of a food item based on its name and description.
    Provides approximate, highly realistic nutritional values.
    
    Args:
        item_name (str): Name of the dish (e.g. 'Grilled Chicken Protein Bowl').
        description (str): Ingredients and preparation description.
        
    Returns:
        Dict[str, float]: Dict with estimated: 'calories' (kcal), 'protein' (g), 
                          'carbs' (g), 'fat' (g), 'fiber' (g).
    """
    text = (item_name + " " + description).lower()
    
    # Base macros initialized to minimum values
    calories = 0.0
    protein = 0.0
    carbs = 0.0
    fat = 0.0
    fiber = 0.0
    
    # 1. Base Ingredient Detection & Macro Accumulation
    
    # Protein Bases
    if any(k in text for k in ["chicken breast", "chicken tikka", "tandoori chicken"]):
        protein += 28.0
        fat += 6.0
        calories += 180.0
    elif "chicken" in text:
        protein += 22.0
        fat += 10.0
        calories += 200.0
        
    if "salmon" in text or "fish" in text:
        protein += 25.0
        fat += 12.0  # Healthy omega-3 fats
        calories += 220.0
        
    if "paneer bhurji" in text:
        protein += 18.0
        fat += 22.0
        carbs += 5.0
        calories += 290.0
    elif "paneer" in text:
        protein += 14.0
        fat += 18.0
        carbs += 4.0
        calories += 240.0
        
    if "tofu" in text:
        protein += 15.0
        fat += 8.0
        carbs += 3.0
        calories += 140.0
        
    if "egg white" in text:
        protein += 18.0
        fat += 0.5
        carbs += 1.0
        calories += 80.0
    elif "egg" in text or "eggs" in text:
        protein += 13.0
        fat += 11.0
        carbs += 1.5
        calories += 160.0
        
    if any(k in text for k in ["chickpea", "kabuli chana", "lentil", "moong dal", "sambhar", "dosa batter"]):
        protein += 8.0
        carbs += 28.0
        fiber += 6.0
        fat += 2.0
        calories += 160.0

    # Carb Bases
    if any(k in text for k in ["brown rice", "red rice", "quinoa"]):
        carbs += 32.0
        protein += 4.0
        fiber += 3.5
        fat += 1.5
        calories += 160.0
    elif "white rice" in text or "basmati rice" in text:
        carbs += 38.0
        protein += 3.0
        fiber += 1.0
        fat += 0.5
        calories += 170.0
        
    if "millet" in text or "ragi" in text:
        carbs += 35.0
        protein += 5.0
        fiber += 7.0  # Ragi/millet are high in fiber
        fat += 1.5
        calories += 175.0
        
    if "almond flour" in text:
        fat += 14.0
        protein += 6.0
        carbs += 4.0
        fiber += 3.0
        calories += 170.0
    elif "whole wheat" in text or "tortilla" in text or "chapati" in text:
        carbs += 25.0
        protein += 4.0
        fiber += 3.5
        fat += 1.0
        calories += 120.0
    elif any(k in text for k in ["white flour", "bun", "pizza crust", "refined"]):
        carbs += 55.0
        protein += 7.0
        fiber += 1.5
        fat += 4.0
        calories += 280.0

    # Fats, Oils & Dairy
    if "avocado" in text:
        fat += 15.0
        carbs += 6.0
        fiber += 5.0
        calories += 160.0
        
    if "cheese" in text or "feta" in text or "cheddar" in text or "mozzarella" in text:
        fat += 14.0
        protein += 8.0
        carbs += 2.0
        calories += 160.0
        
    if "heavy cream" in text or "whipping cream" in text or "butter chicken" in text:
        fat += 18.0
        carbs += 3.0
        calories += 180.0
        
    if "ghee" in text or "butter" in text:
        fat += 8.0
        calories += 70.0
        
    if "olive oil" in text or "olives" in text or "seeds" in text or "pumpkin seeds" in text:
        fat += 6.0
        fiber += 1.0
        calories += 55.0

    # Vegetables & Salads (low calorie, high fiber)
    if any(k in text for k in ["broccoli", "spinach", "kale", "lettuce", "romaine", "cucumber", "tomato", "salad greens", "celery", "bok choy", "veg", "vegetable"]):
        carbs += 6.0
        fiber += 3.0
        protein += 2.0
        calories += 35.0

    # Shakes & Sweeteners (heavy carbs/sugars)
    if any(k in text for k in ["shake", "chocolate", "sugary", "sweet", "fudge", "syrup"]):
        carbs += 50.0  # pure sugar
        fat += 12.0
        protein += 4.0
        calories += 320.0

    # 2. Cooking Method Adjustments (Fried vs. Baked/Grilled)
    if any(k in text for k in ["deep fried", "fried", "crispy", "breaded", "fritter"]):
        fat += 15.0
        carbs += 10.0
        calories += 180.0
    elif any(k in text for k in ["grilled", "steamed", "baked", "roasted", "boiled", "pan-seared"]):
        # Leaner cooking method adjustment
        fat = max(1.0, fat - 2.0)
        calories = max(40.0, calories - 25.0)

    # 3. Baseline Defaults if nothing was matched (e.g. customized text)
    if calories == 0.0:
        # Smart default based on name keyword matching
        if "salad" in text:
            calories, protein, carbs, fat, fiber = 180.0, 5.0, 10.0, 14.0, 4.0
        elif "soup" in text:
            calories, protein, carbs, fat, fiber = 120.0, 4.0, 15.0, 3.0, 3.0
        elif "wrap" in text:
            calories, protein, carbs, fat, fiber = 350.0, 15.0, 40.0, 12.0, 4.0
        elif "dosa" in text or "khichdi" in text:
            calories, protein, carbs, fat, fiber = 280.0, 6.0, 45.0, 8.0, 5.0
        else:
            # General balanced meal default
            calories, protein, carbs, fat, fiber = 300.0, 12.0, 35.0, 10.0, 3.0
            
    # Round estimates for realistic precision
    return {
        "calories": round(calories, 0),
        "protein": round(protein, 1),
        "carbohydrates": round(carbs, 1),
        "fats": round(fat, 1),
        "fiber": round(fiber, 1)
    }

# Quick test if run directly
if __name__ == "__main__":
    test_cases = [
        ("Grilled Chicken Protein Bowl", "Succulent grilled chicken breast served with organic brown rice, steamed broccoli, and roasted bell peppers."),
        ("Triple Cheese Crispy Crust Pizza", "A deep-fried crispy crust topped with rich heavy cream sauce and cheese."),
        ("Spiced Foxtail Millet Khichdi", "A comforting, high-fiber, and diabetic-friendly khichdi made with whole foxtail millet and moong dal.")
    ]
    for name, desc in test_cases:
        macros = estimate_macros(name, desc)
        print(f"\nDish: {name}\nMacros: {macros}")
