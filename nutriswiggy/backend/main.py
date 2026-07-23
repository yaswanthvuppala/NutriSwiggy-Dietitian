import logging
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.mcp.swiggy_mcp_client import SwiggyMCPClient
from backend.services.database import (
    consume_swiggy_oauth_state,
    delete_swiggy_session,
    get_swiggy_session,
    log_food_order,
    save_swiggy_oauth_state,
    save_swiggy_session,
    supabase_client,
)
from backend.services.recommendation_service import RecommendationService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nutriswiggy.main")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = list(set([
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]))

app = FastAPI(
    title="NutriSwiggy API",
    description="Backend API for the Swiggy Builders Club Hackathon AI Dietitian Assistant.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chat remains available in demo mode. Swiggy checkout clients are created per user below.
recommendation_service = RecommendationService()


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


class CartItem(BaseModel):
    itemId: str
    quantity: int = Field(gt=0)
    name: Optional[str] = None
    calories: float = 0
    protein: float = 0
    carbohydrates: float = 0
    fats: float = 0
    fiber: float = 0


class CartSyncRequest(BaseModel):
    restaurantId: str
    restaurant: str
    restaurant_id: Optional[str] = None
    items: List[CartItem] = Field(min_length=1)
    totalCalories: float = 0
    totalProtein: float = 0
    totalCarbohydrates: float = 0
    totalFats: float = 0
    totalFiber: float = 0


def require_user_id(request: Request) -> str:
    """Verifies the Supabase access token and returns its immutable user ID."""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase is not configured.")
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sign in to NutriSwiggy first.")
    try:
        user = supabase_client.auth.get_user(authorization.removeprefix("Bearer ").strip()).user
        if not user:
            raise ValueError("No authenticated user")
        return str(user.id)
    except Exception:
        raise HTTPException(status_code=401, detail="Your NutriSwiggy session is invalid or expired.")


def user_swiggy_client(user_id: str) -> SwiggyMCPClient:
    session = get_swiggy_session(user_id)
    if not session:
        raise HTTPException(status_code=409, detail="Connect a Swiggy account before checkout.")
    try:
        if datetime.fromisoformat(session["expires_at"]) <= datetime.now(timezone.utc):
            delete_swiggy_session(user_id)
            raise HTTPException(status_code=409, detail="Your Swiggy session expired. Connect it again.")
    except ValueError:
        delete_swiggy_session(user_id)
        raise HTTPException(status_code=409, detail="Your Swiggy session is invalid. Connect it again.")

    client = SwiggyMCPClient()
    client.set_access_token(session["access_token"])
    return client


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NutriSwiggy Dietitian Engine",
        "description": "FastAPI + Gemini AI Hackathon MVP",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "database_connected": bool(supabase_client)}


