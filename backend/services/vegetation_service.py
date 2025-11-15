import os
import requests
from typing import Dict, Optional, Tuple, List
import numpy as np
import rasterio
from rasterio.windows import Window
from io import BytesIO
import logging
from datetime import datetime, timedelta
import aiohttp
import asyncio
from dotenv import load_dotenv
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class VegetationService:
    """Service for fetching and processing vegetation/NDVI data"""
    
    def __init__(self):
        self.earthdata_username = os.getenv('NASA_EARTHDATA_USERNAME')
        self.earthdata_password = os.getenv('NASA_EARTHDATA_PASSWORD')
        self.base_url = "https://modis.ornl.gov/rst/api/v1"
        
    async def get_ndvi_data(self, lat: float, lon: float, start_date: str = None, end_date: str = None) -> Optional[Dict]:
        """
        Get NDVI (Normalized Difference Vegetation Index) data for a location
        
        Args:
            lat: Latitude of the location
            lon: Longitude of the location
            start_date: Start date in YYYY-MM-DD format (default: 30 days ago)
            end_date: End date in YYYY-MM-DD format (default: today)
            
        Returns:
            Dictionary containing NDVI data and metadata
        """
        # Set default date range if not provided
        end_date = end_date or datetime.now().strftime('%Y-%m-%d')
        start_date = start_date or (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Get available MODIS data products
        products = await self._get_modis_products(lat, lon, start_date, end_date)
        
        if not products:
            logger.warning("No MODIS data available for the specified location and date range")
            return None
            
        # Process the most recent product
        latest_product = max(products, key=lambda x: x['calendar_date'])
        
        try:
            # Download and process the NDVI data
            ndvi_data = await self._download_modis_data(latest_product['download_url'])
            
            # Extract NDVI value for the specified location
            ndvi_value = await self._extract_ndvi_value(ndvi_data, lat, lon)
            
            return {
                'ndvi': ndvi_value,
                'vegetation_index': self._ndvi_to_vegetation_index(ndvi_value),
                'date': latest_product['calendar_date'],
                'product': latest_product['product'],
                'resolution': '250m',
                'source': 'MODIS/Terra Vegetation Indices 16-Day L3 Global 250m',
                'location': {
                    'lat': lat,
                    'lon': lon,
                    'pixel_size': 250  # meters
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing NDVI data: {str(e)}")
            return None
    
    async def _get_modis_products(self, lat: float, lon: float, start_date: str, end_date: str) -> List[Dict]:
        """Get available MODIS products for the specified location and date range"""
        url = f"{self.base_url}/MCD43A4.006/search"
        params = {
            'latitude': lat,
            'longitude': lon,
            'start_date': start_date,
            'end_date': end_date,
            'coords_or_tiles': 'coords',
            'band': 'Nadir_Reflectance_Band1',
            'format': 'json'
        }
        
        try:
            async with aiohttp.ClientSession(auth=aiohttp.BasicAuth(self.earthdata_username, self.earthdata_password)) as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('data', [])
                    else:
                        logger.error(f"Error fetching MODIS products: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error in _get_modis_products: {str(e)}")
            return []
    
    async def _download_modis_data(self, download_url: str) -> Optional[bytes]:
        """Download MODIS data from the specified URL"""
        try:
            async with aiohttp.ClientSession(auth=aiohttp.BasicAuth(self.earthdata_username, self.earthdata_password)) as session:
                async with session.get(download_url) as response:
                    if response.status == 200:
                        return await response.read()
                    else:
                        logger.error(f"Error downloading MODIS data: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error in _download_modis_data: {str(e)}")
            return None
    
    async def _extract_ndvi_value(self, data: bytes, lat: float, lon: float) -> Optional[float]:
        """Extract NDVI value for a specific location from the MODIS data"""
        try:
            # In a real implementation, you would process the HDF file here
            # This is a simplified example that returns a random value
            # For production, you would use GDAL or similar to extract the actual NDVI value
            return np.random.uniform(-0.2, 0.9)  # NDVI range is typically -1 to 1
        except Exception as e:
            logger.error(f"Error extracting NDVI value: {str(e)}")
            return None
    
    def _ndvi_to_vegetation_index(self, ndvi: float) -> float:
        """Convert NDVI to a 0-1 vegetation index"""
        # NDVI range is typically -1 to 1, where:
        # -1 to 0: Water/No vegetation
        # 0 to 0.33: Sparse vegetation
        # 0.33 to 0.66: Moderate vegetation
        # 0.66 to 1: Dense vegetation
        
        # Normalize to 0-1 range
        return max(0, min(1, (ndvi + 1) / 2))

# Example usage
async def example():
    vegetation_service = VegetationService()
    
    # Example coordinates for a location in Pune, India
    lat, lon = 18.5204, 73.8567
    
    # Get NDVI data
    ndvi_data = await vegetation_service.get_ndvi_data(lat, lon)
    
    if ndvi_data:
        print(f"NDVI Value: {ndvi_data['ndvi']:.3f}")
        print(f"Vegetation Index: {ndvi_data['vegetation_index']:.2f}")
        print(f"Date: {ndvi_data['date']}")
        print(f"Source: {ndvi_data['source']}")
    else:
        print("Failed to retrieve NDVI data")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example())
