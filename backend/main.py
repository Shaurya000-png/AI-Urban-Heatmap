from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from routes import ai_analysis

from routes import hotspots, predict_heat, simulate, city_search

app = FastAPI(
    title="SustainAble AI - Urban Heatmap API",
    description="AI-powered urban temperature prediction and simulation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Add this if using Vite
        "http://127.0.0.1:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hotspots.router)
app.include_router(predict_heat.router)
app.include_router(simulate.router)
app.include_router(city_search.router)
app.include_router(ai_analysis.router, prefix="/api", tags=["AI Analysis"])

@app.get("/")
async def root():
    return {
        "message": "SustainAble AI - Urban Heatmap API",
        "version": "1.0.0",
        "description": "AI-powered urban temperature prediction and simulation",
        "endpoints": {
            "hotspots": "/api/hotspots",
            "prediction": "/api/predict_heat",
            "simulation": "/api/simulate",
            "docs": "/docs",
            "model_info": "/api/model_info"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SustainAble AI Backend"}
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)