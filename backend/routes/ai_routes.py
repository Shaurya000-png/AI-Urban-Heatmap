from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
import logging

# Import the AI service
from services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Services"])
logger = logging.getLogger(__name__)

class HeatRiskRequest(BaseModel):
    temperature: float
    humidity: float
    population_density: float
    vegetation_index: float

class MitigationRequest(BaseModel):
    city_data: Dict[str, Any]
    budget: float = 1000000

class PredictionRequest(BaseModel):
    current_data: Dict[str, Any]
    days_ahead: int = 7

@router.post("/heat-risk")
async def get_heat_risk(risk_request: HeatRiskRequest):
    """
    Get heat risk assessment based on environmental factors
    """
    try:
        return ai_service.predict_heat_risk(
            temperature=risk_request.temperature,
            humidity=risk_request.humidity,
            population_density=risk_request.population_density,
            vegetation_index=risk_request.vegetation_index
        )
    except Exception as e:
        logger.error(f"Error in heat risk prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mitigation-strategies")
async def get_mitigation_strategies(request: MitigationRequest):
    """
    Get AI-generated mitigation strategies for urban heat islands
    """
    try:
        return ai_service.generate_mitigation_strategies(
            city_data=request.city_data,
            budget=request.budget
        )
    except Exception as e:
        logger.error(f"Error generating mitigation strategies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-future")
async def predict_future_conditions(request: PredictionRequest):
    """
    Predict future environmental conditions
    """
    try:
        return ai_service.predict_future_conditions(
            current_data=request.current_data,
            days_ahead=request.days_ahead
        )
    except Exception as e:
        logger.error(f"Error in future prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the AI service
    """
    return {
        "status": "operational",
        "service": "ai-service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
