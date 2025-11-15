import axios, { AxiosInstance } from 'axios';

declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ZoneAnalysis {
  zone_name?: string
  description?: string
  temperature_status?: string
  vegetation_status?: string
  traffic_status?: string
  heat_factors?: string[]
  recommendations?: string[]
}

export interface Hotspot {
  id: number
  latitude: number
  longitude: number
  temperature: number
  vegetation_index?: number
  traffic_density?: number
  land_use?: string
  city: string
  zone_name?: string
  zone_analysis?: ZoneAnalysis
}

export interface PredictionRequest {
  latitude: number
  longitude: number
  vegetation_index?: number
  traffic_density?: number
  land_use?: string
}

export interface PredictionResponse {
  predicted_temperature: number
  confidence_score: number
  model_version: string
  input_data: any
}

export interface SimulationRequest {
  base_temperature: number
  tree_cover_percentage: number
  solar_roof_percentage: number
}

export interface SimulationResponse {
  adjusted_temperature: number
  temperature_change: number
  tree_cover_percentage: number
  solar_roof_percentage: number
  recommendations: string[]
  carbon_impact?: any
  cost_benefit?: any
  future_predictions?: any
  gamification?: any
}

export interface HotspotStats {
  total_hotspots: number
  average_temperature: number
  max_temperature: number
  min_temperature: number
  cities_count: number
  hottest_cities: Array<{
    city: string
    average_temperature: number
    hotspot_count: number
  }>
}

export const hotspotsApi = {
  getHotspots: async (params?: {
    city?: string
    min_temperature?: number
    max_temperature?: number
    limit?: number
  }): Promise<Hotspot[]> => {
    const response = await api.get('/api/hotspots', { params })
    return response.data
  },

  getHotspotsByCity: async (cityName: string, limit: number = 100): Promise<Hotspot[]> => {
    try {
      // First try the city search endpoint which can generate data
      const searchResponse = await api.get(`/api/city/search/`, {
        params: { 
          city_name: cityName,
          generate_data: true,
          num_hotspots: limit || 100
        },
        validateStatus: () => true // Don't throw for any status
      });

      // If we got data from search, return it
      if (searchResponse.status === 200 && searchResponse.data?.hotspots?.length > 0) {
        return searchResponse.data.hotspots;
      }

      // Fall back to the direct hotspots endpoint
      const response = await api.get<Hotspot[]>(`/api/hotspots/`, { 
        params: { 
          city: cityName,
          limit: limit || 100
        },
        validateStatus: (status) => status < 500 // Don't throw for 404
      });
      
      if (response.status === 200 && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      console.warn(`No data found for city: ${cityName}`);
      return [];
    } catch (error) {
      console.error(`Error fetching hotspots for ${cityName}:`, error);
      // Return mock data if API fails
      return generateMockHotspots(cityName, limit);
    }
  },

  getHotspotStats: async (): Promise<HotspotStats> => {
    const response = await api.get<HotspotStats>('/api/hotspots/stats')
    return response.data
  },

  createHotspot: async (hotspot: Omit<Hotspot, 'id' | 'created_at' | 'updated_at'>): Promise<Hotspot> => {
    const response = await api.post('/api/hotspots', hotspot)
    return response.data
  },
}

export const predictionApi = {
  predictTemperature: async (request: PredictionRequest): Promise<PredictionResponse> => {
    const response = await api.post('/api/predict_heat', request)
    return response.data
  },

  getModelInfo: async () => {
    const response = await api.get('/api/model_info')
    return response.data
  },
}

export const simulationApi = {
  simulateTemperature: async (request: SimulationRequest): Promise<SimulationResponse> => {
    const response = await api.post('/api/simulate', request)
    return response.data
  },

  getSimulationImpacts: async () => {
    const response = await api.get('/api/simulation_impacts')
    return response.data
  },
}

// Generate mock hotspots when API is not available
function generateMockHotspots(cityName: string, count: number = 10): Hotspot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    latitude: 19.9 + (Math.random() * 0.2) - 0.1,
    longitude: 72.8 + (Math.random() * 0.2) - 0.1,
    temperature: 25 + Math.random() * 15, // 25-40°C
    vegetation_index: Math.random(),
    traffic_density: Math.floor(Math.random() * 10),
    land_use: ['residential', 'commercial', 'industrial', 'park'][Math.floor(Math.random() * 4)],
    city: cityName,
    zone_name: `Zone ${String.fromCharCode(65 + i % 5)}`,
    zone_analysis: {
      zone_name: `Zone ${String.fromCharCode(65 + i % 5)}`,
      temperature_status: Math.random() > 0.5 ? 'High' : 'Moderate',
      recommendations: [
        'Increase green cover',
        'Improve ventilation',
        'Use reflective materials'
      ]
    }
  }));
}

export default api