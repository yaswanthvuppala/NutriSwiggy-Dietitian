import logging
from typing import Dict, Any
from backend.llm.gemini_agent import GeminiDietAgent
from backend.mcp.swiggy_mcp_client import SwiggyMCPClient
from backend.tools.search_menu import normalize_swiggy_menu_item
from backend.tools.nutrition_tools import estimate_macros
from backend.tools.ranking_tools import rank_meals

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Service layer that acts as the controller-facing entrypoint for NutriSwiggy.
    Interacts with the GeminiDietAgent and SwiggyMCPClient to process requests in dual-mode.
    """
    def __init__(self):
        logger.info("Initializing RecommendationService...")
        self.agent = GeminiDietAgent()
        self.mcp_client = SwiggyMCPClient()
        self.use_live_mcp = False  # Toggle this when user connects via OAuth
        
    async def get_recommendations(self, prompt: str, model_override: str = None) -> Dict[str, Any]:
        """
        Receives user prompt, executes the dietitian flow (Mock or Live MCP), 
        and returns the formatted result payload for the API.
        """
        logger.info(f"Processing recommendation request for prompt: '{prompt}', model_override: '{model_override}'")
        
        # Strip and validate input
        cleaned_prompt = prompt.strip() if prompt else ""
        if not cleaned_prompt:
            return {
                "answer": "Hello! I am your NutriSwiggy AI Dietitian. Please tell me your fitness goal or dietary preference, and I will recommend some healthy dishes!",
                "meals": []
            }
            
        try:
            if self.use_live_mcp and self.mcp_client.access_token:
                return await self._live_mcp_flow(cleaned_prompt, model_override)
            else:
                return self._mock_flow(cleaned_prompt, model_override)
                
        except Exception as e:
            logger.error(f"Error in RecommendationService: {e}")
            return {
                "answer": "I'm sorry, I encountered a temporary glitch while designing your diet recommendations. Please try again in a moment!",
                "meals": []
            }
            
    def _mock_flow(self, prompt: str, model_override: str = None) -> Dict[str, Any]:
        logger.info("Executing MOCK recommendation flow...")
        conversational_text, meals = self.agent.run_dietitian_flow(prompt, model_override)
        return {"answer": conversational_text, "meals": meals}
        
    async def _live_mcp_flow(self, prompt: str, model_override: str = None) -> Dict[str, Any]:
        logger.info("Executing LIVE MCP recommendation flow...")
        try:
            # 1. Get user addresses (just picking the first one for the hackathon demo)
            addresses = await self.mcp_client.get_addresses()
            address_id = addresses[0]["id"] if addresses else "default_address_id"
            
            # 2. Extract basic search term to avoid swiggy search returning nothing if prompt is too complex
            search_terms = []
            prompt_lower = prompt.lower()
            if "keto" in prompt_lower: search_terms.append("keto")
            if "protein" in prompt_lower: search_terms.append("chicken")
            if "salad" in prompt_lower: search_terms.append("salad")
            if "paneer" in prompt_lower: search_terms.append("paneer")
            query = " ".join(search_terms) if search_terms else prompt
            
            # 3. Search real Swiggy menu
            raw_items = await self.mcp_client.search_menu(query, address_id)
            if not raw_items:
                # Fallback to broader search if nothing found
                raw_items = await self.mcp_client.search_menu("", address_id)
                
            # 4. Normalize
            normalized_items = [normalize_swiggy_menu_item(item) for item in raw_items]
            
            # 5. Filter for veg if requested
            veg_keywords = ["vegetarian", "veg", "jain", "plant-based", "no meat", "vegan"]
            veg_only = any(kw in prompt_lower for kw in veg_keywords)
            if veg_only:
                normalized_items = [item for item in normalized_items if item["veg"]]
                
            # 6. Estimate Macros & Rank (Our Secret Sauce!)
            for item in normalized_items:
                item["macros"] = estimate_macros(item["item"], item["description"])
                
            ranked = rank_meals(normalized_items, prompt)
            top_meals = ranked[:4]
            
            # 7. Generate AI conversational text
            conversational_text, meals = self.agent.run_dietitian_flow(
                prompt, 
                model_override, 
                precomputed_meals=top_meals
            )
            return {"answer": conversational_text, "meals": meals}
            
        except Exception as e:
            logger.error(f"Live MCP flow failed: {e}. Falling back to mock flow.")
            return self._mock_flow(prompt, model_override)
