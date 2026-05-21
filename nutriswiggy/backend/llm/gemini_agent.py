import os
import logging
from typing import List, Dict, Any, Tuple
import google.generativeai as genai
from google.generativeai.types import GenerateContentResponse

# Import local tools
from backend.tools.search_menu import search_menu
from backend.tools.nutrition_tools import estimate_macros
from backend.tools.ranking_tools import rank_meals

logger = logging.getLogger(__name__)

# Configure local logging
logging.basicConfig(level=logging.INFO)

class GeminiDietAgent:
    """
    An agent that integrates Gemini 2.5 Pro / Flash with tool calling for menu search, 
    macro estimation, and health scoring of dishes.
    """
    def __init__(self):
        # Read API key from environment
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.use_fallback = False
        self.model_name = "gemini-3.1-flash-lite"  # Default fallback (high RPM)
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY environment variable not found. Using high-quality local fallback dietitian.")
            self.use_fallback = True
        else:
            genai.configure(api_key=self.api_key)
            self._determine_best_model()
            
        # Read system prompt
        self.system_prompt = self._load_system_prompt()

    def _determine_best_model(self):
        try:
            # Dynamically query list of available models to avoid 404s
            logger.info("Querying available Gemini models...")
            models = list(genai.list_models())
            available_names = [m.name.replace("models/", "") for m in models]
            logger.info(f"Available models: {available_names}")
            
            # Prioritized list of compatible text models, prioritizing high-RPM Lite models
            preferred_models = [
                "gemini-3.1-flash-lite",
                "gemini-3.1-flash-lite-latest",
                "gemini-2.5-flash",
                "gemini-2.5-flash-latest",
                "gemini-2.0-flash",
                "gemini-2.0-flash-latest",
                "gemini-1.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-pro"
            ]
            
            for model_id in preferred_models:
                if model_id in available_names:
                    self.model_name = model_id
                    logger.info(f"Selected Gemini model: {self.model_name}")
                    return
            
            # If none of the preferred models are listed, find any gemini model
            for name in available_names:
                if "gemini" in name:
                    self.model_name = name
                    logger.info(f"Dynamic fallback selected Gemini model: {self.model_name}")
                    return
                    
            logger.warning(f"No gemini models found in list. Defaulting to: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to dynamically query models: {e}. Falling back to default: {self.model_name}")
        
    def _load_system_prompt(self) -> str:
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_path = os.path.join(current_dir, "..", "prompts", "system_prompt.txt")
            if os.path.exists(prompt_path):
                with open(prompt_path, "r", encoding="utf-8") as f:
                    return f.read()
            logger.warning("system_prompt.txt not found. Using default system prompt.")
            return "You are an expert AI Dietitian called NutriSwiggy."
        except Exception as e:
            logger.error(f"Error loading system prompt: {e}")
            return "You are an expert AI Dietitian called NutriSwiggy."

    def run_dietitian_flow(self, user_prompt: str, model_override: str = None) -> Tuple[str, List[Dict]]:
        """
        Runs the full dietitian pipeline:
        1. Run the deterministic search, macro estimation, and ranking pipeline.
        2. Generate conversational AI text about the EXACT same meals.
        
        This ensures the chat text and the Discovery Board cards always match.
        
        Args:
            user_prompt (str): The user's query/goal (e.g. 'Keto lunch under 500 kcal')
            model_override (str, optional): Overrides the model used by Gemini.
            
        Returns:
            Tuple[str, List[Dict]]: (conversational_ai_response, list_of_ranked_meals)
        """
        # Step 1: Always run the deterministic pipeline first to produce the authoritative meal list
        structured_meals = self._extract_meals_for_frontend(user_prompt)
        
        # Step 2: Generate conversational text about those exact meals
        if self.use_fallback:
            return self._generate_dietitian_text(user_prompt, structured_meals), structured_meals
            
        try:
            # Use Gemini to generate rich conversational text about the SAME meals
            active_model = model_override if model_override else self.model_name
            logger.info(f"Initializing GenerativeModel with '{active_model}' for text generation")
            model = genai.GenerativeModel(
                model_name=active_model,
                system_instruction=self.system_prompt
            )
            
            # Build a prompt that includes the exact meals so Gemini writes about them
            meals_context = self._format_meals_for_prompt(structured_meals)
            enriched_prompt = (
                f'The user asked: "{user_prompt}"\n\n'
                f'I have already searched our Swiggy restaurant database, estimated macros, '
                f'and ranked the results using our health scoring formula. '
                f'Here are the top matched meals:\n\n{meals_context}\n\n'
                f'Please write a professional, friendly AI dietitian recommendation summary '
                f'for the user based on EXACTLY these meals. For each meal, mention its name, '
                f'restaurant, key macros, health score, and why it matches their goal. '
                f'Use markdown formatting with ## and ### headings, bullet points, and **bold** text. '
                f'End with encouraging pro-tips. Do NOT invent or mention any meals that are not in the list above.'
            )
            
            response = model.generate_content(enriched_prompt)
            conversational_text = response.text
            
            return conversational_text, structured_meals
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}. Falling back to local text generation.")
            return self._generate_dietitian_text(user_prompt, structured_meals, error_msg=str(e)), structured_meals

    def _extract_meals_for_frontend(self, user_prompt: str) -> List[Dict]:
        """
        Runs the local deterministic search & ranking pipeline to guarantee 
        that the frontend receives a perfect list of JSON meals.
        This is the SINGLE SOURCE OF TRUTH for meal data — both the chat text 
        and the Discovery Board cards are derived from this output.
        """
        prompt_lower = user_prompt.lower()
        
        # 1. Determine Veg-Only status
        veg_keywords = ["vegetarian", "veg", "jain", "plant-based", "no meat", "vegan"]
        veg_only = any(kw in prompt_lower for kw in veg_keywords)
        
        # 2. Extract keywords for menu search
        search_terms = []
        if "keto" in prompt_lower:
            search_terms.extend(["keto", "low carb", "avocado", "almond"])
        if "protein" in prompt_lower or "muscle" in prompt_lower or "gain" in prompt_lower:
            search_terms.extend(["protein", "chicken", "paneer", "tofu", "egg"])
        if "loss" in prompt_lower or "deficit" in prompt_lower or "calorie" in prompt_lower:
            search_terms.extend(["salad", "soup", "bowl", "light", "low calorie"])
        if "fiber" in prompt_lower or "diabetic" in prompt_lower or "digestion" in prompt_lower:
            search_terms.extend(["millet", "khichdi", "fiber", "quinoa", "ragi"])
        if "lunch" in prompt_lower or "dinner" in prompt_lower or "breakfast" in prompt_lower:
            search_terms.extend(["bowl", "wrap", "salad", "dosa"])
            
        # Fallback to general terms if nothing matched
        if not search_terms:
            search_terms = [word for word in prompt_lower.split() if len(word) > 3]
            
        search_query = " ".join(search_terms)
        logger.info(f"Local query translation: '{user_prompt}' -> search query: '{search_query}' (veg={veg_only})")
        
        # 3. Search
        matched_items = search_menu(search_query, veg_only)
        
        # If no results, do a broad fallback search to return at least something
        if not matched_items:
            matched_items = search_menu("", veg_only)[:6]
            
        # 4. Estimate Macros
        for item in matched_items:
            item["macros"] = estimate_macros(item["item"], item["description"])
            
        # 5. Score & Rank
        ranked = rank_meals(matched_items, user_prompt)
        
        # Limit to top 4 recommendations for clean UI layout
        return ranked[:4]

    def _format_meals_for_prompt(self, meals: List[Dict]) -> str:
        """
        Formats the structured meal list into a readable text block
        that can be included in the Gemini prompt for accurate text generation.
        """
        if not meals:
            return "No meals matched the search criteria."
            
        lines = []
        for idx, meal in enumerate(meals, 1):
            macros = meal.get("macros", {})
            lines.append(
                f"{idx}. **{meal.get('item', 'Unknown')}** from *{meal.get('restaurant', 'Unknown')}* (₹{meal.get('price', 0)})\n"
                f"   - Veg: {'Yes' if meal.get('veg', False) else 'No'}\n"
                f"   - Description: {meal.get('description', '')}\n"
                f"   - Macros: {macros.get('calories', 0)} kcal | Protein: {macros.get('protein', 0)}g | "
                f"Carbs: {macros.get('carbohydrates', 0)}g | Fat: {macros.get('fats', 0)}g | Fiber: {macros.get('fiber', 0)}g\n"
                f"   - Health Score: {meal.get('health_score', 0)}/99\n"
                f"   - Badges: {', '.join(meal.get('badges', []))}\n"
                f"   - Bonuses: {', '.join(meal.get('bonuses_applied', []))}\n"
                f"   - Penalties: {', '.join(meal.get('penalties_applied', [])) or 'None'}\n"
                f"   - Rationale: {meal.get('match_rationale', '')}"
            )
        return "\n\n".join(lines)

    def _generate_dietitian_text(self, user_prompt: str, ranked_meals: List[Dict], error_msg: str = "") -> str:
        """
        Generates a professional natural-language dietitian response locally,
        based on the exact same meals that will be shown on the Discovery Board.
        """
        is_veg = "vegetarian" in user_prompt.lower() or "veg" in user_prompt.lower()
        
        text_response = f"## 🥗 Welcome to NutriSwiggy - Your AI Dietitian\n\n"
        text_response += f"I've analyzed your goal: **\"{user_prompt}\"**.\n"
        
        if is_veg:
            text_response += "Since you requested a **vegetarian / plant-based** meal, I have filtered out all meat and fish options, focusing strictly on rich vegetarian sources of protein and fiber like paneer, tofu, and millets.\n\n"
        else:
            text_response += "I've scanned our health menu, prioritizing lean chicken, eggs, whole grains, and healthy green fats while penalizing deep-fried items and refined sugar.\n\n"
            
        text_response += "### 🏆 My Top Recommendations for You:\n\n"
        
        for idx, meal in enumerate(ranked_meals[:4]):
            macros = meal.get("macros", {})
            text_response += f"{idx+1}. **{meal['item']}** from *{meal['restaurant']}* (₹{meal['price']})\n"
            text_response += f"   - **Macros**: {macros.get('calories', 0)} kcal | **P**: {macros.get('protein', 0)}g | **C**: {macros.get('carbohydrates', 0)}g | **F**: {macros.get('fats', 0)}g | **Fiber**: {macros.get('fiber', 0)}g\n"
            text_response += f"   - **Dietitian's Take**: {meal.get('match_rationale', 'Balanced meal.')} (Health Score: **{meal.get('health_score', 0)}/99**)\n\n"
            
        text_response += "### 💡 Expert Dietitian Pro-Tips:\n"
        text_response += "- **Hydration is Key**: Pair your meal with our sugar-free *Fresh Lemon Water* to aid digestion and metabolic rate.\n"
        text_response += "- **Fiber and Satiety**: The high-fiber options will help regulate your blood sugar and prevent mid-day cravings.\n"
        text_response += "- **Consistency**: For the best results, try to eat meals with a Health Score of **75+** at least 80% of the time!\n\n"
        
        if error_msg:
            text_response += f"*[Note: A live Gemini API call was attempted with your key, but fell back to our local engine due to an error: '{error_msg}'. Please check your key validity or network status.]*"
        else:
            text_response += "*[Note: This response was generated using NutriSwiggy's high-fidelity local recommendation engine. Set `GEMINI_API_KEY` to enable live Gemini AI reasoning.]*"
        
        return text_response

# Quick test if run directly
if __name__ == "__main__":
    agent = GeminiDietAgent()
    text, meals = agent.run_dietitian_flow("High protein veg lunch under 400 calories")
    print("\n--- Conversational Response ---")
    print(text)
    print("\n--- Extracted Meals count ---")
    print(f"Total: {len(meals)} meals returned.")
