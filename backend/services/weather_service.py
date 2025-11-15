import os
import requests
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
import aiohttp
import asyncio
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class WeatherService:
    """Service for fetching weather data from OpenWeatherMap API"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    async def get_current_weather(self, lat: float, lon: float) -> Optional[Dict]:
        """Get current weather for a location"""
        url = f"{self.base_url}/weather?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_weather_data(data)
                    else:
                        logger.error(f"Error fetching weather data: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error in get_current_weather: {str(e)}")
            return None
    
    async def get_forecast(self, lat: float, lon: float) -> Optional[Dict]:
        """Get 5-day weather forecast for a location"""
        url = f"{self.base_url}/forecast?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_forecast_data(data)
                    else:
                        logger.error(f"Error fetching forecast data: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error in get_forecast: {str(e)}")
            return None
    
    def _process_weather_data(self, data: Dict) -> Dict:
        """Process raw weather data into a standardized format"""
        return {
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'temp_min': data['main']['temp_min'],
            'temp_max': data['main']['temp_max'],
            'pressure': data['main']['pressure'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind'].get('speed', 0),
            'wind_deg': data['wind'].get('deg', 0),
            'clouds': data['clouds'].get('all', 0),
            'weather': data['weather'][0]['main'],
            'weather_description': data['weather'][0]['description'],
            'icon': data['weather'][0]['icon'],
            'timestamp': datetime.utcfromtimestamp(data['dt']).isoformat(),
            'sunrise': datetime.utcfromtimestamp(data['sys']['sunrise']).isoformat(),
            'sunset': datetime.utcfromtimestamp(data['sys']['sunset']).isoformat(),
            'location': {
                'lat': data['coord']['lat'],
                'lon': data['coord']['lon'],
                'city': data.get('name', ''),
                'country': data['sys'].get('country', '')
            }
        }
    
    def _process_forecast_data(self, data: Dict) -> Dict:
        """Process forecast data into a standardized format"""
        forecasts = []
        for item in data['list']:
            forecasts.append({
                'timestamp': datetime.utcfromtimestamp(item['dt']).isoformat(),
                'temperature': item['main']['temp'],
                'feels_like': item['main']['feels_like'],
                'temp_min': item['main']['temp_min'],
                'temp_max': item['main']['temp_max'],
                'pressure': item['main']['pressure'],
                'humidity': item['main']['humidity'],
                'weather': item['weather'][0]['main'],
                'weather_description': item['weather'][0]['description'],
                'icon': item['weather'][0]['icon'],
                'wind_speed': item['wind'].get('speed', 0),
                'wind_deg': item['wind'].get('deg', 0),
                'clouds': item['clouds'].get('all', 0),
                'pop': item.get('pop', 0),  # probability of precipitation
                'rain': item.get('rain', {}).get('3h', 0) if 'rain' in item else 0,
                'snow': item.get('snow', {}).get('3h', 0) if 'snow' in item else 0
            })
        
        return {
            'city': {
                'id': data['city']['id'],
                'name': data['city']['name'],
                'country': data['city']['country'],
                'coord': data['city']['coord']
            },
            'forecasts': forecasts
        }

# Example usage
async def example():
    weather_service = WeatherService()
    
    # Example coordinates for Pune, India
    pune_lat, pune_lon = 18.5204, 73.8567
    
    # Get current weather
    current_weather = await weather_service.get_current_weather(pune_lat, pune_lon)
    print("Current Weather in Pune:")
    print(f"Temperature: {current_weather['temperature']}°C")
    print(f"Weather: {current_weather['weather']} - {current_weather['weather_description']}")
    
    # Get forecast
    forecast = await weather_service.get_forecast(pune_lat, pune_lon)
    print("\nForecast for the next 5 days:")
    for day in forecast['forecasts']:
        print(f"{day['timestamp']}: {day['temperature']}°C - {day['weather']}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example())
