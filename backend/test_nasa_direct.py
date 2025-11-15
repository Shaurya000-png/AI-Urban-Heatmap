import os
import requests
import sys

print("=== NASA Earthdata Authentication Test ===")
print("Python version:", sys.version)
print("Requests version:", requests.__version__)

# Test credentials
username = os.getenv('NASA_EARTHDATA_USERNAME', 'your_nasa_username')
password = os.getenv('NASA_EARTHDATA_PASSWORD', 'your_nasa_password')

try:
    print("\n1. Testing direct connection to NASA Earthdata...")
    
    # First, try to access the login page
    login_url = 'https://urs.earthdata.nasa.gov/oauth/authorize'
    print(f"Accessing {login_url}")
    
    session = requests.Session()
    response = session.get(login_url, timeout=10)
    print(f"Login page status: {response.status_code}")
    
    # Now try to authenticate
    print("\n2. Attempting authentication...")
    auth = requests.auth.HTTPBasicAuth(username, password)
    test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'
    
    response = session.get(test_url, auth=auth, allow_redirects=True, timeout=15)
    
    print("\n=== Results ===")
    print(f"Final URL: {response.url}")
    print(f"Status Code: {response.status_code}")
    print(f"Response length: {len(response.text)} characters")
    
    if 'login' in response.url:
        print("\n❌ Authentication Failed: Redirected to login page")
        print("Possible issues:")
        print("1. Incorrect username or password")
        print("2. Account is locked or not activated")
        print("3. Password contains special characters causing issues")
    else:
        print("\n✅ Authentication Successful!")
        print("Your credentials are working correctly.")
        
except Exception as e:
    print("\n❌ Error during test:")
    print(f"Type: {type(e).__name__}")
    print(f"Error: {str(e)}")
    
    if "CERTIFICATE_VERIFY_FAILED" in str(e):
        print("\nSSL Certificate verification failed. Try running:")
        print("pip install --upgrade certifi")
    
    print("\nTroubleshooting:")
    print("1. Check your internet connection")
    print("2. Try with a simpler password (without special characters)")
    print("3. Verify your account status at https://urs.earthdata.nasa.gov/")
    print("4. Try resetting your password")
