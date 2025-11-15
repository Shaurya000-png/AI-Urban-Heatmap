import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get credentials
username = os.getenv('NASA_EARTHDATA_USERNAME', '').strip()
password = os.getenv('NASA_EARTHDATA_PASSWORD', '').strip()

print("=== NASA Earthdata Credential Tester ===")
print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'Not set'}")
print("\nTesting connection...")

try:
    # First, try to get a token
    token_url = 'https://urs.earthdata.nasa.gov/oauth/token'
    response = requests.post(
        token_url,
        data={
            'client_id': 'BO_n7nTIlMljdvU6kRRB3g',
            'grant_type': 'password',
            'username': username,
            'password': password
        },
        timeout=10
    )
    
    if response.status_code == 200:
        token_data = response.json()
        if 'access_token' in token_data:
            print("\n✅ Success! Your credentials are valid.")
            print(f"Token Type: {token_data.get('token_type')}")
            print(f"Expires In: {token_data.get('expires_in')} seconds")
            exit(0)
    
    # If token auth fails, try basic auth
    auth = (username, password)
    test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'
    response = requests.get(test_url, auth=auth, allow_redirects=True, timeout=10)
    
    if response.status_code == 200 and 'login' not in response.url:
        print("\n✅ Success! Your credentials are valid (Basic Auth).")
    else:
        print("\n❌ Authentication failed. Please check your credentials.")
        print(f"Status Code: {response.status_code}")
        print(f"Final URL: {response.url}")
        print("\nTroubleshooting:")
        print("1. Visit https://urs.earthdata.nasa.gov/")
        print("2. Try logging in with your credentials")
        print("3. If login fails, use 'Forgot Password' to reset")
        print("4. Make sure your account is activated (check your email)")
        
except requests.exceptions.SSLError as e:
    print("\n❌ SSL Certificate Error:")
    print(str(e))
    print("\nTry running: pip install --upgrade certifi")
    
except Exception as e:
    print("\n❌ Error:", str(e))
    print("\nDebug Info:")
    print(f"Username length: {len(username)}")
    print(f"Password length: {len(password)}")
    print("\nTry these steps:")
    print("1. Check your internet connection")
    print("2. Make sure your password doesn't contain special characters that might need escaping")
    print("3. Try with a simpler password (temporarily)")
    print("4. Visit https://urs.earthdata.nasa.gov/ to verify your account status")
