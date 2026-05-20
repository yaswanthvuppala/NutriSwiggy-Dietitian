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
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY environment variable not found. Using high-quality local fallback dietitian.")
            self.use_fallback = True
        else:
            genai.configure(api_key=self.api_key)
            
        # Read system prompt
        self.system_prompt = self._load_system_prompt()
        
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

    def run_dietitian_flow(self, user_prompt: str) -> Tuple[str, List[Dict]]:
        """
        Runs the full dietitian pipeline:
        1. Search Menu matching user goals.
        2. Estimate macros for all matched dishes.
        3. Rank meals using the health score.
        4. Generate the final natural language summary and structured response.
        
        Args:
            user_prompt (str): The user's query/goal (e.g. 'Keto lunch under 500 kcal')
            
        Returns:
            Tuple[str, List[Dict]]: (conversational_ai_response, list_of_ranked_meals)
        """
        # If API key is missing, execute the high-quality local fallback pipeline directly
        if self.use_fallback:
            return self._run_local_fallback_flow(user_prompt, is_error_fallback=False)
            
        try:
            # Define tool binding structure
            # We map functions for Gemini to see
            def tool_search_menu(query: str, veg_only: bool = False) -> List[Dict]:
                return search_menu(query, veg_only)

            def tool_estimate_macros(item_name: str, description: str) -> Dict[str, float]:
                return estimate_macros(item_name, description)

            def tool_rank_meals(meals: List[Dict], goal: str = "") -> List[Dict]:
                return rank_meals(meals, goal)
                
            # Initialize model with tool definitions
            # Using gemini-1.5-flash-latest to avoid 404 errors on some API key regions/versions
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash-latest",
                tools=[tool_search_menu, tool_estimate_macros, tool_rank_meals],
                system_instruction=self.system_prompt
            )
            
            # Start conversational session
            chat = model.start_chat(enable_automatic_function_calling=True)
            logger.info(f"Sending prompt to Gemini Agent: '{user_prompt}'")
            
            response = chat.send_message(user_prompt)
            
            # After automatic tool execution, let's extract what was searched and ranked
            # To ensure the frontend has a perfect structured list, we also execute a quick parallel
            # local search and rank pipeline so the JSON is fully populated with all details.
            conversational_text = response.text
            structured_meals = self._extract_meals_for_frontend(user_prompt)
            
            return conversational_text, structured_meals
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}. Falling back to local deterministic pipeline.")
            return self._run_local_fallback_flow(user_prompt, is_error_fallback=True, error_msg=str(e))

    def _extract_meals_for_frontend(self, user_prompt: str) -> List[Dict]:
        """
        Runs the local deterministic search & ranking pipeline to guarantee 
        that the frontend receives a perfect list of JSON meals even if the LLM 
        output doesn't cleanly serialize.
        """
        prompt_lower = user_prompt.lower()
        
        # 1. Determine Veg-Only status
        veg_keywords = ["vegetarian", "veg", "jain", "plant-based", "no meat", "vegan"]
        veg_only = any(kw in prompt_lower for kw in veg_keywords)
        
        # 2. Extract keywords for mock data search
        search_terms = []
        if "keto" in prompt_lower:
            search_terms.extend(["keto", "low carb", "avocado", "almond"])
        if "protein" in prompt_lower or "muscle" in prompt_lower or "gain" in prompt_lower:
            search_terms.extend(["protein", "chicken", "paneer", "tofu", "egg"])
        if "loss" in prompt_lower or "deficit" in prompt_lower or "calorie" in prompt_lower:
            search_terms.extend(["salad", "soup", "bowl", "light", "low calorie"])
        if "fiber" in prompt_lower or "diabetic" in prompt_lower or "digestion" in prompt_lower:
            search_terms.extend(["millet", "khichdi", "fiber", "quinoa", "ragi"])
            
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

    def _run_local_fallback_flow(self, user_prompt: str, is_error_fallback: bool = False, error_msg: str = "") -> Tuple[str, List[Dict]]:
        """
        High-quality fallback pipeline that executes search, macro estimation, and ranking locally.
        It generates a professional natural-language response locally, ensuring the hackathon
        app is extremely resilient.
        """
        logger.info(f"Executing local fallback dietitian pipeline (is_error={is_error_fallback}).")
        
        # Retrieve the ranked meals
        ranked_meals = self._extract_meals_for_frontend(user_prompt)
        
        # Create a professional, structured dietitian analysis text
        is_veg = "vegetarian" in user_prompt.lower() or "veg" in user_prompt.lower()
        
        text_response = f"## 🥗 Welcome to NutriSwiggy - Your AI Dietitian\n\n"
        text_response += f"I've analyzed your goal: **\"{user_prompt}\"**.\n"
        
        if is_veg:
            text_response += "Since you requested a **vegetarian / plant-based** meal, I have filtered out all meat and fish options, focusing strictly on rich vegetarian sources of protein and fiber like paneer, tofu, and millets.\n\n"
        else:
            text_response += "I've scanned our health menu, prioritizing lean chicken, eggs, whole grains, and healthy green fats while penalizing deep-fried items and refined sugar.\n\n"
            
        text_response += "### 🏆 My Top Recommendations for You:\n\n"
        
        for idx, meal in enumerate(ranked_meals[:3]):
            macros = meal["macros"]
            text_response += f"{idx+1}. **{meal['item']}** from *{meal['restaurant']}* (₹{meal['price']})\n"
            text_response += f"   - **Macros**: {macros['calories']} kcal | **P**: {macros['protein']}g | **C**: {macros['carbohydrates']}g | **F**: {macros['fats']}g | **Fiber**: {macros['fiber']}g\n"
            text_response += f"   - **Dietitian's Take**: {meal['match_rationale']} (Health Score: **{meal['health_score']}/99**)\n\n"
            
        text_response += "### 💡 Expert Dietitian Pro-Tips:\n"
        text_response += "- **Hydration is Key**: Pair your meal with our sugar-free *Fresh Lemon Water* to aid digestion and metabolic rate.\n"
        text_response += "- **Fiber and Satiety**: The high-fiber options will help regulate your blood sugar and prevent mid-day cravings.\n"
        text_response += "- **Consistency**: For the best results, try to eat meals with a Health Score of **75+** at least 80% of the time!\n\n"
        
        if is_error_fallback:
            text_response += f"*[Note: A live Gemini API call was attempted with your key, but fell back to our local engine due to an error: '{error_msg}'. Please check your key validity or network status.]*"
        else:
            text_response += "*[Note: This response was generated using NutriSwiggy's high-fidelity local recommendation engine. Set `GEMINI_API_KEY` to enable live Gemini AI reasoning.]*"
        
        return text_response, ranked_meals

# Quick test if run directly
if __name__ == "__main__":
    agent = GeminiDietAgent()
    text, meals = agent.run_dietitian_flow("High protein veg lunch under 400 calories")
    print("\n--- Conversational Response ---")
    print(text)
    print("\n--- Extracted Meals count ---")
    print(f"Total: {len(meals)} meals returned.")
