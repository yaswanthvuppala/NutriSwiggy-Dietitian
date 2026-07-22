"""
NutriSwiggy Database & Token Encryption Service (Supabase Integration)
Handles user profile targets, encrypted OAuth tokens, and food order history.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from dotenv import load_dotenv

# Explicitly load .env from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Optional Encryption setup for OAuth Tokens
ENCRYPTION_KEY = os.getenv("TOKEN_ENCRYPTION_KEY")
cipher = None

if ENCRYPTION_KEY:
    try:
        from cryptography.fernet import Fernet
        cipher = Fernet(ENCRYPTION_KEY.encode())
    except Exception as e:
        print(f"[WARN] Failed to initialize Fernet token encryption: {e}")

# Supabase Client Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[INFO] Supabase database client initialized successfully.")
    except Exception as e:
        print(f"[WARN] Could not initialize Supabase client: {e}")
else:
    print("[INFO] SUPABASE_URL or SUPABASE_KEY not set. Running in local fallback mode.")


def encrypt_token(plain_token: str) -> str:
    """Encrypts raw OAuth token before saving to database."""
    if cipher and plain_token:
        try:
            return cipher.encrypt(plain_token.encode()).decode()
        except Exception as e:
            print(f"[WARN] Token encryption error: {e}")
    return plain_token


def decrypt_token(encrypted_token: str) -> str:
    """Decrypts OAuth token retrieved from database."""
    if cipher and encrypted_token:
        try:
            return cipher.decrypt(encrypted_token.encode()).decode()
        except Exception as e:
            print(f"[WARN] Token decryption error: {e}")
    return encrypted_token


# --- USER PROFILES ---

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetches user nutrition target goals."""
    if not supabase_client:
        return None
    try:
        res = supabase_client.table("user_profiles").select("*").eq("user_id", user_id).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[ERROR] Failed to fetch user profile: {e}")
        return None


def upsert_user_profile(user_id: str, targets: Dict[str, int]) -> bool:
    """Creates or updates user nutrition targets."""
    if not supabase_client:
        return False
    try:
        payload = {
            "user_id": user_id,
            "target_calories": targets.get("calories", 2000),
            "target_protein": targets.get("protein", 120),
            "target_carbohydrates": targets.get("carbohydrates", 200),
            "target_fats": targets.get("fats", 70),
            "target_fiber": targets.get("fiber", 30),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        supabase_client.table("user_profiles").upsert(payload).execute()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to upsert user profile: {e}")
        return False


# --- SWIGGY OAUTH SESSIONS ---

def save_swiggy_session(user_id: str, access_token: str, refresh_token: str, expires_at: str) -> bool:
    """Saves encrypted OAuth tokens to Supabase."""
    if not supabase_client:
        return False
    try:
        payload = {
            "user_id": user_id,
            "access_token": encrypt_token(access_token),
            "refresh_token": encrypt_token(refresh_token) if refresh_token else None,
            "expires_at": expires_at,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        supabase_client.table("swiggy_sessions").upsert(payload).execute()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save Swiggy session: {e}")
        return False


def get_swiggy_session(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves and decrypts user OAuth session."""
    if not supabase_client:
        return None
    try:
        res = supabase_client.table("swiggy_sessions").select("*").eq("user_id", user_id).execute()
        if not res.data:
            return None
        session = res.data[0]
        session["access_token"] = decrypt_token(session["access_token"])
        if session.get("refresh_token"):
            session["refresh_token"] = decrypt_token(session["refresh_token"])
        return session
    except Exception as e:
        print(f"[ERROR] Failed to fetch Swiggy session: {e}")
        return None


def delete_swiggy_session(user_id: str) -> bool:
    """Purges Swiggy OAuth session on logout."""
    if not supabase_client:
        return False
    try:
        supabase_client.table("swiggy_sessions").delete().eq("user_id", user_id).execute()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to delete Swiggy session: {e}")
        return False


# --- FOOD ORDERS & MACRO TRACKING ---

def log_food_order(order_data: Dict[str, Any]) -> bool:
    """Logs order macros into database."""
    if not supabase_client:
        return False
    try:
        payload = {
            "id": order_data["id"],
            "user_id": order_data.get("user_id"),
            "restaurant_name": order_data.get("restaurant", "Unknown Outlet"),
            "restaurant_id": order_data.get("restaurant_id"),
            "total_calories": order_data.get("totalCalories", 0),
            "total_protein": order_data.get("totalProtein", 0),
            "total_carbohydrates": order_data.get("totalCarbohydrates", 0),
            "total_fats": order_data.get("totalFats", 0),
            "total_fiber": order_data.get("totalFiber", 0),
            "items": order_data.get("items", []),
            "ordered_at": order_data.get("date", datetime.now(timezone.utc).isoformat())
        }
        supabase_client.table("food_orders").insert(payload).execute()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to log food order: {e}")
        return False


def get_user_orders(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves all historical order logs for a user."""
    if not supabase_client:
        return []
    try:
        res = supabase_client.table("food_orders").select("*").eq("user_id", user_id).order("ordered_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[ERROR] Failed to fetch user food orders: {e}")
        return []
