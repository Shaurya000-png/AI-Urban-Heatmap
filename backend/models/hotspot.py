from sqlalchemy import Column, Integer, Float, String, TIMESTAMP, Index, JSON
from sqlalchemy.sql import func
from database import Base

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float(10), nullable=False)
    longitude = Column(Float(11), nullable=False)
    temperature = Column(Float(5), nullable=False)
    vegetation_index = Column(Float(5))
    traffic_density = Column(Integer)
    land_use = Column(String(50))
    city = Column(String(100), nullable=False)
    zone_name = Column(String(100))
    zone_analysis_json = Column(JSON)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_hotspots_location', 'latitude', 'longitude'),
        Index('idx_hotspots_city', 'city'),
    )