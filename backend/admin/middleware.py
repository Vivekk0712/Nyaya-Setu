from fastapi import HTTPException, status
from supabase import Client

async def verify_admin(user_id: str, supabase: Client) -> bool:
    """Check if user is an admin"""
    try:
        response = supabase.table('admin_users').select('*').eq('user_id', user_id).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error verifying admin: {e}")
        return False

async def require_admin(user_id: str, supabase: Client):
    """Middleware to require admin access"""
    is_admin = await verify_admin(user_id, supabase)
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return True
