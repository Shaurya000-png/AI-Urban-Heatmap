// frontend/src/services/aiService.ts
import axios from 'axios';

const { VITE_OPENWEATHER_API_KEY, VITE_GOOGLE_MAPS_API_KEY } = import.meta.env;

// ---------------------------- TYPES ----------------------------

export interface TemperaturePrediction {
  date: string;
  temperature: number;
  confidence: number;
  weather?: {
    main: string;
    description: string;
    icon: string;
  };
}

export interface Hotspot {
  id: number | string;
  latitude: number;
  longitude: number;
  temperature: number;
  vegetation_index?: number;
  traffic_density?: number;
  land_use?: string;
  city?: string;
  zone_name?: string;
  zone_analysis?: any;
  timestamp?: string;
}

export interface HeatIslandAnalysis {
  score: number;
  hotspots: Array<{
    coordinates: [number, number];
    intensity: number;
    area_sqkm: number;
  }>;
  processedImageUrl?: string;
  analysis: {
    status: string;
    factors: string[];
    recommendations: string[];
    currentIntensity: string;
    details: string[];
    lastUpdated: string;
  };
}

// ---------------------------- UTILS ----------------------------

// ---------------------------- SERVICE ----------------------------

export const aiService = {
  // ---------- Temperature predictions ----------
  async predictTemperatures(
    _city: string, // Prefix with _ to indicate it's intentionally unused
    coordinates: { lat: number; lng: number },
    daysAhead: number = 7
  ): Promise<{ predictions: TemperaturePrediction[] }> {
    try {
      const lat = String(coordinates.lat).trim();
      const lon = String(coordinates.lng).trim();

      if (!VITE_OPENWEATHER_API_KEY) {
        console.warn('OpenWeather API key not found. Using mock temperature data.');
        return this.generateMockPredictions(daysAhead);
      }

      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${VITE_OPENWEATHER_API_KEY}`;

      const response = await axios.get(url);
      const daily = response.data?.daily ?? [];

      const predictions: TemperaturePrediction[] = daily.slice(0, daysAhead).map((day: any, idx: number) => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: Math.round(day.temp.day * 10) / 10,
        confidence: Math.max(0.6, 0.95 - idx * 0.05),
        weather: {
          main: day.weather?.[0]?.main ?? 'Clear',
          description: day.weather?.[0]?.description ?? 'clear sky',
          icon: day.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` : undefined,
        },
      }));

      return { predictions };
    } catch (err) {
      console.warn('Error fetching weather data, falling back to mock predictions:', err);
      return this.generateMockPredictions(daysAhead);
    }
  },

  generateMockPredictions(daysAhead: number) {
    const conditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d' },
      { main: 'Clouds', description: 'few clouds', icon: '02d' },
      { main: 'Rain', description: 'light rain', icon: '10d' },
      { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    ];

    const predictions: TemperaturePrediction[] = Array.from({ length: daysAhead }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const w = conditions[Math.floor(Math.random() * conditions.length)];
      return {
        date: date.toISOString().split('T')[0],
        temperature: Math.round((25 + Math.random() * 10) * 10) / 10,
        confidence: Math.max(0.6, 0.95 - i * 0.05),
        weather: { ...w, icon: `https://openweathermap.org/img/wn/${w.icon}@2x.png` },
      };
    });

    return { predictions };
  },

  // ---------- Heat island analysis (Mock implementation) ----------
  async analyzeHeatIslands(_city: string, coordinates: { lat: number; lng: number }): Promise<HeatIslandAnalysis> {
    // Return mock data
    return {
      score: 0.65,
      hotspots: [
        {
          coordinates: [coordinates.lng + 0.002, coordinates.lat + 0.001],
          intensity: 0.8,
          area_sqkm: 1.2
        },
        {
          coordinates: [coordinates.lng - 0.001, coordinates.lat - 0.002],
          intensity: 0.6,
          area_sqkm: 0.8
        }
      ],
      processedImageUrl: VITE_GOOGLE_MAPS_API_KEY
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=12&size=800x400&maptype=hybrid&key=${VITE_GOOGLE_MAPS_API_KEY}`
        : undefined,
      analysis: {
        status: 'Analysis Complete',
        factors: [
          'High building density in urban core',
          'Limited green spaces',
          'Heat-absorbing materials in urban infrastructure'
        ],
        recommendations: [
          'Increase urban green spaces and tree cover',
          'Use reflective or green roofing materials',
          'Implement cool pavement technologies'
        ],
        currentIntensity: 'Moderate to High',
        details: [
          'The urban heat island effect is more pronounced in the city center',
          'Nighttime temperatures remain elevated due to heat retention in buildings and pavement',
          'Areas with more vegetation show significantly lower temperatures'
        ],
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };
  }
};
