"""
Script to make a user an admin
Usage: python make_admin.py <user_email>
"""

import sys
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def make_admin(email: str):
    """Add user to admin_users table"""
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )
    
    try:
        # Get user by email
        # Note: This requires service role key for admin operations
        # For now, we'll need the user_id directly
        print(f"To make {email} an admin:")
        print("1. Go to Supabase Dashboard > Authentication > Users")
        print(f"2. Find the user with email: {email}")
        print("3. Copy their User ID")
        print("4. Run this SQL in Supabase SQL Editor:")
        print(f"\nINSERT INTO admin_users (user_id) VALUES ('USER_ID_HERE');")
        print("\nReplace USER_ID_HERE with the actual user ID")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <user_email>")
        sys.exit(1)
    
    email = sys.argv[1]
    make_admin(email)
