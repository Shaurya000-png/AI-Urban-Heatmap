export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  coordinates: Coordinates;
  temperature: number;
  airQuality: number;
  greenCoverage: number;
  populationDensity: number;
  heatRisk: 'low' | 'medium' | 'high';
  lastUpdated?: string;
  recommendations?: string[];
  historicalTemperatures?: number[];
  aiAnalysis?: any;
}

export interface HeatPrediction {
  date: string;
  predictedTemp: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
