"""
Authentication utilities for JWT verification
"""

import os
import jwt
from fastapi import HTTPException, Header, status
from typing import Optional
from datetime import datetime

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM = "HS256"

# Debug: Check if JWT secret is loaded
if not JWT_SECRET:
    print("WARNING: SUPABASE_JWT_SECRET not found in environment variables!")
    print("Authentication will fail. Please add SUPABASE_JWT_SECRET to your .env file")
else:
    print(f"JWT Secret loaded successfully (length: {len(JWT_SECRET)})")

def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode JWT token from Supabase
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT secret not configured. Please set SUPABASE_JWT_SECRET in .env file"
        )
    
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decode and verify token
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False}  # Supabase doesn't use aud claim
        )
        
        # Check expiration
        exp = payload.get('exp')
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )

def get_user_from_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Extract user information from JWT token
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        User information from token payload
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = verify_jwt_token(authorization)
    
    # Extract user info from payload
    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return {
        'id': user_id,
        'email': payload.get('email'),
        'role': payload.get('role'),
        'payload': payload
    }
