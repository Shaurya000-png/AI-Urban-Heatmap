from typing import Dict, Any, Tuple
from models.ml_model import HeatPredictionModel
import numpy as np

class TemperaturePredictor:
    def __init__(self):
        self.model = HeatPredictionModel()

    def predict(self, input_data: Dict[str, Any]) -> Tuple[float, float]:
        """
        Predict temperature based on input parameters

        Args:
            input_data: Dictionary containing latitude, longitude, vegetation_index,
                       traffic_density, and land_use

        Returns:
            Tuple of (predicted_temperature, confidence_score)
        """
        try:
            return self.model.predict(input_data)
        except Exception as e:
            print(f"Prediction error: {e}")
            # Fallback to simple rule-based prediction
            return self._fallback_prediction(input_data)

    def _fallback_prediction(self, input_data: Dict[str, Any]) -> Tuple[float, float]:
        """Simple rule-based prediction when ML model fails"""
        base_temp = 30.0

        # Adjust based on factors
        vegetation = input_data.get('vegetation_index', 0.5)
        traffic = input_data.get('traffic_density', 5)
        land_use = input_data.get('land_use', 'residential')

        temp_adjustment = 0

        # Vegetation cooling effect
        temp_adjustment -= vegetation * 5

        # Traffic heating effect
        temp_adjustment += (traffic - 5) * 0.8

        # Land use effects
        land_use_effects = {
            'industrial': 4.0,
            'commercial': 2.0,
            'residential': 0.0,
            'park': -3.0,
            'water': -2.0
        }
        temp_adjustment += land_use_effects.get(land_use.lower(), 0)

        predicted_temp = base_temp + temp_adjustment
        predicted_temp = max(20, min(50, predicted_temp))

        confidence = 0.6  # Lower confidence for fallback

        return float(predicted_temp), float(confidence)

    def batch_predict(self, input_list: list) -> list:
        """Make predictions for multiple inputs"""
        results = []
        for input_data in input_list:
            try:
                temp, confidence = self.predict(input_data)
                results.append({
                    'input': input_data,
                    'predicted_temperature': temp,
                    'confidence_score': confidence
                })
            except Exception as e:
                results.append({
                    'input': input_data,
                    'error': str(e),
                    'predicted_temperature': None,
                    'confidence_score': 0
                })
        return results