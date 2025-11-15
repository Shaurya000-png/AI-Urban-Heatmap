import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pandas as pd
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models.hotspot import Hotspot
from models.ml_model import HeatPredictionModel
import numpy as np
from typing import List, Dict, Any

def create_database():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def generate_realistic_pune_data(num_points: int = 500) -> List[Dict[str, Any]]:
    """Generate realistic hotspot data for Pune, India"""

    # Pune city center coordinates
    pune_center_lat, pune_center_lng = 18.5204, 73.8567

    # Define different areas of Pune with their characteristics
    pune_areas = [
        {
            "name": "Koregaon Park",
            "center": (18.5333, 73.8944),
            "radius": 0.03,
            "base_temp": 36.5,
            "vegetation": 0.6,
            "traffic": 6,
            "land_use": "commercial"
        },
        {
            "name": "Kothrud",
            "center": (18.5069, 73.8312),
            "radius": 0.04,
            "base_temp": 35.8,
            "vegetation": 0.5,
            "traffic": 5,
            "land_use": "residential"
        },
        {
            "name": "Hinjewadi",
            "center": (18.5900, 73.7400),
            "radius": 0.05,
            "base_temp": 39.2,
            "vegetation": 0.2,
            "traffic": 8,
            "land_use": "industrial"
        },
        {
            "name": "Camp Area",
            "center": (18.5167, 73.8567),
            "radius": 0.025,
            "base_temp": 37.8,
            "vegetation": 0.3,
            "traffic": 7,
            "land_use": "commercial"
        },
        {
            "name": "Shivajinagar",
            "center": (18.5315, 73.8446),
            "radius": 0.035,
            "base_temp": 38.1,
            "vegetation": 0.4,
            "traffic": 7,
            "land_use": "commercial"
        },
        {
            "name": "Aundh",
            "center": (18.5622, 73.8098),
            "radius": 0.04,
            "base_temp": 36.2,
            "vegetation": 0.5,
            "traffic": 5,
            "land_use": "residential"
        },
        {
            "name": "Kalyani Nagar",
            "center": (18.5433, 73.9036),
            "radius": 0.03,
            "base_temp": 37.1,
            "vegetation": 0.4,
            "traffic": 6,
            "land_use": "commercial"
        },
        {
            "name": "Viman Nagar",
            "center": (18.5669, 73.9093),
            "radius": 0.045,
            "base_temp": 36.8,
            "vegetation": 0.3,
            "traffic": 6,
            "land_use": "residential"
        }
    ]

    # Parks and green spaces (cooler spots)
    parks = [
        {"name": "Saras Baug", "center": (18.4964, 73.8617), "radius": 0.02},
        {"name": "Peshwe Park", "center": (18.5116, 73.8472), "radius": 0.015},
        {"name": "Empress Garden", "center": (18.4939, 73.9030), "radius": 0.025},
        {"name": "Kamala Nehru Park", "center": (18.5346, 73.8646), "radius": 0.018},
        {"name": "Rajiv Gandhi Zoo", "center": (18.4995, 73.8916), "radius": 0.03}
    ]

    hotspots = []

    # Generate hotspots for different areas
    points_per_area = num_points // (len(pune_areas) + len(parks))

    for area in pune_areas:
        for i in range(points_per_area):
            # Generate random coordinates within area radius
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, area["radius"])

            lat = area["center"][0] + distance * np.cos(angle)
            lng = area["center"][1] + distance * np.sin(angle)

            # Add some variation to base characteristics
            temp_variation = np.random.normal(0, 1.5)
            temp = max(25, min(45, area["base_temp"] + temp_variation))

            vegetation = max(0, min(1, area["vegetation"] + np.random.normal(0, 0.15)))
            traffic = max(1, min(10, area["traffic"] + np.random.randint(-2, 3)))

            hotspots.append({
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "temperature": round(temp, 2),
                "vegetation_index": round(vegetation, 3),
                "traffic_density": traffic,
                "land_use": area["land_use"],
                "city": "Pune"
            })

    # Generate park hotspots (cooler, greener)
    for park in parks:
        for i in range(points_per_area // 2):
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, park["radius"])

            lat = park["center"][0] + distance * np.cos(angle)
            lng = park["center"][1] + distance * np.sin(angle)

            temp = np.random.uniform(25, 33)
            vegetation = np.random.uniform(0.7, 0.95)
            traffic = np.random.randint(1, 4)

            hotspots.append({
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "temperature": round(temp, 2),
                "vegetation_index": round(vegetation, 3),
                "traffic_density": traffic,
                "land_use": "park",
                "city": "Pune"
            })

    # Generate some additional random hotspots
    additional_points = num_points - len(hotspots)
    for i in range(additional_points):
        lat = pune_center_lat + np.random.uniform(-0.2, 0.2)
        lng = pune_center_lng + np.random.uniform(-0.2, 0.2)

        temp = np.random.uniform(28, 42)
        vegetation = np.random.uniform(0.1, 0.8)
        traffic = np.random.randint(1, 10)
        land_use = np.random.choice(["residential", "commercial", "industrial"],
                                   p=[0.4, 0.35, 0.25])

        hotspots.append({
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "temperature": round(temp, 2),
            "vegetation_index": round(vegetation, 3),
            "traffic_density": traffic,
            "land_use": land_use,
            "city": "Pune"
        })

    return hotspots

def load_csv_data(csv_path: str) -> List[Dict[str, Any]]:
    """Load hotspot data from CSV file"""
    try:
        df = pd.read_csv(csv_path)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return []

def seed_database():
    """Seed database with hotspot data"""
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(Hotspot).delete()
        db.commit()

        # Try to load from CSV first
        csv_path = os.path.join(os.path.dirname(__file__), 'pune_hotspots.csv')
        hotspots = load_csv_data(csv_path)

        if len(hotspots) < 50:
            print("CSV data limited, generating additional data...")
            generated_hotspots = generate_realistic_pune_data(500 - len(hotspots))
            hotspots.extend(generated_hotspots)

        # Insert hotspots into database
        for hotspot_data in hotspots:
            hotspot = Hotspot(**hotspot_data)
            db.add(hotspot)

        db.commit()

        print(f"Successfully seeded database with {len(hotspots)} hotspots!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

def train_ai_model():
    """Train the AI model with sample data"""
    try:
        # Generate training data
        training_data = generate_realistic_pune_data(1000)

        # Convert to DataFrame for model training
        df = pd.DataFrame(training_data)

        # Create and train model
        model = HeatPredictionModel()
        metrics = model.train(df)

        print(f"Model training completed!")
        print(f"Training metrics: {metrics}")
        print(f"Model saved to {model.model_path}")

    except Exception as e:
        print(f"Error training model: {e}")

def main():
    """Main seeding function"""
    print("Starting database seeding process...")

    # Create database tables
    create_database()

    # Seed database with hotspot data
    seed_database()

    # Train AI model
    train_ai_model()

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()