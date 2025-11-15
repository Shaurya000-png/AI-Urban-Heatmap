import os
import aiohttp
import asyncio
import ssl
import certifi

async def test_nasa_auth():
    username = os.getenv('NASA_EARTHDATA_USERNAME', 'your_nasa_username')
    password = os.getenv('NASA_EARTHDATA_PASSWORD', 'your_nasa_password')
    
    # Create SSL context
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    
    # Create a connector with our SSL context
    connector = aiohttp.TCPConnector(ssl=ssl_context)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        # Test URL that requires authentication
        test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'
        
        try:
            # Try to access a protected resource
            auth = aiohttp.BasicAuth(username, password, encoding='latin1')
            
            print("Attempting to authenticate with NASA Earthdata...")
            print(f"Username: {username}")
            print("Password: ********")
            
            async with session.get(
                test_url,
                auth=auth,
                allow_redirects=True,
                timeout=aiohttp.ClientTimeout(total=15)
            ) as response:
                print("\n=== Response Details ===")
                print(f"Status Code: {response.status}")
                print(f"Final URL: {response.url}")
                
                if 'login' in str(response.url):
                    print("\n❌ Authentication Failed: Redirected to login page")
                    print("Possible reasons:")
                    print("1. Incorrect username or password")
                    print("2. Account is locked or not activated")
                    print("3. Password contains special characters causing issues")
                else:
                    print("\n✅ Authentication Successful!")
                    print("Your credentials are working correctly.")
                
        except Exception as e:
            print(f"\n❌ Error during authentication:")
            print(f"Type: {type(e).__name__}")
            print(f"Error: {str(e)}")
            print("\nTroubleshooting:")
            print("1. Check your internet connection")
            print("2. Try with a simpler password (without special characters)")
            print("3. Verify your account status at https://urs.earthdata.nasa.gov/")

# Run the test
if __name__ == "__main__":
    print("=== NASA Earthdata Authentication Test ===")
    asyncio.run(test_nasa_auth())
