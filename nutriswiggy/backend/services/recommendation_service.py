import logging
from typing import Dict, Any
from backend.llm.gemini_agent import GeminiDietAgent

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Service layer that acts as the controller-facing entrypoint for NutriSwiggy.
    Interacts with the GeminiDietAgent to process requests.
    """
    def __init__(self):
        logger.info("Initializing RecommendationService...")
        self.agent = GeminiDietAgent()
        
    def get_recommendations(self, prompt: str) -> Dict[str, Any]:
        """
        Receives user prompt, executes the dietitian flow, and returns
        the formatted result payload for the API.
        
        Args:
            prompt (str): The user's query or goals.
            
        Returns:
            Dict[str, Any]: A dictionary containing 'answer' and 'meals'.
        """
        logger.info(f"Processing recommendation request for prompt: '{prompt}'")
        
        # Strip and validate input
        cleaned_prompt = prompt.strip() if prompt else ""
        if not cleaned_prompt:
            return {
                "answer": "Hello! I am your NutriSwiggy AI Dietitian. Please tell me your fitness goal or dietary preference, and I will recommend some healthy dishes!",
                "meals": []
            }
            
        try:
            # Execute agent flow
            conversational_text, meals = self.agent.run_dietitian_flow(cleaned_prompt)
            
            logger.info(f"Successfully processed recommendations. Found {len(meals)} meals.")
            
            return {
                "answer": conversational_text,
                "meals": meals
            }
            
        except Exception as e:
            logger.error(f"Error in RecommendationService: {e}")
            return {
                "answer": "I'm sorry, I encountered a temporary glitch while designing your diet recommendations. Please try again in a moment!",
                "meals": []
            }
