from sqlalchemy import Column, Integer, Float, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class SimulationLog(Base):
    __tablename__ = "simulation_logs"

    id = Column(Integer, primary_key=True, index=True)
    base_temperature = Column(Float(5), nullable=False)
    tree_cover_percentage = Column(Integer, nullable=False)
    solar_roof_percentage = Column(Integer, nullable=False)
    adjusted_temperature = Column(Float(5), nullable=False)
    temperature_change = Column(Float(5), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())