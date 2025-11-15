// frontend/src/services/aiAnalysisService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface HeatRiskRequest {
  temperature: number;
  humidity: number;
  population_density: number;
  vegetation_index: number;
}

export interface MitigationRequest {
  city_data: {
    name: string;
    population: number;
    area_km2: number;
    [key: string]: any;
  };
  budget: number;
}

export interface PredictionRequest {
  current_data: {
    temperature: number;
    humidity: number;
    [key: string]: any;
  };
  days_ahead: number;
}

export interface HeatRiskResponse {
  risk_score: number;
  risk_level: string;
  factors: {
    temperature_impact: number;
    humidity_impact: number;
    population_impact: number;
    vegetation_impact: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface MitigationStrategy {
  name: string;
  description: string;
  estimated_cost: number;
  expected_impact: string;
  timeframe: string;
  priority: string;
}

export interface FuturePrediction {
  date: string;
  temperature: number;
  humidity: number;
  heat_risk: number;
  recommendations: string[];
}

export const aiAnalysis = {
  // Get heat risk assessment
  async getHeatRisk(data: HeatRiskRequest): Promise<HeatRiskResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/heat-risk`, data);
      return response.data;
    } catch (error) {
      console.error('Error getting heat risk:', error);
      throw error;
    }
  },

  // Get mitigation strategies
  async getMitigationStrategies(data: MitigationRequest): Promise<MitigationStrategy[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/mitigation-strategies`, data);
      return response.data;
    } catch (error) {
      console.error('Error getting mitigation strategies:', error);
      throw error;
    }
  },

  // Get future predictions
  async getFuturePredictions(data: PredictionRequest): Promise<FuturePrediction[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/predict-future`, data);
      return response.data;
    } catch (error) {
      console.error('Error getting future predictions:', error);
      throw error;
    }
  },

  // Get AI service health
  async getHealth(): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking AI service health:', error);
      throw error;
    }
  }
};

export default aiAnalysis;