from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any, Optional
from geopy.geocoders import Nominatim
import ee
import numpy as np
from database import get_db
from models.hotspot import Hotspot
from models.ml_model import HeatPredictionModel

router = APIRouter(prefix="/api/city", tags=["city"])

# Initialize Earth Engine (run this once at startup)
try:
    ee.Initialize()
except Exception as e:
    try:
        ee.Authenticate()
        ee.Initialize(project='hello-world-458214')
    except:
        print("Warning: Earth Engine initialization failed. City search may have limited functionality.")

class CitySearchResponse(BaseModel):
    city: str
    latitude: float
    longitude: float
    mean_temperature: Optional[float]
    data_available: bool
    hotspots_generated: int
    hotspots: List[Dict[str, Any]] = []
    statistics: Dict[str, Any]
    hottest_areas: List[Dict[str, Any]]
    recommendations: List[str]

class HotspotData(BaseModel):
    id: int
    latitude: float
    longitude: float
    temperature: float
    vegetation_index: Optional[float]
    traffic_density: Optional[int]
    land_use: Optional[str]
    city: str
    zone_analysis: Dict[str, str]

    class Config:
        from_attributes = True

def get_zone_analysis(zone_name: str, land_use: str, temperature: float, 
                      vegetation: float, traffic: int) -> Dict[str, str]:
    """Generate detailed analysis for each zone"""
    
    analyses = {
        "commercial": {
            "description": "High-density commercial area with significant urban development",
            "heat_factors": [
                "Dense concrete and asphalt surfaces absorbing solar radiation",
                "Limited green cover and vegetation",
                "High traffic density contributing to heat emissions",
                "Tall buildings creating heat canyons",
                "Air conditioning units releasing waste heat"
            ],
            "recommendations": [
                "Install green roofs on commercial buildings",
                "Create vertical gardens on building facades",
                "Plant street trees for shade",
                "Use cool pavement materials",
                "Implement urban cooling stations"
            ]
        },
        "industrial": {
            "description": "Industrial zone with manufacturing and processing facilities",
            "heat_factors": [
                "Industrial processes generating significant heat",
                "Large metal and concrete structures",
                "Minimal vegetation coverage",
                "Heavy vehicle traffic",
                "Waste heat from machinery and equipment"
            ],
            "recommendations": [
                "Install solar panels to reduce heat absorption",
                "Create buffer green zones around facilities",
                "Implement heat recovery systems",
                "Use reflective roofing materials",
                "Establish industrial parks with green spaces"
            ]
        },
        "residential": {
            "description": "Residential neighborhood with mixed housing density",
            "heat_factors": [
                "Moderate building density",
                "Residential heating and cooling systems",
                "Paved roads and driveways",
                "Variable vegetation coverage",
                "Local traffic patterns"
            ],
            "recommendations": [
                "Encourage community gardens and tree planting",
                "Promote energy-efficient home cooling",
                "Create neighborhood parks",
                "Install permeable pavements",
                "Develop green corridors between blocks"
            ]
        },
        "park": {
            "description": "Green space providing natural cooling and recreation",
            "heat_factors": [
                "High vegetation coverage (cooling effect)",
                "Natural evapotranspiration",
                "Minimal impervious surfaces",
                "Tree canopy providing shade",
                "Water features if present"
            ],
            "recommendations": [
                "Maintain and expand existing green cover",
                "Add water features for evaporative cooling",
                "Plant diverse native species",
                "Create shaded walking paths",
                "Preserve as urban cooling islands"
            ]
        }
    }
    
    base_analysis = analyses.get(land_use, analyses["residential"])
    
    # Add temperature-specific insights
    temp_insight = ""
    if temperature > 40:
        temp_insight = "⚠️ CRITICAL: Extreme heat detected. Immediate intervention required."
    elif temperature > 35:
        temp_insight = "🔥 HIGH: Elevated temperatures pose health risks during peak hours."
    elif temperature > 30:
        temp_insight = "⚡ MODERATE: Comfortable but could benefit from cooling measures."
    else:
        temp_insight = "✅ OPTIMAL: Temperature within comfortable range."
    
    # Vegetation insight
    veg_insight = ""
    if vegetation < 0.3:
        veg_insight = "🌱 Low vegetation coverage - priority area for greening initiatives."
    elif vegetation < 0.5:
        veg_insight = "🌿 Moderate vegetation - opportunity to enhance green infrastructure."
    else:
        veg_insight = "🌳 Good vegetation coverage - maintain and protect existing greenery."
    
    # Traffic insight
    traffic_insight = ""
    if traffic > 7:
        traffic_insight = "🚗 Heavy traffic contributing significantly to urban heat island effect."
    elif traffic > 5:
        traffic_insight = "🚙 Moderate traffic - consider promoting public transportation."
    else:
        traffic_insight = "🚶 Low traffic area - good for pedestrian-friendly development."
    
    return {
        "zone_name": zone_name,
        "description": base_analysis["description"],
        "temperature_status": temp_insight,
        "vegetation_status": veg_insight,
        "traffic_status": traffic_insight,
        "heat_factors": base_analysis["heat_factors"],
        "recommendations": base_analysis["recommendations"]
    }

