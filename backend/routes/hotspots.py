from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from database import get_db
from models.hotspot import Hotspot

router = APIRouter(prefix="/api/hotspots", tags=["hotspots"])

class HotspotResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    temperature: float
    vegetation_index: Optional[float]
    traffic_density: Optional[int]
    land_use: Optional[str]
    city: str

    class Config:
        from_attributes = True

class HotspotStatsResponse(BaseModel):
    total_hotspots: int
    average_temperature: float
    max_temperature: float
    min_temperature: float
    cities_count: int
    hottest_cities: List[dict]

@router.get("/", response_model=List[HotspotResponse])
async def get_hotspots(
    city: Optional[str] = Query(None, description="Filter by city"),
    min_temperature: Optional[float] = Query(None, description="Minimum temperature filter"),
    max_temperature: Optional[float] = Query(None, description="Maximum temperature filter"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    query = db.query(Hotspot)

    if city:
        query = query.filter(Hotspot.city.ilike(f"%{city}%"))

    if min_temperature is not None:
        query = query.filter(Hotspot.temperature >= min_temperature)

    if max_temperature is not None:
        query = query.filter(Hotspot.temperature <= max_temperature)

    hotspots = query.order_by(desc(Hotspot.temperature)).limit(limit).all()
    return hotspots

@router.get("/city/{city_name}", response_model=List[HotspotResponse])
async def get_hotspots_by_city(
    city_name: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    hotspots = db.query(Hotspot).filter(
        Hotspot.city.ilike(f"%{city_name}%")
    ).order_by(desc(Hotspot.temperature)).limit(limit).all()

    if not hotspots:
        raise HTTPException(status_code=404, detail=f"No hotspots found for city: {city_name}")

    return hotspots

@router.get("/stats", response_model=HotspotStatsResponse)
async def get_hotspot_stats(db: Session = Depends(get_db)):
    total_hotspots = db.query(Hotspot).count()

    stats = db.query(
        func.avg(Hotspot.temperature).label('avg_temp'),
        func.max(Hotspot.temperature).label('max_temp'),
        func.min(Hotspot.temperature).label('min_temp')
    ).first()

    cities_count = db.query(Hotspot.city).distinct().count()

    hottest_cities = db.query(
        Hotspot.city,
        func.avg(Hotspot.temperature).label('avg_temp'),
        func.count(Hotspot.id).label('hotspot_count')
    ).group_by(Hotspot.city).order_by(desc('avg_temp')).limit(5).all()

    return HotspotStatsResponse(
        total_hotspots=total_hotspots,
        average_temperature=round(float(stats.avg_temp), 2) if stats.avg_temp else 0.0,
        max_temperature=round(float(stats.max_temp), 2) if stats.max_temp else 0.0,
        min_temperature=round(float(stats.min_temp), 2) if stats.min_temp else 0.0,
        cities_count=cities_count,
        hottest_cities=[
            {"city": city[0], "average_temperature": round(float(city[1]), 2), "hotspot_count": city[2]}
            for city in hottest_cities
        ]
    )

@router.post("/", response_model=HotspotResponse)
async def create_hotspot(hotspot: dict, db: Session = Depends(get_db)):
    try:
        db_hotspot = Hotspot(**hotspot)
        db.add(db_hotspot)
        db.commit()
        db.refresh(db_hotspot)
        return db_hotspot
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))