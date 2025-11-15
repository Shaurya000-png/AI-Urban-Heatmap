from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.hotspot import Hotspot
from services.weather_service import WeatherService
from services.vegetation_service import VegetationService
from services.alternative_traffic_service import AlternativeTrafficService as TrafficService
import asyncio
import logging
from datetime import datetime

router = APIRouter(prefix="/api/integrated", tags=["integrated"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocationData(BaseModel):
    lat: float
    lon: float
    radius: int = 1000  # in meters

class IntegratedDataResponse(BaseModel):
    location: Dict
    weather: Optional[Dict]
    vegetation: Optional[Dict]
    traffic: Optional[Dict]
    timestamp: str
    status: str

@router.get("/location", response_model=IntegratedDataResponse)
async def get_integrated_data(
    lat: float, 
    lon: float, 
    radius: int = 1000,
    db: Session = Depends(get_db)
):
    """
    Get integrated data for a specific location including weather, vegetation, and traffic
    """
    # Initialize services
    weather_service = WeatherService()
    vegetation_service = VegetationService()
    traffic_service = TrafficService()
    
    # Gather all data concurrently
    weather_task = weather_service.get_current_weather(lat, lon)
    vegetation_task = vegetation_service.get_ndvi_data(lat, lon)
    traffic_task = traffic_service.get_traffic_flow(lat, lon, radius)
    
    # Execute all tasks in parallel
    weather, vegetation, traffic = await asyncio.gather(
        weather_task,
        vegetation_task,
        traffic_task,
        return_exceptions=True
    )
    
    # Handle any errors
    if isinstance(weather, Exception):
        logger.error(f"Error fetching weather data: {str(weather)}")
        weather = None
    
    if isinstance(vegetation, Exception):
        logger.error(f"Error fetching vegetation data: {str(vegetation)}")
        vegetation = None
    
    if isinstance(traffic, Exception):
        logger.error(f"Error fetching traffic data: {str(traffic)}")
        traffic = None
    
    # Prepare response
    response = {
        'location': {'lat': lat, 'lon': lon, 'radius': radius},
        'weather': weather,
        'vegetation': vegetation,
        'traffic': traffic,
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'success' if any([weather, vegetation, traffic]) else 'partial',
    }
    
    return response

@router.post("/hotspots/update")
async def update_hotspot_data(db: Session = Depends(get_db)):
    """
    Update hotspot data with real-time information
    This would be called periodically to keep the database up-to-date
    """
    try:
        # Get all unique locations from the database
        locations = db.query(
            Hotspot.latitude, 
            Hotspot.longitude,
            Hotspot.city
        ).distinct().all()
        
        weather_service = WeatherService()
        vegetation_service = VegetationService()
        traffic_service = TrafficService()
        
        updated_count = 0
        
        # Process each location (in a real app, this would be batched)
        for loc in locations[:10]:  # Limit to 10 for demo
            lat, lon, city = loc
            
            # Get updated data
            weather = await weather_service.get_current_weather(lat, lon)
            vegetation = await vegetation_service.get_ndvi_data(lat, lon)
            traffic = await traffic_service.get_traffic_flow(lat, lon)
            
            # Update the database (simplified example)
            if weather:
                db.query(Hotspot).filter(
                    Hotspot.latitude == lat,
                    Hotspot.longitude == lon
                ).update({
                    Hotspot.temperature: weather.get('temperature'),
                    Hotspot.vegetation_index: vegetation.get('vegetation_index') if vegetation else None,
                    Hotspot.traffic_density: traffic.get('road', {}).get('traffic_density') * 10 if traffic else None
                })
                updated_count += 1
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Updated {updated_count} hotspots",
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating hotspot data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add this router to your main FastAPI app
# from fastapi import FastAPI
# from routes import integrated_data
# app = FastAPI()
# app.include_router(integrated_data.router)
