import os
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def search_menu(query: str, veg_only: bool = False) -> List[Dict]:
    """
    Searches the mock Swiggy food menu dataset for matching items.
    
    Args:
        query (str): Space-separated search keywords (e.g. 'protein bowl grilled').
        veg_only (bool): If True, only returns vegetarian options.
        
    Returns:
        List[Dict]: List of matching menu items.
    """
    try:
        # Load mock menu relative to this tool's location
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "data", "mock_menu.json")
        
        if not os.path.exists(data_path):
            logger.error(f"Mock menu not found at {data_path}")
            return []
            
        with open(data_path, "r", encoding="utf-8") as f:
            menu = json.load(f)
            
        # Parse query keywords
        keywords = [kw.lower().strip() for kw in query.split() if kw.strip()]
        
        results = []
        for item in menu:
            # Strict Veg Filtering
            if veg_only and not item.get("veg", False):
                continue
                
            # If query is empty, add all items matching veg condition
            if not keywords:
                results.append(item)
                continue
                
            # Check for keyword matches in item fields
            item_name = item.get("item", "").lower()
            description = item.get("description", "").lower()
            category = item.get("category", "").lower()
            tags = [t.lower() for t in item.get("tags", [])]
            
            match_score = 0
            for kw in keywords:
                if kw in item_name:
                    match_score += 3  # Higher weight for item name matches
                if kw in category:
                    match_score += 2
                if kw in description:
                    match_score += 1
                if any(kw in tag for tag in tags):
                    match_score += 1.5
                    
            if match_score > 0:
                # Store match score for ranking search relevance initially
                item_copy = item.copy()
                item_copy["_search_score"] = match_score
                results.append(item_copy)
                
        # Sort by search relevance
        results.sort(key=lambda x: x.get("_search_score", 0), reverse=True)
        
        # Clean up temporary search score
        for res in results:
            res.pop("_search_score", None)
            
        logger.info(f"Search for '{query}' (veg_only={veg_only}) returned {len(results)} items.")
        return results
        
    except Exception as e:
        logger.error(f"Error searching menu: {str(e)}")
        return []

def normalize_swiggy_menu_item(mcp_item: Dict) -> Dict:
    """Convert a real Swiggy MCP menu item to our internal format."""
    # Handle possible key variations in Swiggy schemas
    item_id = mcp_item.get("menu_item_id") or mcp_item.get("item_id") or mcp_item.get("id") or ""
    restaurant_name = mcp_item.get("restaurant_name") or mcp_item.get("restaurantName") or mcp_item.get("restaurant") or "Swiggy Kitchen"
    restaurant_id = mcp_item.get("restaurant_id") or mcp_item.get("restaurantId") or ""
    item_name = mcp_item.get("name") or mcp_item.get("itemName") or mcp_item.get("item") or ""
    
    # is_veg could be boolean or string or int
    is_veg_raw = mcp_item.get("isVeg") or mcp_item.get("is_veg") or mcp_item.get("veg")
    is_veg = False
    if isinstance(is_veg_raw, bool):
        is_veg = is_veg_raw
    elif isinstance(is_veg_raw, (int, float)):
        is_veg = bool(is_veg_raw)
    elif isinstance(is_veg_raw, str):
        is_veg = is_veg_raw.lower() in ("true", "1", "veg", "yes")

    return {
        "id": item_id,
        "restaurant": restaurant_name,
        "restaurant_id": restaurant_id,
        "item": item_name,
        "price": mcp_item.get("price", 0),
        "veg": is_veg,
        "description": mcp_item.get("description", ""),
        "category": mcp_item.get("category", ""),
        "tags": mcp_item.get("tags", []),
    }

# Simple visual test if run directly
if __name__ == "__main__":
    print("Testing search_menu with 'protein':")
    results = search_menu("protein")
    for r in results[:2]:
        print(f"- {r['item']} ({r['restaurant']}) | Veg: {r['veg']}")
        
    print("\nTesting search_menu with 'paneer' and veg_only=True:")
    results_veg = search_menu("paneer", veg_only=True)
    for r in results_veg[:2]:
        print(f"- {r['item']} ({r['restaurant']}) | Veg: {r['veg']}")
