import os
import aiohttp
import asyncio
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime
from dotenv import load_dotenv
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TrafficService:
    """Service for fetching real-time traffic data"""
    
    def __init__(self):
        self.api_key = os.getenv('HERE_API_KEY')
        self.base_url = "https://traffic.ls.hereapi.com/traffic/6.3"
        
    async def get_traffic_flow(self, lat: float, lon: float, radius: int = 1000) -> Optional[Dict]:
        """
        Get traffic flow data for a specific location
        
        Args:
            lat: Latitude of the location
            lon: Longitude of the location
            radius: Search radius in meters (default: 1000m)
            
        Returns:
            Dictionary containing traffic flow data
        """
        if not self.api_key:
            logger.error("HERE API key not found in environment variables")
            return None
            
        url = f"{self.base_url}/flow.json"
        params = {
            'apiKey': self.api_key,
            'prox': f"{lat},{lon},{radius}",
            'responseattributes': 'shp',
            'units': 'metric'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_traffic_data(data, lat, lon)
                    else:
                        error_text = await response.text()
                        logger.error(f"Error fetching traffic data: {response.status} - {error_text}")
                        return None
        except Exception as e:
            logger.error(f"Error in get_traffic_flow: {str(e)}")
            return None
    
    def _process_traffic_data(self, data: Dict, lat: float, lon: float) -> Dict:
        """Process raw traffic data into a standardized format"""
        if 'RWS' not in data or not data['RWS']:
            return {
                'status': 'no_data',
                'message': 'No traffic data available for this location',
                'location': {'lat': lat, 'lon': lon},
                'timestamp': datetime.utcnow().isoformat()
            }
            
        # Get the first road segment (most relevant)
        rw = data['RWS'][0]
        if not rw.get('RW'):
            return {
                'status': 'no_data',
                'message': 'No road segments found in this area',
                'location': {'lat': lat, 'lon': lon},
                'timestamp': datetime.utcnow().isoformat()
            }
            
        road = rw['RW'][0]
        flow = road.get('FIS', [{}])[0].get('FI', [{}])[0]  # Get first flow item
        
        # Calculate traffic density (0-1 scale)
        jam_factor = flow.get('TMC', {}).get('QD', 0) / 10.0  # Scale 0-10 to 0-1
        
        return {
            'status': 'ok',
            'location': {'lat': lat, 'lon': lon},
            'road': {
                'id': road.get('id'),
                'name': road.get('DE'),
                'speed': flow.get('SP'),
                'speed_limit': flow.get('FF'),
                'jam_factor': jam_factor,
                'traffic_density': self._calculate_traffic_density(jam_factor),
                'congestion': flow.get('TMC', {}).get('DE', '').lower()
            },
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'HERE Traffic API'
        }
    
    def _calculate_traffic_density(self, jam_factor: float) -> float:
        """Convert jam factor to a 0-1 traffic density value"""
        # Scale jam factor (0-10) to 0-1
        return min(1.0, max(0.0, jam_factor / 10.0))
    
    async def get_traffic_incidents(self, lat: float, lon: float, radius: int = 5000) -> Optional[Dict]:
        """
        Get traffic incidents for a specific location
        
        Args:
            lat: Latitude of the location
            lon: Longitude of the location
            radius: Search radius in meters (default: 5000m)
            
        Returns:
            Dictionary containing traffic incidents
        """
        if not self.api_key:
            logger.error("HERE API key not found in environment variables")
            return None
            
        url = f"https://data.traffic.hereapi.com/v7/incidents"
        params = {
            'apiKey': self.api_key,
            'in': f"circle:{lat},{lon};r={radius}",
            'status': 'active',
            'criticality': 'minor,normal,major',
            'locationReferencing': 'olr'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_incidents(data, lat, lon)
                    else:
                        error_text = await response.text()
                        logger.error(f"Error fetching traffic incidents: {response.status} - {error_text}")
                        return None
        except Exception as e:
            logger.error(f"Error in get_traffic_incidents: {str(e)}")
            return None
    
    def _process_incidents(self, data: Dict, lat: float, lon: float) -> Dict:
        """Process traffic incidents data"""
        incidents = []
        
        for item in data.get('incidents', []):
            incident = {
                'id': item.get('id'),
                'type': item.get('type'),
                'criticality': item.get('criticality'),
                'description': item.get('description', {}).get('value', 'No description available'),
                'start_time': item.get('startTime'),
                'end_time': item.get('endTime'),
                'location': item.get('location', {}).get('shape', {}).get('links', [{}])[0].get('points', [{}])[0]
            }
            incidents.append(incident)
            
        return {
            'status': 'ok',
            'count': len(incidents),
            'incidents': incidents,
            'location': {'lat': lat, 'lon': lon},
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'HERE Traffic API'
        }

# Example usage
async def example():
    traffic_service = TrafficService()
    
    # Example coordinates for a location in Pune, India
    lat, lon = 18.5204, 73.8567
    
    # Get traffic flow data
    traffic_flow = await traffic_service.get_traffic_flow(lat, lon)
    
    if traffic_flow and traffic_flow.get('status') == 'ok':
        print(f"Traffic on {traffic_flow['road'].get('name', 'road')}:")
        print(f"  Current speed: {traffic_flow['road'].get('speed')} km/h")
        print(f"  Speed limit: {traffic_flow['road'].get('speed_limit')} km/h")
        print(f"  Traffic density: {traffic_flow['road'].get('traffic_density')*100:.0f}%")
        print(f"  Congestion: {traffic_flow['road'].get('congestion', 'unknown')}")
    
    # Get traffic incidents
    incidents = await traffic_service.get_traffic_incidents(lat, lon)
    if incidents and incidents.get('count', 0) > 0:
        print(f"\nFound {incidents['count']} traffic incidents nearby:")
        for i, incident in enumerate(incidents['incidents'][:3], 1):
            print(f"{i}. {incident['type']} - {incident['description']}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example())
