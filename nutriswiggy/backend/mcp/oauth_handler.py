import os
import base64
import hashlib
import logging
import httpx
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

class OAuthHandler:
    """Manages OAuth 2.1 PKCE flow for Swiggy MCP."""
    
    def __init__(self, base_url: str, redirect_uri: str):
        self.base_url = base_url
        self.redirect_uri = redirect_uri
        self.client_id = os.getenv("SWIGGY_CLIENT_ID")
        self.client_secret = os.getenv("SWIGGY_CLIENT_SECRET")
        self.code_verifier = None
        self.state = None
        
    def generate_pkce_pair(self) -> Tuple[str, str]:
        """Generates a PKCE code_verifier and code_challenge (S256)."""
        # code_verifier: high-entropy cryptographic random string
        verifier_bytes = os.urandom(32)
        verifier = base64.urlsafe_b64encode(verifier_bytes).rstrip(b'=').decode('ascii')
        
        # code_challenge: base64url(SHA256(code_verifier))
        challenge_bytes = hashlib.sha256(verifier.encode('ascii')).digest()
        challenge = base64.urlsafe_b64encode(challenge_bytes).rstrip(b'=').decode('ascii')
        
        self.code_verifier = verifier
        return verifier, challenge
        
    async def register_client(self) -> str:
        """
        Dynamic Client Registration (RFC 7591)
        Registers the client dynamically to receive a client_id.
        """
        if self.client_id:
            logger.info(f"Skipping dynamic client registration. Using configured Client ID: {self.client_id}")
            return self.client_id
            
        logger.info("Registering MCP client via Dynamic Client Registration...")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/auth/register",
                    json={
                        "client_name": "Antigravity",
                        "redirect_uris": [self.redirect_uri],
                        "grant_types": ["authorization_code", "refresh_token"],
                        "token_endpoint_auth_method": "none"  # Since it's a public client with PKCE
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                self.client_id = data.get("client_id")
                logger.info(f"Successfully registered client. Client ID: {self.client_id}")
                return self.client_id
            except Exception as e:
                logger.error(f"Failed to register client dynamically: {e}")
                raise
        
    def build_authorize_url(self) -> str:
        """Builds the URL for the user to authenticate in the browser."""
        if not self.client_id:
            raise ValueError("Client ID is missing. Call register_client() first.")
            
        _, challenge = self.generate_pkce_pair()
        
        # Generate random state
        self.state = base64.urlsafe_b64encode(os.urandom(16)).rstrip(b'=').decode('ascii')
        
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "state": self.state,
            "scope": "mcp:tools"
        }
        
        # Build query string
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{self.base_url}/auth/authorize?{query_string}"
        logger.info(f"Built authorization URL: {url}")
        
        return url
        
    async def exchange_code(self, code: str) -> Dict[str, Any]:
        """Exchanges the authorization code for an access token."""
        if not self.client_id:
            raise ValueError("Client ID is missing.")
        if not self.code_verifier:
            raise ValueError("Code verifier is missing. PKCE flow must be started first.")
            
        logger.info("Exchanging authorization code for access token...")
        
        token_request_data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "code": code,
            "redirect_uri": self.redirect_uri,
            "code_verifier": self.code_verifier
        }
        if self.client_secret:
            token_request_data["client_secret"] = self.client_secret
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/auth/token",
                    data=token_request_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10.0
                )
                response.raise_for_status()
                token_data = response.json()
                logger.info("Successfully exchanged code for access token.")
                return token_data
            except Exception as e:
                logger.error(f"Failed to exchange code: {e}")
                raise