def generate_city_hotspots(city_name: str, center_lat: float, center_lng: float, 
                          base_temp: float, num_points: int = 100, db: Session = None) -> List[Dict[str, Any]]:
    """
    Generate realistic hotspot data for any city based on its coordinates
    """
    hotspots = []
    
    # Define typical urban zones with varying characteristics
    urban_zones = [
        {
            "name": "City Center",
            "offset": (0, 0),
            "radius": 0.02,
            "temp_modifier": 2.5,
            "vegetation": 0.3,
            "traffic": 8,
            "land_use": "commercial"
        },
        {
            "name": "Residential North",
            "offset": (0.03, 0),
            "radius": 0.04,
            "temp_modifier": 0.5,
            "vegetation": 0.5,
            "traffic": 5,
            "land_use": "residential"
        },
        {
            "name": "Residential South",
            "offset": (-0.03, 0),
            "radius": 0.04,
            "temp_modifier": 0.5,
            "vegetation": 0.5,
            "traffic": 5,
            "land_use": "residential"
        },
        {
            "name": "Industrial Area",
            "offset": (0, 0.04),
            "radius": 0.03,
            "temp_modifier": 4.0,
            "vegetation": 0.2,
            "traffic": 7,
            "land_use": "industrial"
        },
        {
            "name": "Green Space",
            "offset": (0, -0.03),
            "radius": 0.025,
            "temp_modifier": -3.0,
            "vegetation": 0.8,
            "traffic": 2,
            "land_use": "park"
        },
        {
            "name": "Suburban East",
            "offset": (0.02, 0.03),
            "radius": 0.035,
            "temp_modifier": 1.0,
            "vegetation": 0.4,
            "traffic": 4,
            "land_use": "residential"
        },
        {
            "name": "Suburban West",
            "offset": (-0.02, -0.03),
            "radius": 0.035,
            "temp_modifier": 1.0,
            "vegetation": 0.4,
            "traffic": 4,
            "land_use": "residential"
        }
    ]
    
    points_per_zone = num_points // len(urban_zones)
    
    for zone in urban_zones:
        for i in range(points_per_zone):
            # Generate random coordinates within zone radius
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, zone["radius"])
            
            lat = center_lat + zone["offset"][0] + distance * np.cos(angle)
            lng = center_lng + zone["offset"][1] + distance * np.sin(angle)
            
            # Calculate temperature with variation
            temp_variation = np.random.normal(0, 1.5)
            temp = max(20, min(50, base_temp + zone["temp_modifier"] + temp_variation))
            
            # Add variation to other characteristics
            vegetation = max(0, min(1, zone["vegetation"] + np.random.normal(0, 0.15)))
            traffic = max(1, min(10, zone["traffic"] + np.random.randint(-2, 3)))
            
            # Generate zone analysis
            zone_analysis = get_zone_analysis(
                zone["name"], 
                zone["land_use"], 
                temp, 
                vegetation, 
                traffic
            )
            
            hotspots.append({
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "temperature": round(temp, 2),
                "vegetation_index": round(vegetation, 3),
                "traffic_density": traffic,
                "land_use": zone["land_use"],
                "city": city_name,
                "zone_name": zone["name"],
                "zone_analysis": zone_analysis
            })
    
    # Add some random scattered points
    remaining_points = num_points - len(hotspots)
    for i in range(remaining_points):
        lat = center_lat + np.random.uniform(-0.05, 0.05)
        lng = center_lng + np.random.uniform(-0.05, 0.05)
        
        temp = np.random.uniform(base_temp - 5, base_temp + 5)
        vegetation = np.random.uniform(0.1, 0.8)
        traffic = np.random.randint(1, 10)
        land_use = np.random.choice(["residential", "commercial", "industrial"], p=[0.5, 0.3, 0.2])
        
        # Generate zone analysis for scattered points
        zone_analysis = get_zone_analysis(
            "Mixed Urban Area", 
            land_use, 
            temp, 
            vegetation, 
            traffic
        )
        
        hotspots.append({
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "temperature": round(temp, 2),
            "vegetation_index": round(vegetation, 3),
            "traffic_density": traffic,
            "land_use": land_use,
            "city": city_name,
            "zone_name": "Mixed Urban Area",
            "zone_analysis": zone_analysis
        })
    
    return hotspots

