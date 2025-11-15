import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from typing import Dict, Any, Tuple
import os

class HeatPredictionModel:
    def __init__(self, model_path: str = "models/heat_predictor.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_columns = ['latitude', 'longitude', 'vegetation_index', 'traffic_density', 'land_use_encoded']
        self.land_use_mapping = {
            'residential': 1,
            'commercial': 2,
            'industrial': 3,
            'park': 4,
            'water': 5
        }
        self.model_version = "1.0"
        self._load_or_create_model()

    def _load_or_create_model(self):
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.model = model_data['model']
                    self.model_version = model_data.get('version', '1.0')
                    print(f"Loaded existing model version {self.model_version}")
            else:
                self.model = RandomForestRegressor(n_estimators=100, random_state=42)
                self.model_version = "1.0"
                print("Created new RandomForest model")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model_version = "1.0"

    def encode_land_use(self, land_use: str) -> int:
        return self.land_use_mapping.get(land_use.lower(), 1)

    def prepare_features(self, input_data: Dict[str, Any]) -> np.ndarray:
        features = []
        features.append(input_data['latitude'])
        features.append(input_data['longitude'])
        features.append(input_data.get('vegetation_index', 0.5))
        features.append(input_data.get('traffic_density', 5))
        features.append(self.encode_land_use(input_data.get('land_use', 'residential')))
        return np.array(features).reshape(1, -1)

    def predict(self, input_data: Dict[str, Any]) -> Tuple[float, float]:
        features = self.prepare_features(input_data)

        try:
            predicted_temp = self.model.predict(features)[0]

            if hasattr(self.model, 'estimators_'):
                tree_predictions = [tree.predict(features)[0] for tree in self.model.estimators_]
                confidence = 1.0 - (np.std(tree_predictions) / np.mean(tree_predictions))
                confidence = max(0.0, min(1.0, confidence))
            else:
                confidence = 0.7

            return float(predicted_temp), float(confidence)
        except Exception as e:
            print(f"Prediction error: {e}")
            return 28.0, 0.5

    def train(self, training_data: pd.DataFrame) -> Dict[str, float]:
        training_data['land_use_encoded'] = training_data['land_use'].map(self.land_use_mapping).fillna(1)

        X = training_data[self.feature_columns]
        y = training_data['temperature']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        self.save_model()

        return {
            'mae': mae,
            'r2_score': r2,
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }

    def save_model(self):
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        model_data = {
            'model': self.model,
            'version': self.model_version,
            'feature_columns': self.feature_columns,
            'land_use_mapping': self.land_use_mapping
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model and hasattr(self.model, 'feature_importances_'):
            return dict(zip(self.feature_columns, self.model.feature_importances_))
        return {}

    @staticmethod
    def calculate_temperature_impact(tree_cover_percentage: float, solar_roof_percentage: float) -> float:
        tree_impact = -0.15 * tree_cover_percentage
        if tree_cover_percentage > 50:
            tree_impact *= 0.8

        solar_impact = -0.08 * solar_roof_percentage
        if solar_roof_percentage > 70:
            solar_impact *= 0.9

        if tree_cover_percentage > 40 and solar_roof_percentage > 40:
            combined_factor = 0.85
            total_impact = (tree_impact + solar_impact) * combined_factor
        else:
            total_impact = tree_impact + solar_impact

        return total_impact