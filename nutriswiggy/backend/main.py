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

from fastapi import FastAPI, HTTPException, Request
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
    restaurant_id: Optional[str] = None
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
        result = await recommendation_service.get_recommendations(request.message, request.model)
        return result
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred on the dietitian server: {str(e)}"
        )

# --- OAuth Endpoints ---
@app.get("/auth/login")
async def auth_login():
    """Starts the OAuth 2.1 PKCE flow. Falls back to Mock OAuth if staging server is offline."""
    try:
        logger.info("Attempting Swiggy Client registration...")
        # 1. Register client dynamically
        await recommendation_service.mcp_client.oauth_handler.register_client()
        # 2. Build URL and return it
        url = recommendation_service.mcp_client.oauth_handler.build_authorize_url()
        return {"authorize_url": url, "mode": "Live MCP"}
    except Exception as e:
        logger.warning(f"Swiggy staging registration failed: {e}. Falling back to Mock OAuth flow.")
        # Return a mock callback URL that will redirect to our backend's /callback with a mock code
        mock_callback_url = "http://localhost:8000/callback?code=mock_auth_code_987&state=mock_state"
        return {"authorize_url": mock_callback_url, "mode": "Mock OAuth"}

@app.get("/callback")
async def auth_callback(code: str, state: str = None):
    """Handles the OAuth redirect callback from Swiggy and redirects back to Next.js UI."""
    from fastapi.responses import RedirectResponse
    
    # Intercept mock authorization code
    if code == "mock_auth_code_987":
        logger.info("Mock Mode: Simulating successful OAuth login...")
        recommendation_service.mcp_client.set_access_token("mock_access_token_xyz")
        recommendation_service.use_live_mcp = True
        return RedirectResponse(url="http://localhost:3000/?connected=true")
        
    try:
        token_data = await recommendation_service.mcp_client.oauth_handler.exchange_code(code)
        recommendation_service.mcp_client.set_access_token(token_data.get("access_token"))
        recommendation_service.use_live_mcp = True
        return RedirectResponse(url="http://localhost:3000/?connected=true")
    except Exception as e:
        logger.error(f"Failed OAuth callback: {e}")
        return RedirectResponse(url="http://localhost:3000/?error=auth_failed")

@app.get("/auth/status")
def auth_status():
    """Returns the current connection mode."""
    is_connected = bool(recommendation_service.mcp_client.access_token)
    return {
        "connected": is_connected,
        "mode": "Live MCP" if is_connected else "Mock Demo"
    }

@app.post("/auth/logout")
async def auth_logout():
    """Flushes the access token and resets live MCP mode back to Mock Demo."""
    logger.info("Logging out: Revoking session and resetting MCP client...")
    try:
        recommendation_service.use_live_mcp = False
        recommendation_service.mcp_client.set_access_token(None)
        return {"status": "success", "message": "Successfully logged out and purged session."}
    except Exception as e:
        logger.error(f"Failed to logout: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Logout failed: {str(e)}"
        )

# --- Cart & Checkout Endpoints ---
class CartItem(BaseModel):
    itemId: str
    quantity: int

class CartSyncRequest(BaseModel):
    restaurantId: str
    items: List[CartItem]

@app.post("/api/cart/sync")
async def sync_cart(request: CartSyncRequest):
    """
    Synchronizes the frontend cart with the Swiggy MCP cart session.
    In Live MCP mode, it clears the current cart and adds the items.
    In Mock Demo mode, it performs a mock synchronization.
    """
    logger.info(f"Syncing cart for restaurant: {request.restaurantId} with {len(request.items)} items")
    
    if recommendation_service.use_live_mcp and recommendation_service.mcp_client.access_token:
        # Check if the restaurant ID is a mock ID (e.g. starts with 'res_')
        is_mock_id = request.restaurantId.startswith("res_") or not request.restaurantId.isdigit()
        
        if is_mock_id:
            logger.info("Cart Sync: Detected mock restaurant/item ID in Live MCP mode. Simulating cart sync.")
            return {
                "status": "success",
                "message": "Cart synchronized successfully (Simulated for Demo items)!",
                "redirect_url": "https://www.swiggy.com",
                "mode": "Mock Demo"
            }

        try:
            # 1. Flush the current cart to avoid restaurant mismatch errors
            logger.info("Live MCP Mode: Flushing Swiggy cart...")
            await recommendation_service.mcp_client.flush_food_cart()
            
            # 2. Get user's active addressId
            logger.info("Live MCP Mode: Fetching active address ID...")
            addresses_res = await recommendation_service.mcp_client.get_addresses()
            if isinstance(addresses_res, dict):
                addresses = addresses_res.get("addresses", []) or addresses_res.get("data", []) or []
            else:
                addresses = addresses_res or []
            
            address_id = addresses[0]["id"] if addresses else None
            if not address_id:
                raise ValueError("No saved addresses found on the Swiggy account. Please set a delivery address on Swiggy first.")

            # 3. Convert and push items to Swiggy cart
            mcp_items = [{"menu_item_id": item.itemId, "quantity": item.quantity} for item in request.items]
            logger.info(f"Live MCP Mode: Adding {len(mcp_items)} items to Swiggy cart for restaurant {request.restaurantId} at address {address_id}...")
            await recommendation_service.mcp_client.update_food_cart(request.restaurantId, mcp_items, address_id)
            
            return {
                "status": "success",
                "message": "Cart synced successfully with live Swiggy MCP!",
                "redirect_url": "https://www.swiggy.com/checkout",
                "mode": "Live MCP"
            }
        except Exception as e:
            logger.error(f"Failed to sync cart with Swiggy MCP: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync with Swiggy cart: {str(e)}"
            )
    else:
        logger.info("Mock Demo Mode: Simulating cart sync...")
        return {
            "status": "success",
            "message": "Cart synchronized successfully (Mock Demo Mode)!",
            "redirect_url": "https://www.swiggy.com",
            "mode": "Mock Demo"
        }

# Command to run backend locally
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting NutriSwiggy Backend Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
