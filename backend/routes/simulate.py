from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from database import get_db
from models.ml_model import HeatPredictionModel
from models.simulation import SimulationLog
from services.impact_calculator import ImpactCalculator

router = APIRouter(prefix="/api", tags=["simulation"])

class SimulationRequest(BaseModel):
    base_temperature: float
    tree_cover_percentage: float
    solar_roof_percentage: float
    city_area_km2: Optional[float] = 100.0  # Default city area
    population: Optional[int] = 1_000_000  # Default population

class SimulationResponse(BaseModel):
    adjusted_temperature: float
    temperature_change: float
    tree_cover_percentage: float
    solar_roof_percentage: float
    recommendations: List[str]
    carbon_impact: Optional[Dict[str, Any]] = None
    cost_benefit: Optional[Dict[str, Any]] = None
    future_predictions: Optional[List[Dict[str, Any]]] = None
    gamification: Optional[Dict[str, Any]] = None

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_temperature(
    request: SimulationRequest,
    db: Session = Depends(get_db)
):
    try:
        if not (0 <= request.tree_cover_percentage <= 100):
            raise HTTPException(status_code=400, detail="Tree cover percentage must be between 0 and 100")

        if not (0 <= request.solar_roof_percentage <= 100):
            raise HTTPException(status_code=400, detail="Solar roof percentage must be between 0 and 100")

        model = HeatPredictionModel()
        temperature_change = model.calculate_temperature_impact(
            request.tree_cover_percentage,
            request.solar_roof_percentage
        )

        adjusted_temperature = request.base_temperature + temperature_change

        recommendations = _generate_recommendations(
            request.tree_cover_percentage,
            request.solar_roof_percentage,
            temperature_change
        )

        # Initialize impact data dictionary
        impact_data = {}
        
        # Calculate carbon impact
        carbon_impact = ImpactCalculator.calculate_carbon_impact(
            city_area_km2=request.city_area_km2,
            tree_cover_percentage=request.tree_cover_percentage,
            solar_roof_percentage=request.solar_roof_percentage,
            temperature_reduction=abs(temperature_change)
        )
        impact_data['carbon_impact'] = carbon_impact
        
        # Initialize future predictions list
        future_predictions = []
        
        # Generate future predictions
        predictions_without = ImpactCalculator.predict_future_temperature(
            current_temp=request.base_temperature,
            years_ahead=10,
            with_intervention=False
        )
        
        predictions_with = ImpactCalculator.predict_future_temperature(
            current_temp=request.base_temperature,
            years_ahead=10,
            with_intervention=True,
            intervention_reduction=abs(temperature_change)
        )
        
        future_predictions.append({
            "business_as_usual": predictions_without,
            "with_intervention": predictions_with
        })
        
        # Calculate gamification score
        gamification = ImpactCalculator.calculate_gamification_score(
            temperature_reduction=abs(temperature_change),
            co2_offset=impact_data.get('carbon_impact', {}).get("total_co2_offset_tons", 0),
            tree_cover=request.tree_cover_percentage,
            solar_coverage=request.solar_roof_percentage
        )

        simulation_log = SimulationLog(
            base_temperature=request.base_temperature,
            tree_cover_percentage=int(request.tree_cover_percentage),
            solar_roof_percentage=int(request.solar_roof_percentage),
            adjusted_temperature=adjusted_temperature,
            temperature_change=temperature_change
        )
        db.add(simulation_log)
        db.commit()

        return SimulationResponse(
            adjusted_temperature=round(adjusted_temperature, 2),
            temperature_change=round(temperature_change, 2),
            tree_cover_percentage=request.tree_cover_percentage,
            solar_roof_percentage=request.solar_roof_percentage,
            recommendations=recommendations,
            carbon_impact=impact_data.get('carbon_impact'),
            cost_benefit=impact_data.get('cost_benefit'),
            future_predictions=future_predictions,
            gamification=gamification
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

def _generate_recommendations(tree_cover: float, solar_roof: float, temp_change: float) -> List[str]:
    recommendations = []

    if temp_change > -0.5:
        recommendations.append("Consider increasing green infrastructure to achieve better cooling effects")
    elif temp_change < -2.0:
        recommendations.append("Excellent cooling strategy! This combination provides significant temperature reduction")

    if tree_cover < 20:
        recommendations.append("Increase tree cover to at least 30% for optimal urban cooling")
    elif tree_cover > 70:
        recommendations.append("Tree cover is high, consider diversifying with other vegetation types")

    if solar_roof < 15:
        recommendations.append("Add more solar panels to reduce heat absorption and generate renewable energy")
    elif solar_roof > 60:
        recommendations.append("Great solar coverage! Consider combining with green roofs for maximum benefit")

    if tree_cover > 40 and solar_roof > 40:
        recommendations.append("You've achieved an excellent balance of green infrastructure and renewable energy")

    if not recommendations:
        recommendations.append("Current green infrastructure strategy is providing moderate cooling benefits")

    return recommendations

@router.get("/simulation_impacts")
async def get_simulation_impacts():
    try:
        model = HeatPredictionModel()

        sample_scenarios = [
            {"tree_cover": 0, "solar_roof": 0},
            {"tree_cover": 25, "solar_roof": 25},
            {"tree_cover": 50, "solar_roof": 50},
            {"tree_cover": 75, "solar_roof": 75},
        ]

        impacts = []
        for scenario in sample_scenarios:
            temp_change = model.calculate_temperature_impact(
                scenario["tree_cover"],
                scenario["solar_roof"]
            )
            impacts.append({
                "tree_cover_percentage": scenario["tree_cover"],
                "solar_roof_percentage": scenario["solar_roof"],
                "temperature_change_celsius": round(temp_change, 2)
            })

        return {
            "impact_formula": {
                "tree_cover": "-0.15°C per 1% (with diminishing returns after 50%)",
                "solar_roof": "-0.08°C per 1% (with diminishing returns after 70%)",
                "combined_effect": "Diminishing returns when both exceed 40%"
            },
            "sample_scenarios": impacts
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get simulation impacts: {str(e)}")