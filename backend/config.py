import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:Rizwan25@localhost:5432/sustainable_ai")
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    model_version: str = os.getenv("MODEL_VERSION", "1.0")
    prediction_confidence_threshold: float = float(os.getenv("PREDICTION_CONFIDENCE_THRESHOLD", "0.7"))

settings = Settings()