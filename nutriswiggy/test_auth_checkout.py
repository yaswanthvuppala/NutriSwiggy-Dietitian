import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from backend.main import CartSyncRequest
from backend.mcp.swiggy_mcp_client import SwiggyMCPClient


def main() -> None:
    payload = CartSyncRequest(
        restaurantId="123",
        restaurant="Demo Kitchen",
        items=[{"itemId": "dish-1", "quantity": 1}],
    )
    assert payload.items[0].quantity == 1
    assert not hasattr(SwiggyMCPClient(), "_save_session")


if __name__ == "__main__":
    main()
    print("auth checkout checks passed")
