import requests
import json

# Base URL of your backend API
BASE_URL = 'http://localhost:8000'

def test_endpoint(endpoint, method='GET', data=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"\nTesting {method} {url}")
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url)
        elif method.upper() == 'POST':
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, data=json.dumps(data), headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        try:
            print("Response:", json.dumps(response.json(), indent=2))
        except:
            print("Response:", response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

# Test endpoints
if __name__ == "__main__":
    print("=== Testing Backend API Endpoints ===\n")
    
    # Test basic API health check
    test_endpoint('/api/health')
    
    # Test getting hotspots
    test_endpoint('/api/hotspots')
    
    # Test getting hotspot statistics
    test_endpoint('/api/hotspots/stats')
    
    # Test getting data for a specific city
    test_endpoint('/api/data/pune', 'GET')  # Assuming 'pune' is a valid city
