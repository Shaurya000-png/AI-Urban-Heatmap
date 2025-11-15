import os
import sys
import asyncio
import aiohttp
import ssl
import certifi
import base64
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

# Create a custom SSL context that uses certifi's certificate bundle
ssl_context = ssl.create_default_context(cafile=certifi.where())

# Load environment variables from .env file in the parent directory
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    # Try to create from .env.example if .env doesn't exist
    example_path = Path(__file__).parent / '.env.example'
    if example_path.exists():
        with open(example_path, 'r') as src, open(env_path, 'w') as dst:
            dst.write(src.read())
    else:
        print("Error: .env file not found and .env.example is missing")
        sys.exit(1)

# Load environment variables
load_dotenv(dotenv_path=env_path, override=True)

# Print environment variables being used (without sensitive data)
print("\nCurrent Configuration:")
print("=" * 30)
for var in ['OPENWEATHER_API_KEY', 'GOOGLE_MAPS_API_KEY', 'NASA_EARTHDATA_USERNAME']:
    value = os.getenv(var, 'Not Set')
    masked = value[:4] + '*' * (len(value) - 4) if value and value != 'Not Set' else 'Not Set'
    print(f"{var}: {masked}")
print("=" * 30 + "\n")

class ServiceVerifier:
    def __init__(self):
        self.results = {}
        self.session = None
    
    async def verify_all(self):
        """Verify all configured services"""
        # Create a connector with our SSL context
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        self.session = aiohttp.ClientSession(connector=connector)
        
        try:
            # Run all verifications concurrently
            await asyncio.gather(
                self.verify_openweather(),
                self.verify_google_maps(),
                self.verify_nasa_earthdata(),
                self.verify_osm()
            )
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            await self.session.close()
        
        self.print_results()
    
    async def verify_openweather(self):
        """Verify OpenWeatherMap API"""
        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key or api_key == 'your_openweather_api_key':
            self.results['openweather'] = {
                'status': 'error',
                'message': 'API key not configured in .env file',
                'solution': 'Add OPENWEATHER_API_KEY=your_key_here to .env'
            }
            return
        
        url = f"http://api.openweathermap.org/data/2.5/weather?q=Pune,IN&appid={api_key}&units=metric"
        
        try:
            async with self.session.get(url, timeout=10) as response:
                data = await response.json()
                if response.status == 200 and data.get('main'):
                    self.results['openweather'] = {
                        'status': 'success',
                        'data': {
                            'city': data['name'],
                            'temp': data['main']['temp'],
                            'humidity': data['main']['humidity']
                        }
                    }
                else:
                    self.results['openweather'] = {
                        'status': 'error',
                        'message': data.get('message', 'Unknown error'),
                        'code': response.status
                    }
        except Exception as e:
            self.results['openweather'] = {
                'status': 'error',
                'message': str(e)
            }
    
    async def verify_google_maps(self):
        """Verify Google Maps API"""
        api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        if not api_key or api_key == 'your_google_maps_api_key':
            self.results['google_maps'] = {
                'status': 'warning',
                'message': 'API key not configured',
                'solution': 'Add GOOGLE_MAPS_API_KEY=your_key_here to .env (optional)'
            }
            return
        
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address=Pune&key={api_key}"
        
        try:
            async with self.session.get(url, timeout=10) as response:
                data = await response.json()
                if data.get('status') == 'OK' and data.get('results'):
                    self.results['google_maps'] = {
                        'status': 'success',
                        'data': {
                            'address': data['results'][0]['formatted_address'],
                            'location': data['results'][0]['geometry']['location']
                        }
                    }
                else:
                    self.results['google_maps'] = {
                        'status': 'error',
                        'message': data.get('error_message', 'Unknown error'),
                        'code': data.get('status')
                    }
        except Exception as e:
            self.results['google_maps'] = {
                'status': 'error',
                'message': str(e)
            }
    
    async def verify_nasa_earthdata(self):
        """Verify NASA Earthdata credentials with better error handling"""
        username = os.getenv('NASA_EARTHDATA_USERNAME', '').strip()
        password = os.getenv('NASA_EARTHDATA_PASSWORD', '').strip()
        
        # Check if credentials are set
        if not username or username == 'your_nasa_username' or not password or password == 'your_nasa_password':
            self.results['nasa_earthdata'] = {
                'status': 'warning',
                'message': 'NASA Earthdata credentials not configured',
                'solution': 'Add NASA_EARTHDATA_USERNAME and NASA_EARTHDATA_PASSWORD to .env (optional)'
            }
            return
        
        # Test URL that requires authentication
        test_url = 'https://n5eil02u.ecs.nsidc.org/egi/request'
        
        try:
            # First, get the login page to initialize session
            async with self.session.get(
                'https://urs.earthdata.nasa.gov/oauth/authorize',
                timeout=aiohttp.ClientTimeout(total=15)
            ) as login_page:
                # Try with URL-encoded credentials in the Authorization header
                auth_string = f"{username}:{password}"
                encoded_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
                
                headers = {
                    'Authorization': f'Basic {encoded_auth}',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                # Test with direct token-based authentication
                token_url = 'https://urs.earthdata.nasa.gov/oauth/token?client_id=BO_n7nTIlMljdvU6kRRB3g&grant_type=password'
                
                try:
                    # First try token-based auth
                    async with self.session.post(
                        token_url,
                        data={'username': username, 'password': password},
                        headers={'Content-Type': 'application/x-www-form-urlencoded'},
                        allow_redirects=True,
                        timeout=15
                    ) as token_response:
                        token_data = await token_response.json()
                        
                        if 'access_token' in token_data:
                            self.results['nasa_earthdata'] = {
                                'status': 'success',
                                'message': 'Authentication successful (token-based)',
                                'data': {
                                    'username': username,
                                    'token_type': token_data.get('token_type', 'bearer'),
                                    'expires_in': token_data.get('expires_in')
                                }
                            }
                            return
                        
                        # If token auth fails, try basic auth as fallback
                        async with self.session.get(
                            test_url,
                            headers=headers,
                            allow_redirects=True,
                            timeout=15
                        ) as response:
                            if response.status == 200 and 'login' not in str(response.url):
                                self.results['nasa_earthdata'] = {
                                    'status': 'success',
                                    'message': 'Authentication successful (basic auth)',
                                    'data': {
                                        'username': username,
                                        'last_checked': datetime.utcnow().isoformat()
                                    }
                                }
                            else:
                                raise Exception("Authentication failed - check credentials")
                                
                except Exception as e:
                    # If both methods fail, show detailed error
                    self.results['nasa_earthdata'] = {
                        'status': 'error',
                        'message': f'Authentication failed: {str(e)}',
                        'solution': (
                            '1. Verify your username and password at https://urs.earthdata.nasa.gov/\n'
                            '2. Try resetting your password if needed\n'
                            '3. Make sure your account is activated (check your email)'
                        ),
                        'debug': {
                            'username_length': len(username),
                            'password_starts_with': password[:1] + '*' * (len(password) - 1) if password else 'empty',
                            'chars_in_password': [c for c in password]
                        }
                    }
        except Exception as e:
            self.results['nasa_earthdata'] = {
                'status': 'error',
                'message': str(e),
                'solution': 'Check your internet connection or try again later'
            }
    
    async def verify_osm(self):
        """Verify OpenStreetMap Overpass API"""
        # Try different Overpass API endpoints
        endpoints = [
            'https://overpass.kumi.systems/api/interpreter',  # Community-maintained
            'https://overpass.nchc.org.tw/api/interpreter',   # Taiwan mirror
            'https://overpass-api.de/api/interpreter'         # Original (fallback)
        ]
        
        query = """
        [out:json][timeout:25];
        node["place"="city"]["name"="Pune"];
        out body;
        """
        
        last_error = None
        
        for url in endpoints:
            try:
                async with self.session.post(
                    url,
                    data={'data': query},
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    timeout=aiohttp.ClientTimeout(total=20)
                ) as response:
                    data = await response.json()
                    if 'elements' in data:
                        self.results['openstreetmap'] = {
                            'status': 'success',
                            'data': {
                                'elements_found': len(data['elements']),
                                'service': 'operational',
                                'endpoint': url,
                                'timestamp': datetime.utcnow().isoformat()
                            }
                        }
                        return  # Success, exit the loop
                    else:
                        last_error = 'Unexpected response format'
                
                # If we got here, there was an error with this endpoint
                last_error = f"Status {response.status}: {await response.text()}"
                
            except Exception as e:
                last_error = str(e)
            
            # Wait a bit before trying the next endpoint
            await asyncio.sleep(1)
        
        # If we get here, all endpoints failed
        self.results['openstreetmap'] = {
            'status': 'error',
            'message': 'All Overpass API endpoints failed',
            'last_error': last_error,
            'solution': 'The Overpass API might be experiencing issues. Please try again later or check status.overpass-api.de'
        }
    
    def print_results(self):
        """Print verification results"""
        print("\n" + "="*50)
        print("SERVICE VERIFICATION REPORT")
        print("="*50)
        
        success_count = sum(1 for r in self.results.values() if r['status'] == 'success')
        warning_count = sum(1 for r in self.results.values() if r['status'] == 'warning')
        error_count = sum(1 for r in self.results.values() if r['status'] == 'error')
        
        print(f"\nSummary: {success_count} successful, {warning_count} warnings, {error_count} errors\n")
        
        for service, result in self.results.items():
            status = result['status'].upper()
            color = {
                'SUCCESS': '\033[92m',  # Green
                'WARNING': '\033[93m',  # Yellow
                'ERROR': '\033[91m'     # Red
            }.get(status, '\033[0m')
            
            print(f"{color}{service.upper()}: {status}\033[0m")
            
            if 'message' in result:
                print(f"  Message: {result['message']}")
            if 'solution' in result:
                print(f"  Solution: \033[94m{result['solution']}\033[0m")
            if 'data' in result:
                print("  Data:")
                for key, value in result['data'].items():
                    print(f"    {key}: {value}")
            print()  # Add space between services
        
        print("\n" + "="*50)
        print("VERIFICATION COMPLETE")
        print("="*50)

if __name__ == "__main__":
    verifier = ServiceVerifier()
    asyncio.run(verifier.verify_all())
