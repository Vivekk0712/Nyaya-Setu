"""
Test script to verify environment variables are loaded correctly
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 50)
print("Environment Variables Check")
print("=" * 50)

required_vars = {
    "SUPABASE_URL": os.getenv("SUPABASE_URL"),
    "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
    "SUPABASE_JWT_SECRET": os.getenv("SUPABASE_JWT_SECRET"),
    "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY")
}

all_good = True

for var_name, var_value in required_vars.items():
    if var_value:
        # Show first 20 chars for security
        display_value = var_value[:20] + "..." if len(var_value) > 20 else var_value
        print(f"✓ {var_name}: {display_value} (length: {len(var_value)})")
    else:
        print(f"✗ {var_name}: NOT SET")
        all_good = False

print("=" * 50)

if all_good:
    print("✓ All environment variables are set!")
    print("\nYou can now run: python main.py")
else:
    print("✗ Some environment variables are missing!")
    print("\nPlease check your .env file and ensure all variables are set.")
    print("\nExample .env file:")
    print("""
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-secret-here
GEMINI_API_KEY=AIzaSy...
    """)

print("=" * 50)

# Test JWT if secret is available
if required_vars["SUPABASE_JWT_SECRET"]:
    print("\nTesting JWT functionality...")
    try:
        import jwt
        
        # Create a test token
        test_payload = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "role": "authenticated"
        }
        
        test_token = jwt.encode(
            test_payload,
            required_vars["SUPABASE_JWT_SECRET"],
            algorithm="HS256"
        )
        
        print(f"✓ Test token created: {test_token[:30]}...")
        
        # Verify the token
        decoded = jwt.decode(
            test_token,
            required_vars["SUPABASE_JWT_SECRET"],
            algorithms=["HS256"]
        )
        
        print(f"✓ Token verified successfully!")
        print(f"  User ID: {decoded['sub']}")
        print(f"  Email: {decoded['email']}")
        
    except Exception as e:
        print(f"✗ JWT test failed: {e}")
