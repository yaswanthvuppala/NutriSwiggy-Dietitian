import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.main import auth_login, auth_status, chat_dietitian, ChatRequest

async def main():
    print("--- 1. Testing /auth/status ---")
    status = auth_status()
    print("Status:", status)

    # We skip /auth/login because it attempts a real network call to mcp-staging.swiggy.com
    # which might not be online or accessible without VPN/whitelisting yet.
    
    print("\n--- 2. Testing /api/chat (Mock Mode) ---")
    req = ChatRequest(message="High protein veg meal")
    res = await chat_dietitian(req)
    print("Meals returned:", len(res.meals))
    print("First meal:", res.meals[0].item if res.meals else "None")

if __name__ == "__main__":
    asyncio.run(main())
