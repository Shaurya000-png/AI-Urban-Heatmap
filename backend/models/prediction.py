from sqlalchemy import Column, Integer, Float, String, TIMESTAMP, JSON
from sqlalchemy.sql import func
from database import Base

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float(10), nullable=False)
    longitude = Column(Float(11), nullable=False)
    input_data = Column(JSON, nullable=False)
    predicted_temperature = Column(Float(5), nullable=False)
    model_version = Column(String(20), default="1.0")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())