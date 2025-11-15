// src/types/city.ts

export interface Hotspot {
  id: number;
  latitude: number;
  longitude: number;
  temperature: number;
  vegetation_index?: number;
  traffic_density?: number;
  land_use?: string;
  city: string;
  zone_name?: string;
  zone_analysis?: {
    zone_name?: string;
    description?: string;
    temperature_status?: string;
    vegetation_status?: string;
    traffic_status?: string;
    heat_factors?: string[];
    recommendations?: string[];
  };
  timestamp?: string;
}

export interface SearchResult {
  name: string;
  label: string;
  hasData: boolean;
}

export interface CityData {
  city: string;
  latitude: number;
  longitude: number;
  mean_temperature: number;
  data_available: boolean;
  hotspots_generated: number;
  hotspots: Hotspot[];
  statistics: {
    total_hotspots: number;
    average_temperature: number;
    max_temperature: number;
    min_temperature: number;
    average_vegetation: number;
    average_traffic: number;
    temperature_std: number;
  };
  hottest_areas: Array<{
    area_type: string;
    average_temperature: number;
    max_temperature: number;
    hotspot_count: number;
  }>;
  last_updated: string;
  recommendations: string[];
}

export interface DashboardState {
  selectedCity: CityData | null;
  selectedCities: string[];
  cityData: Record<string, CityData>;
  isAnalyzing: Record<string, boolean>;
  loading: Record<string, boolean>;
  error: string | null;
  selectedCitiesData: CityData[];
  searchQuery: string;
  searchResults: SearchResult[];
  predictions: Record<string, any>;
  isPredicting: Record<string, boolean>;
  predictionError: string | null;
  comparisonAnalysis: string;
  isComparing: boolean;
}