@app.post("/api/chat", response_model=ChatResponse)
async def chat_dietitian(request: Request, body: ChatRequest):
    client = None
    try:
        authorization = request.headers.get("Authorization", "")
        if authorization.startswith("Bearer "):
            user_id = require_user_id(request)
            client = user_swiggy_client(user_id)
    except Exception as e:
        logger.debug("Chat caller is unauthenticated or has no active Swiggy session: %s", e)

    try:
        return await recommendation_service.get_recommendations(body.message, body.model, mcp_client=client)
    except Exception as e:
        logger.error("Chat endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail="The dietitian service could not process that request.")


@app.get("/auth/login")
async def auth_login(request: Request):
    """Starts a Swiggy PKCE flow bound to the signed-in NutriSwiggy user."""
    user_id = require_user_id(request)
    client = SwiggyMCPClient()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    try:
        await client.oauth_handler.register_client()
        authorize_url = client.oauth_handler.build_authorize_url()
        saved = save_swiggy_oauth_state(
            user_id,
            client.oauth_handler.state,
            client.oauth_handler.code_verifier,
            client.oauth_handler.client_id,
            expires_at,
        )
        if not saved:
            raise HTTPException(status_code=503, detail="Could not start the Swiggy connection.")
        return {"authorize_url": authorize_url, "mode": "Live MCP"}
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("Swiggy registration failed; using demo connection: %s", e)
        state = uuid.uuid4().hex
        if not save_swiggy_oauth_state(user_id, state, "", "", expires_at):
            raise HTTPException(status_code=503, detail="Could not start the Swiggy demo connection.")
        return {
            "authorize_url": f"http://localhost:8000/callback?code=mock_auth_code_987&state={state}",
            "mode": "Mock OAuth",
        }


@app.get("/callback")
async def auth_callback(code: str, state: str):
    """Completes one saved PKCE flow and persists it only for its owner."""
    transaction = consume_swiggy_oauth_state(state)
    if not transaction:
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_failed")
    try:
        if datetime.fromisoformat(transaction["expires_at"]) <= datetime.now(timezone.utc):
            return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_expired")

        if code == "mock_auth_code_987":
            token_data = {"access_token": "mock_access_token_xyz", "expires_in": 86400}
        else:
            client = SwiggyMCPClient()
            client.oauth_handler.client_id = transaction["client_id"]
            client.oauth_handler.code_verifier = transaction["code_verifier"]
            token_data = await client.oauth_handler.exchange_code(code)

        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=int(token_data.get("expires_in", 3600)))).isoformat()
        if not save_swiggy_session(
            transaction["user_id"],
            token_data["access_token"],
            token_data.get("refresh_token"),
            expires_at,
        ):
            raise RuntimeError("Could not save the Swiggy connection")
        return RedirectResponse(url=f"{FRONTEND_URL}/?connected=true")
    except Exception as e:
        logger.error("Swiggy callback failed: %s", e)
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_failed")


@app.get("/auth/status")
def auth_status(request: Request):
    user_id = require_user_id(request)
    session = get_swiggy_session(user_id)
    connected = bool(session)
    return {"connected": connected, "mode": "Live MCP" if connected else "Not connected"}


@app.post("/auth/logout")
def auth_logout(request: Request):
    user_id = require_user_id(request)
    if not delete_swiggy_session(user_id):
        raise HTTPException(status_code=503, detail="Could not disconnect the Swiggy account.")
    return {"status": "success", "message": "Swiggy account disconnected."}


@app.post("/api/cart/sync")
async def sync_cart(payload: CartSyncRequest, request: Request):
    """Syncs the authenticated user's Swiggy cart and records the redirect event."""
    user_id = require_user_id(request)
    client = user_swiggy_client(user_id)
    try:
        await client.flush_food_cart()
        addresses = await client.get_addresses()
        if isinstance(addresses, dict):
            addresses = addresses.get("addresses", []) or addresses.get("data", [])
        address_id = addresses[0]["id"] if addresses else None
        if not address_id:
            raise ValueError("No saved addresses found on the connected Swiggy account.")

        mcp_items = [{"menu_item_id": item.itemId, "quantity": item.quantity} for item in payload.items]
        await client.update_food_cart(payload.restaurantId, mcp_items, address_id)

        order_id = f"ord_{uuid.uuid4().hex[:24]}"
        saved = log_food_order({
            "id": order_id,
            "user_id": user_id,
            "restaurant": payload.restaurant,
            "restaurant_id": payload.restaurant_id or payload.restaurantId,
            "totalCalories": payload.totalCalories,
            "totalProtein": payload.totalProtein,
            "totalCarbohydrates": payload.totalCarbohydrates,
            "totalFats": payload.totalFats,
            "totalFiber": payload.totalFiber,
            "items": [item.model_dump() for item in payload.items],
            "status": "redirected_to_swiggy",
        })
        if not saved:
            raise RuntimeError("Cart synced, but the NutriSwiggy order could not be recorded.")

        is_mock = client.access_token == "mock_access_token_xyz"
        return {
            "status": "success",
            "order_id": order_id,
            "order_status": "redirected_to_swiggy",
            "redirect_url": "https://www.swiggy.com" if is_mock else "https://www.swiggy.com/checkout",
            "mode": "Mock Demo" if is_mock else "Live MCP",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Cart sync failed for %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
