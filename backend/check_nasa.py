import os
import requests
from dotenv import load_dotenv

print("=== NASA Earthdata Connection Test ===")

# Load environment variables
load_dotenv()

# Get credentials
username = os.getenv('NASA_EARTHDATA_USERNAME')
password = os.getenv('NASA_EARTHDATA_PASSWORD')

print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'Not set'}")

# Test URL
test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'

print("\nTesting connection...")
try:
    response = requests.get(
        test_url,
        auth=(username, password),
        allow_redirects=True,
        timeout=10
    )
    
    print("\n=== Results ===")
    print(f"Status Code: {response.status_code}")
    print(f"Final URL: {response.url}")
    
    if 'login' in response.url:
        print("\n❌ Authentication Failed: Redirected to login page")
        print("Please check your username and password at https://urs.earthdata.nasa.gov/")
    else:
        print("\n✅ Connection successful! Your credentials are working.")
        
except Exception as e:
    print("\n❌ Error:", str(e))
    print("\nTroubleshooting:")
    print("1. Check your internet connection")
    print("2. Verify your credentials at https://urs.earthdata.nasa.gov/")
    print("3. Try resetting your password if needed")
