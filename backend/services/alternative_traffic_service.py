import aiohttp
from typing import Dict, Optional
import logging
from datetime import datetime
from math import cos, radians, sqrt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlternativeTrafficService:
    """Service for fetching traffic data using OpenStreetMap's Overpass API"""
    
    def __init__(self):
        self.overpass_url = "https://overpass-api.de/api/interpreter"
    
    async def get_traffic_flow(self, lat: float, lon: float, radius: int = 1000) -> Optional[Dict]:
        """
        Get traffic flow data for a specific location using OpenStreetMap
        
        Args:
            lat: Latitude of the location
            lon: Longitude of the location
            radius: Search radius in meters (default: 1000m)
            
        Returns:
            Dictionary containing traffic flow data
        """
        # Convert radius from meters to approximate degrees
        radius_km = radius / 1000  # Convert to km
        bbox = self._get_bounding_box(lat, lon, radius_km)
        
        # Query for roads and traffic calming features
        query = f"""
        [out:json];
        (
          way["highway"]({bbox});
          way["traffic_calming"]({bbox});
        );
        out body;
        >;
        out skel qt;
        """
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.overpass_url,
                    data={'data': query},
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    timeout=30
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_osm_data(data, lat, lon, radius)
                    else:
                        error = await response.text()
                        logger.error(f"Error from Overpass API: {response.status} - {error}")
                        return self._get_fallback_data(lat, lon)
        except Exception as e:
            logger.error(f"Error in get_traffic_flow: {str(e)}")
            return self._get_fallback_data(lat, lon)
    
    def _get_bounding_box(self, lat: float, lon: float, radius_km: float) -> str:
        """Calculate bounding box around a point"""
        # Approximate conversion from km to degrees (at the equator)
        delta_lat = radius_km / 111.32
        min_lat = lat - delta_lat
        max_lat = lat + delta_lat
        
        # Adjust longitude delta based on latitude
        delta_lon = delta_lat / abs(cos(radians(lat)))
        min_lon = lon - delta_lon
        max_lon = lon + delta_lon
        
        return f"{min_lat},{min_lon},{max_lat},{max_lon}"
    
    def _process_osm_data(self, data: Dict, lat: float, lon: float, radius: int) -> Dict:
        """Process OSM data into our format"""
        if 'elements' not in data or not data['elements']:
            return self._get_fallback_data(lat, lon)
        
        # Count different types of roads and calculate total length
        road_stats = {
            'motorway': {'count': 0, 'length': 0},
            'trunk': {'count': 0, 'length': 0},
            'primary': {'count': 0, 'length': 0},
            'secondary': {'count': 0, 'length': 0},
            'tertiary': {'count': 0, 'length': 0},
            'residential': {'count': 0, 'length': 0},
            'service': {'count': 0, 'length': 0},
            'other': {'count': 0, 'length': 0}
        }
        
        for element in data['elements']:
            if element['type'] == 'way' and 'tags' in element and 'highway' in element['tags']:
                road_type = element['tags']['highway']
                
                # Categorize the road type
                if road_type in ['motorway', 'motorway_link']:
                    category = 'motorway'
                elif road_type in ['trunk', 'trunk_link']:
                    category = 'trunk'
                elif road_type in ['primary', 'primary_link']:
                    category = 'primary'
                elif road_type in ['secondary', 'secondary_link']:
                    category = 'secondary'
                elif road_type in ['tertiary', 'tertiary_link']:
                    category = 'tertiary'
                elif road_type in ['residential', 'living_street']:
                    category = 'residential'
                elif road_type in ['service', 'track']:
                    category = 'service'
                else:
                    category = 'other'
                
                # Calculate way length if nodes are available
                length = self._calculate_way_length(element)
                
                # Update statistics
                road_stats[category]['count'] += 1
                road_stats[category]['length'] += length
        
        # Calculate traffic density (0-1 scale)
        density = self._calculate_density(road_stats, radius)
        
        # Prepare response
        return {
            'status': 'ok',
            'location': {'lat': lat, 'lon': lon, 'radius': radius},
            'road_stats': road_stats,
            'traffic_density': density,
            'congestion': self._get_congestion_level(density),
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'OpenStreetMap Overpass API'
        }
    
    def _calculate_way_length(self, way: Dict) -> float:
        """Calculate the length of a way in kilometers"""
        if 'geometry' not in way or len(way['geometry']) < 2:
            return 0.0
            
        length_km = 0.0
        prev_node = way['geometry'][0]
        
        for node in way['geometry'][1:]:
            # Calculate distance between consecutive points using Haversine formula
            lat1, lon1 = prev_node['lat'], prev_node['lon']
            lat2, lon2 = node['lat'], node['lon']
            
            # Haversine formula
            R = 6371  # Earth's radius in km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = (sin(dlat/2) * sin(dlat/2) + 
                 cos(radians(lat1)) * cos(radians(lat2)) * 
                 sin(dlon/2) * sin(dlon/2))
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            distance = R * c
            
            length_km += distance
            prev_node = node
            
        return length_km
    
    def _calculate_density(self, road_stats: Dict, radius: int) -> float:
        """Calculate traffic density based on road types and lengths"""
        # Weight factors for different road types
        weights = {
            'motorway': 0.9,
            'trunk': 0.8,
            'primary': 0.7,
            'secondary': 0.6,
            'tertiary': 0.5,
            'residential': 0.3,
            'service': 0.2,
            'other': 0.1
        }
        
        # Calculate weighted road density
        total_weighted_length = 0
        total_length = 0
        
        for category, stats in road_stats.items():
            total_weighted_length += stats['length'] * weights[category]
            total_length += stats['length']
        
        if total_length == 0:
            return 0.0
            
        # Normalize to 0-1 range
        area = 3.14159 * (radius/1000) ** 2  # Area in km²
        density = min(1.0, (total_weighted_length / area) / 10)  # Scaled down by factor of 10
        
        return round(density, 2)
    
    def _get_congestion_level(self, density: float) -> str:
        """Convert density to a human-readable congestion level"""
        if density < 0.2:
            return 'light'
        elif density < 0.4:
            return 'moderate'
        elif density < 0.7:
            return 'heavy'
        else:
            return 'severe'
    
    def _get_fallback_data(self, lat: float, lon: float) -> Dict:
        """Return fallback data when API request fails"""
        return {
            'status': 'fallback',
            'message': 'Using fallback traffic data',
            'location': {'lat': lat, 'lon': lon},
            'traffic_density': 0.3,  # Default medium density
            'congestion': 'moderate',
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'Fallback data'
        }

# Add missing math functions
from math import sin, atan2, sqrt

# Example usage
async def example():
    service = AlternativeTrafficService()
    
    # Example coordinates for Pune, India
    lat, lon = 18.5204, 73.8567
    
    # Get traffic data
    traffic_data = await service.get_traffic_flow(lat, lon)
    
    if traffic_data:
        print(f"Traffic density: {traffic_data['traffic_density']}")
        print(f"Congestion level: {traffic_data['congestion']}")
        print(f"Road types found: {traffic_data['road_stats'].keys()}")
    else:
        print("Failed to retrieve traffic data")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example())
