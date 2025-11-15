import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get credentials
username = os.getenv('NASA_EARTHDATA_USERNAME')
password = os.getenv('NASA_EARTHDATA_PASSWORD')

print("=== NASA Earthdata Connection Test ===")
print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'Not set'}")

# Test URL
test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'

print("\nTesting connection...")
try:
    # Try with session to handle redirects
    session = requests.Session()
    
    # First, get the login page
    login_url = 'https://urs.earthdata.nasa.gov/oauth/authorize'
    session.get(login_url, timeout=10)
    
    # Now try to access a protected resource
    response = session.get(
        test_url,
        auth=(username, password),
        allow_redirects=True,
        timeout=15
    )
    
    print("\n=== Test Results ===")
    print(f"Status Code: {response.status_code}")
    print(f"Final URL: {response.url}")
    
    if 'login' in response.url:
        print("\n❌ Authentication Failed: Redirected to login page")
        print("This usually means the username or password is incorrect.")
    else:
        print("\n✅ Connection successful! Your credentials are working.")
        
except Exception as e:
    print("\n❌ Error:", str(e))
    print("\nTroubleshooting:")
    print("1. Check your internet connection")
    print("2. Verify your credentials at https://urs.earthdata.nasa.gov/")
    print("3. Make sure your account is activated (check your email)")
    print("4. Try resetting your password if needed")
