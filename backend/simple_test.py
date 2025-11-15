import os
import requests
from requests.auth import HTTPBasicAuth

# Your credentials (set via environment variables or replace below)
username = os.getenv('NASA_EARTHDATA_USERNAME', 'your_nasa_username')
password = os.getenv('NASA_EARTHDATA_PASSWORD', 'your_nasa_password')

try:
    print("Testing NASA Earthdata authentication...")
    response = requests.get(
        'https://n5eil02u.ecs.nsidc.org/egi/request',
        auth=HTTPBasicAuth(username, password),
        allow_redirects=True,
        timeout=15
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Final URL: {response.url}")
    
    if 'login' in response.url:
        print("❌ Authentication Failed: Redirected to login page")
    else:
        print("✅ Authentication Successful!")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Check your internet connection")
    print("2. Try with a simpler password (without special characters)")
    print("3. Verify your account status at https://urs.earthdata.nasa.gov/")
    print("4. Check if your account is locked or needs activation")
