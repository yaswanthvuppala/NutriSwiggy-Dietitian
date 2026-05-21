import logging
import sys
import os

# Load environment variables from .env file if present (for GEMINI_API_KEY)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv is optional; env vars can be set manually

# Ensure the root package directory is in sys.path to allow 'backend' namespace imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Import local service
from backend.services.recommendation_service import RecommendationService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nutriswiggy.main")

app = FastAPI(
    title="NutriSwiggy API",
    description="Backend API for the Swiggy Builders Club Hackathon AI Dietitian Assistant.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe wildcard for hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize single service instance
recommendation_service = RecommendationService()

# Request and Response Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., example="High protein vegetarian dinner under 500 kcal")
    model: Optional[str] = Field(None, example="gemini-3.1-flash-lite")

class MacroModel(BaseModel):
    calories: float
    protein: float
    carbohydrates: float
    fats: float
    fiber: float

class MealModel(BaseModel):
    id: str
    restaurant: str
    item: str
    price: float
    veg: bool
    description: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    macros: MacroModel
    raw_score: float
    health_score: int
    badges: List[str]
    penalties_applied: List[str]
    bonuses_applied: List[str]
    match_rationale: str

class ChatResponse(BaseModel):
    answer: str
    meals: List[MealModel]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NutriSwiggy Dietitian Engine",
        "description": "FastAPI + Gemini AI Hackathon MVP"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database_connected": True
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_dietitian(request: ChatRequest):
    """
    Receives user prompts, processes it through the dietitian pipeline,
    and returns a natural AI dietitian text + structured healthy food cards.
    """
    logger.info(f"Received chat request: '{request.message}', model: '{request.model}'")
    try:
        result = recommendation_service.get_recommendations(request.message, request.model)
        return result
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred on the dietitian server: {str(e)}"
        )

# Command to run backend locally
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting NutriSwiggy Backend Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
