import logging
import httpx
import uuid
import os
from typing import Dict, Any, List, Optional
from .oauth_handler import OAuthHandler

logger = logging.getLogger(__name__)

class SwiggyMCPClient:
    """MCP client for Swiggy Food server with OAuth 2.1 PKCE."""
    
    def __init__(self, base_url: str = None, redirect_uri: str = None):
        self.base_url = base_url or os.getenv("SWIGGY_MCP_BASE_URL") or "https://mcp.swiggy.com"
        self.redirect_uri = redirect_uri or os.getenv("SWIGGY_REDIRECT_URI") or "http://localhost:8000/callback"
        self.food_endpoint = f"{self.base_url}/food"
        self.oauth_handler = OAuthHandler(self.base_url, self.redirect_uri)
        
        self.access_token = self._load_session()
        
    def set_access_token(self, token: str):
        self.access_token = token
        self._save_session(token)
        
    async def call_tool(self, tool_name: str, arguments: dict = None) -> Any:
        """Executes a JSON-RPC tool call against the Swiggy MCP Food server."""
        if not self.access_token:
            raise ValueError("Access token is missing. Please authenticate first.")
            
        # Intercept and return simulated Swiggy MCP tool responses for local staging testing
        if self.access_token == "mock_access_token_xyz":
            logger.info(f"Simulating Swiggy MCP Tool Call: {tool_name}")
            import os
            import json
            
            if tool_name == "get_addresses":
                mock_addresses = [
                    {"id": "addr_home_123", "label": "Home", "address": "Flat 402, Sunshine Apts, Indiranagar, Bangalore"},
                    {"id": "addr_office_456", "label": "Office", "address": "Block C, Embassy Tech Village, Bellandur, Bangalore"}
                ]
                return {
                    "content": [{
                        "type": "text",
                        "text": json.dumps(mock_addresses)
                    }]
                }
                
            elif tool_name == "search_menu":
                # Read local mock menu and format as Swiggy menu item schemas
                current_dir = os.path.dirname(os.path.abspath(__file__))
                mock_file = os.path.join(current_dir, "..", "data", "mock_menu.json")
                mcp_items = []
                if os.path.exists(mock_file):
                    with open(mock_file, "r", encoding="utf-8") as f:
                        menu_data = json.load(f)
                        for item in menu_data:
                            mcp_items.append({
                                "item_id": item["id"],
                                "restaurant_name": item["restaurant"],
                                "restaurant_id": f"res_{item['restaurant'].lower().replace(' ', '_').replace('&', 'and')}",
                                "name": item["item"],
                                "price": item["price"],
                                "is_veg": item["veg"],
                                "description": item["description"],
                                "category": item.get("category", ""),
                                "tags": item.get("tags", [])
                            })
                            
                query = (arguments or {}).get("query", "").lower().strip()
                if query:
                    mcp_items = [i for i in mcp_items if query in i["name"].lower() or query in i["description"].lower() or query in i["restaurant_name"].lower()]
                
                return {
                    "content": [{
                        "type": "text",
                        "text": json.dumps(mcp_items[:8])
                    }]
                }
                
            elif tool_name == "update_food_cart":
                return {
                    "content": [{
                        "type": "text",
                        "text": json.dumps({"status": "success", "message": "Successfully updated mock Swiggy food cart."})
                    }]
                }
                
            elif tool_name == "flush_food_cart":
                return {
                    "content": [{
                        "type": "text",
                        "text": json.dumps({"status": "success", "message": "Successfully flushed mock Swiggy food cart."})
                    }]
                }
                
            return {
                "content": [{
                    "type": "text",
                    "text": json.dumps({})
                }]
            }

        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments or {}
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
        
        logger.info(f"Calling MCP tool: {tool_name}")
        async with httpx.AsyncClient() as client:
            try:
                # We could add retry logic here for 401/429
                response = await client.post(
                    self.food_endpoint,
                    json=payload,
                    headers=headers,
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
                
                if "error" in data:
                    logger.error(f"MCP tool error: {data['error']}")
                    raise RuntimeError(f"Tool {tool_name} failed: {data['error']}")
                    
                # The result format for tools/call usually returns { "content": [...] }
                # Let's extract the actual content to make it easier for our app
                result = data.get("result", {})
                
                # We assume the content[0].text holds a JSON string we can parse, or it returns direct data
                # For simplicity, we just return the raw result and let callers parse it
                return result
            except Exception as e:
                logger.error(f"Failed to call tool {tool_name}: {e}")
                raise

    def _parse_content_text(self, result: dict) -> Any:
        """Helper to parse standard MCP content response which often has JSON in content[0].text"""
        import json
        try:
            # If the response contains structuredContent, extract the primary list of entities
            if isinstance(result, dict) and "structuredContent" in result:
                structured = result["structuredContent"]
                if isinstance(structured, dict):
                    # Check for known entity keys inside structuredContent
                    for key in ["addresses", "items", "restaurants"]:
                        if key in structured:
                            return structured[key]
                    return structured

            content = result.get("content", [])
            if content and isinstance(content, list) and "text" in content[0]:
                parsed = json.loads(content[0]["text"])
                # Extract inner data field from Swiggy's standard {success: true, data: ...} response format
                if isinstance(parsed, dict) and parsed.get("success") is True and "data" in parsed:
                    return parsed["data"]
                return parsed
            return result
        except Exception:
            return result
        
    # --- Food Tool Methods ---
    
    async def get_addresses(self) -> list:
        res = await self.call_tool("get_addresses")
        return self._parse_content_text(res)
        
    async def search_restaurants(self, address_id: str, query: str = "") -> list:
        args = {"addressId": address_id}
        if query:
            args["query"] = query
        res = await self.call_tool("search_restaurants", args)
        return self._parse_content_text(res)
        
    async def get_restaurant_menu(self, restaurant_id: str, address_id: str) -> dict:
        args = {"restaurantId": restaurant_id, "addressId": address_id}
        res = await self.call_tool("get_restaurant_menu", args)
        return self._parse_content_text(res)
        
    async def search_menu(self, query: str, address_id: str) -> list:
        args = {"query": query, "addressId": address_id}
        res = await self.call_tool("search_menu", args)
        return self._parse_content_text(res)
        
    async def get_food_cart(self, address_id: str) -> dict:
        args = {"addressId": address_id}
        res = await self.call_tool("get_food_cart", args)
        return self._parse_content_text(res)
        
    async def update_food_cart(self, restaurant_id: str, items: list, address_id: str) -> dict:
        args = {
            "restaurantId": restaurant_id,
            "cartItems": items,
            "addressId": address_id
        }
        res = await self.call_tool("update_food_cart", args)
        
        # Check if Swiggy server indicates failure
        if isinstance(res, dict):
            if res.get("isError") or res.get("successful") is False:
                msg = res.get("statusMessage") or (res.get("content", [{}])[0].get("text") if res.get("content") else "Unknown error")
                # Fallback check inside structuredContent
                struct = res.get("structuredContent")
                if isinstance(struct, dict) and struct.get("successful") is False:
                    msg = struct.get("statusMessage") or msg
                raise RuntimeError(f"Swiggy cart update failed: {msg}")
                
        return self._parse_content_text(res)
        
    async def flush_food_cart(self) -> dict:
        res = await self.call_tool("flush_food_cart")
        return self._parse_content_text(res)
        
    async def fetch_food_coupons(self) -> list:
        res = await self.call_tool("fetch_food_coupons")
        return self._parse_content_text(res)
        
    async def apply_food_coupon(self, coupon_code: str) -> dict:
        args = {"couponCode": coupon_code}
        res = await self.call_tool("apply_food_coupon", args)
        return self._parse_content_text(res)
        
    async def place_food_order(self, payment_method: str = "COD") -> dict:
        args = {"paymentMethod": payment_method}
        res = await self.call_tool("place_food_order", args)
        return self._parse_content_text(res)
        
    async def get_food_orders(self) -> list:
        res = await self.call_tool("get_food_orders")
        return self._parse_content_text(res)
        
    async def get_food_order_details(self, order_id: str) -> dict:
        args = {"orderId": order_id}
        res = await self.call_tool("get_food_order_details", args)
        return self._parse_content_text(res)
        
    async def track_food_order(self, order_id: str) -> dict:
        args = {"orderId": order_id}
        res = await self.call_tool("track_food_order", args)
        return self._parse_content_text(res)

    def _save_session(self, token: Optional[str]):
        import json
        session_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".mcp_session.json")
        try:
            if token:
                with open(session_file, "w") as f:
                    json.dump({"access_token": token}, f)
            else:
                if os.path.exists(session_file):
                    os.remove(session_file)
        except Exception as e:
            logger.warning(f"Failed to save session token: {e}")

    def _load_session(self) -> Optional[str]:
        import json
        session_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".mcp_session.json")
        try:
            if os.path.exists(session_file):
                with open(session_file, "r") as f:
                    data = json.load(f)
                    return data.get("access_token")
        except Exception as e:
            logger.warning(f"Failed to load session token: {e}")
        return None