def calculate_statistics(hotspots: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate comprehensive statistics for hotspots"""
    if not hotspots:
        return {
            "total_hotspots": 0,
            "average_temperature": 0.0,
            "max_temperature": 0.0,
            "min_temperature": 0.0,
            "average_vegetation": 0.0,
            "average_traffic": 0.0
        }
    
    temps = [h["temperature"] for h in hotspots]
    veg = [h["vegetation_index"] for h in hotspots]
    traffic = [h["traffic_density"] for h in hotspots]
    
    return {
        "total_hotspots": len(hotspots),
        "average_temperature": round(np.mean(temps), 2),
        "max_temperature": round(np.max(temps), 2),
        "min_temperature": round(np.min(temps), 2),
        "average_vegetation": round(np.mean(veg), 3),
        "average_traffic": round(np.mean(traffic), 1),
        "temperature_std": round(np.std(temps), 2)
    }

def identify_hottest_areas(hotspots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Identify and rank the hottest areas"""
    land_use_temps = {}
    
    for hotspot in hotspots:
        land_use = hotspot["land_use"]
        if land_use not in land_use_temps:
            land_use_temps[land_use] = []
        land_use_temps[land_use].append(hotspot["temperature"])
    
    hottest_areas = []
    for land_use, temps in land_use_temps.items():
        hottest_areas.append({
            "area_type": land_use.capitalize(),
            "average_temperature": round(np.mean(temps), 2),
            "max_temperature": round(np.max(temps), 2),
            "hotspot_count": len(temps)
        })
    
    # Sort by average temperature descending
    hottest_areas.sort(key=lambda x: x["average_temperature"], reverse=True)
    return hottest_areas

def generate_recommendations(statistics: Dict[str, Any], hottest_areas: List[Dict[str, Any]]) -> List[str]:
    """Generate sustainability recommendations based on city data"""
    recommendations = []
    
    avg_temp = statistics.get("average_temperature", 0)
    avg_veg = statistics.get("average_vegetation", 0)
    avg_traffic = statistics.get("average_traffic", 0)
    
    # Temperature-based recommendations
    if avg_temp > 38:
        recommendations.append(
            f"⚠️ High average temperature ({avg_temp}°C) detected. Urgent action needed to implement cooling strategies."
        )
    elif avg_temp > 35:
        recommendations.append(
            f"🌡️ Elevated temperatures ({avg_temp}°C) observed. Consider increasing urban green infrastructure."
        )
    else:
        recommendations.append(
            f"✅ Temperature levels ({avg_temp}°C) are moderate. Maintain current green infrastructure."
        )
    
    # Vegetation recommendations
    if avg_veg < 0.3:
        recommendations.append(
            "🌳 Low vegetation coverage detected. Increase tree planting by at least 20% to improve cooling."
        )
    elif avg_veg < 0.5:
        recommendations.append(
            "🌱 Moderate vegetation coverage. Aim for 50%+ green cover for optimal urban cooling."
        )
    else:
        recommendations.append(
            "🌿 Good vegetation coverage! Continue maintaining and expanding green spaces."
        )
    
    # Traffic recommendations
    if avg_traffic > 7:
        recommendations.append(
            "🚗 High traffic density contributes to heat. Promote public transportation and cycling infrastructure."
        )
    elif avg_traffic > 5:
        recommendations.append(
            "🚌 Moderate traffic levels. Consider implementing traffic management systems."
        )
    
    # Area-specific recommendations
    if hottest_areas:
        hottest = hottest_areas[0]
        if hottest["average_temperature"] > 40:
            recommendations.append(
                f"🔥 {hottest['area_type']} areas are critically hot ({hottest['average_temperature']}°C). "
                f"Priority intervention needed with green roofs and reflective surfaces."
            )
    
    # General sustainability recommendations
    recommendations.append(
        "💡 Implement solar panels on rooftops to reduce heat absorption and generate renewable energy."
    )
    
    if statistics.get("temperature_std", 0) > 3:
        recommendations.append(
            "📊 High temperature variation detected. Focus cooling efforts on the hottest zones first."
        )
    
    return recommendations

@router.get("/search/", response_model=CitySearchResponse)
async def search_city(
    city_name: str = Query(..., description="Name of the city to search"),
    generate_data: bool = Query(True, description="Generate hotspot data for the city"),
    num_hotspots: int = Query(100, ge=50, le=500, description="Number of hotspots to generate"),
    db: Session = Depends(get_db)
):
    """
    Search for a city and provide comprehensive analysis including:
    - Basic city information (coordinates, temperature)
    - Generated hotspot data
    - Statistical analysis
    - Hottest areas identification
    - Sustainability recommendations
    """
    try:
        # Get city coordinates using geocoding
        geolocator = Nominatim(user_agent="sustainable_ai_v2")
        location = geolocator.geocode(city_name)
        
        if not location:
            raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
        
        # Try to get temperature from Earth Engine
        mean_temp = None
        try:
            point = ee.Geometry.Point(location.longitude, location.latitude)
            dataset = ee.ImageCollection('MODIS/006/MOD11A1') \
                        .filterDate('2023-01-01', '2023-12-31') \
                        .select('LST_Day_1km') \
                        .filterBounds(point)
            
            mean_temp_data = dataset.mean().reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=1000
            ).getInfo()
            
            if mean_temp_data.get('LST_Day_1km') is not None:
                # Convert from Kelvin to Celsius
                mean_temp = round(mean_temp_data.get('LST_Day_1km') * 0.02 - 273.15, 2)
        except Exception as ee_error:
            print(f"Earth Engine error: {ee_error}")
            # Use a reasonable default based on latitude
            mean_temp = 25 + (5 * (1 - abs(location.latitude) / 90))
        
        # Use mean_temp or default
        base_temp = mean_temp if mean_temp and 15 <= mean_temp <= 50 else 30.0
        
        # Check if city already has data in database
        existing_hotspots = db.query(Hotspot).filter(
            Hotspot.city.ilike(f"%{city_name}%")
        ).all()
        
        hotspots_data = []
        hotspots_generated = 0
        
        if existing_hotspots and len(existing_hotspots) >= 20:
            # Use existing data
            hotspots_data = [
                {
                    "latitude": h.latitude,
                    "longitude": h.longitude,
                    "temperature": h.temperature,
                    "vegetation_index": h.vegetation_index,
                    "traffic_density": h.traffic_density,
                    "land_use": h.land_use,
                    "city": h.city,
                    "zone_name": h.zone_name,
                    "zone_analysis": h.zone_analysis_json if h.zone_analysis_json else {}
                }
                for h in existing_hotspots
            ]
            hotspots_generated = len(hotspots_data)
        elif generate_data:
            # Generate new hotspot data
            hotspots_data = generate_city_hotspots(
                city_name=location.address.split(',')[0],
                center_lat=location.latitude,
                center_lng=location.longitude,
                base_temp=base_temp,
                num_points=num_hotspots
            )
            hotspots_generated = len(hotspots_data)
            
            # Save generated hotspots to database
            try:
                for hotspot_dict in hotspots_data:
                    # Extract zone_analysis for JSON storage
                    zone_analysis = hotspot_dict.pop('zone_analysis', {})
                    hotspot_dict['zone_analysis_json'] = zone_analysis
                    
                    hotspot = Hotspot(**hotspot_dict)
                    db.add(hotspot)
                db.commit()
            except Exception as db_error:
                db.rollback()
                print(f"Database error: {db_error}")
                # Continue even if database save fails
        
        # Calculate comprehensive statistics
        statistics = calculate_statistics(hotspots_data)
        
        # Identify hottest areas
        hottest_areas = identify_hottest_areas(hotspots_data)
        
        # Generate recommendations
        recommendations = generate_recommendations(statistics, hottest_areas)
        
        return CitySearchResponse(
            city=location.address,
            latitude=location.latitude,
            longitude=location.longitude,
            mean_temperature=base_temp,
            data_available=True,
            hotspots_generated=hotspots_generated,
            hotspots=hotspots_data,  # Include hotspots in response
            statistics=statistics,
            hottest_areas=hottest_areas[:5],  # Top 5 hottest areas
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to search city: {str(e)}"
        )

@router.get("/hotspots/{city_name}", response_model=List[HotspotData])
async def get_city_hotspots(
    city_name: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get all hotspots for a specific city
    """
    hotspots = db.query(Hotspot).filter(
        Hotspot.city.ilike(f"%{city_name}%")
    ).order_by(desc(Hotspot.temperature)).limit(limit).all()
    
    if not hotspots:
        raise HTTPException(
            status_code=404, 
            detail=f"No hotspots found for city: {city_name}"
        )
    
    return hotspots

@router.delete("/hotspots/{city_name}")
async def delete_city_hotspots(
    city_name: str,
    db: Session = Depends(get_db)
):
    """
    Delete all hotspots for a specific city (useful for regenerating data)
    """
    try:
        deleted_count = db.query(Hotspot).filter(
            Hotspot.city.ilike(f"%{city_name}%")
        ).delete()
        db.commit()
        
        return {
            "message": f"Deleted {deleted_count} hotspots for city: {city_name}",
            "deleted_count": deleted_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete hotspots: {str(e)}"
        )
