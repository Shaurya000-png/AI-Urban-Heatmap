from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models.ml_model import HeatPredictionModel
from models.prediction import PredictionLog

router = APIRouter(prefix="/api", tags=["prediction"])

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    vegetation_index: float = 0.5
    traffic_density: int = 5
    land_use: str = "residential"

class PredictionResponse(BaseModel):
    predicted_temperature: float
    confidence_score: float
    model_version: str
    input_data: Dict[str, Any]

@router.post("/predict_heat", response_model=PredictionResponse)
async def predict_temperature(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    try:
        model = HeatPredictionModel()

        input_data = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "vegetation_index": request.vegetation_index,
            "traffic_density": request.traffic_density,
            "land_use": request.land_use
        }

        predicted_temperature, confidence_score = model.predict(input_data)

        prediction_log = PredictionLog(
            latitude=request.latitude,
            longitude=request.longitude,
            input_data=input_data,
            predicted_temperature=predicted_temperature,
            model_version=model.model_version
        )
        db.add(prediction_log)
        db.commit()

        return PredictionResponse(
            predicted_temperature=round(predicted_temperature, 2),
            confidence_score=round(confidence_score, 3),
            model_version=model.model_version,
            input_data=input_data
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/model_info")
async def get_model_info():
    try:
        model = HeatPredictionModel()
        feature_importance = model.get_feature_importance()

        return {
            "model_version": model.model_version,
            "model_type": "RandomForestRegressor",
            "feature_columns": model.feature_columns,
            "feature_importance": feature_importance,
            "land_use_mapping": model.land_use_mapping
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")