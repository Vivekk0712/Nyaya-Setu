"""
Test JWT token verification
Run this after logging in to test if your JWT secret is correct
"""

import os
import jwt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

print("=" * 60)
print("JWT Token Test")
print("=" * 60)

if not JWT_SECRET:
    print("ERROR: SUPABASE_JWT_SECRET not found!")
    exit(1)

print(f"JWT Secret loaded: {JWT_SECRET[:20]}... (length: {len(JWT_SECRET)})")
print()

# Test with a sample token
print("To test with a real token:")
print("1. Login to your app")
print("2. Open browser DevTools → Console")
print("3. Run: await supabase.auth.getSession()")
print("4. Copy the access_token")
print("5. Paste it below when prompted")
print()

token = input("Paste your access token here (or press Enter to skip): ").strip()

if token:
    try:
        # Try to decode without verification first
        print("\nDecoding token (no verification)...")
        unverified = jwt.decode(token, options={"verify_signature": False})
        print("✓ Token structure is valid")
        print(f"  User ID: {unverified.get('sub')}")
        print(f"  Email: {unverified.get('email')}")
        print(f"  Role: {unverified.get('role')}")
        print(f"  Issuer: {unverified.get('iss')}")
        
        # Now try with verification
        print("\nVerifying token with JWT secret...")
        verified = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        print("✓ Token verified successfully!")
        print("  Your JWT secret is CORRECT!")
        
    except jwt.InvalidSignatureError:
        print("\n✗ SIGNATURE VERIFICATION FAILED!")
        print("  Your JWT secret is INCORRECT!")
        print("\nHow to fix:")
        print("1. Go to Supabase Dashboard")
        print("2. Settings → API")
        print("3. Scroll to 'JWT Settings'")
        print("4. Copy the JWT Secret (not the anon key!)")
        print("5. Update SUPABASE_JWT_SECRET in backend/.env")
        
    except jwt.ExpiredSignatureError:
        print("\n✗ Token has expired")
        print("  Login again to get a fresh token")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
else:
    print("Skipped token test")

print("\n" + "=" * 60)
