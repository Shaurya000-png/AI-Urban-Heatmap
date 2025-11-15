// frontend/src/components/AIAnalysis.tsx
import { useCallback, useEffect, useState } from 'react';
import { Thermometer, MapPin, AlertCircle } from 'lucide-react';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Marker } from 'react-simple-maps';
import { aiService } from '../services/aiServices';

// -------------------- Types --------------------
interface TemperaturePrediction {
  date: string;
  temperature: number;
  confidence: number;
  weather?: {
    main?: string;
    description?: string;
    icon?: string;
  };
}

export interface ParsedAnalysis {
  status: string;
  factors: string[];
  recommendations: string[];
  currentIntensity: string;
  details: string[];
  lastUpdated: string;
  score?: number;
  hotspots?: HotspotType[];
}

export interface HotspotType {
  coordinates: [number, number]; // [lng, lat]
  intensity: number; // 0..1 scale
  area_sqkm?: number; // Make optional to handle cases where it might be missing
  temperature?: number;
  zone_name?: string;
  vegetation_index?: number; // 0..1
}

interface HeatIslandAnalysis {
  score: number; // 0..1
  hotspots: HotspotType[];
  processedImageUrl?: string;
  analysis: {
    status: string;
    factors: string[];
    recommendations: string[];
    currentIntensity: string; // 'Low'|'Moderate'|'High'|'Very High' etc.
    details: string[];
    lastUpdated: string; // YYYY-MM-DD
  };
}

interface LoadingState {
  predictions: boolean;
  heatIslands: boolean;
}

interface AIAnalysisProps {
  cityName: string;
  coordinates: { lat: number; lng: number };
  historicalTemperatures?: number[]; // optional input
  onAnalysisComplete?: (analysis: HeatIslandAnalysis) => void;
}const getMockAnalysis = (prompt: string): string => {
  // Extract city name from prompt if possible
  const cityMatch = prompt.match(/city of ([A-Za-z\s]+)/i) || 
                   prompt.match(/analyze ([A-Za-z\s]+)/i);
  const city = cityMatch ? cityMatch[1] : "this location";
  
  return JSON.stringify({
    score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
    hotspots: [],
    analysis: {
      status: "Analysis complete",
      factors: ["Building density", "Lack of green spaces", "Urban infrastructure"],
      recommendations: [
        "Increase urban green spaces by 15%",
        "Implement cool roof initiatives",
        "Enhance tree canopy coverage"
      ],
      currentIntensity: "Moderate to High",
      details: [
        `The urban heat island effect in ${city} is primarily driven by extensive impervious surfaces.`,
        "Peak temperatures are observed in densely built-up commercial districts.",
        "Nighttime cooling is limited due to heat retention in building materials."
      ],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  });
};

// -------------------- Parse AI analysis robustly --------------------
const parseAIAnalysis = (analysis: string): ParsedAnalysis => {
  try {
    let cleaned = analysis.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    const maybe = (() => {
      try {
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    })();

    if (maybe && typeof maybe === 'object') {
      const getArr = (v: any) =>
        Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? [v.trim()] : [];

      const getIntensity = (obj: any) => {
        const raw = (obj?.current_intensity || obj?.intensity || obj?.severity || '').toString().toLowerCase();
        if (!raw) return 'Moderate';
        if (raw.includes('very')) return 'Very High';
        if (raw.includes('high') || raw.includes('severe')) return 'High';
        if (raw.includes('moderate') || raw.includes('medium')) return 'Moderate';
        if (raw.includes('low') || raw.includes('mild')) return 'Low';
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      };

      const formatted: ParsedAnalysis = {
        status: maybe.status || 'Analysis Complete',
        factors: getArr(maybe.main_contributing_factors || maybe.factors || maybe.contributing_factors || maybe.causes),
        recommendations: getArr(maybe.recommendations || maybe.suggestions || maybe.mitigation_strategies),
        currentIntensity: getIntensity(maybe),
        details: getArr(maybe.details || maybe.summary || maybe.analysis),
        lastUpdated: maybe.analysis_date || maybe.lastUpdated || new Date().toISOString().split('T')[0],
        score: maybe.score || 75, // Default score if not provided
        hotspots: maybe.hotspots || [] // Default empty array if not provided
      };

      // ensure arrays are not empty
      if (formatted.factors.length === 0) formatted.factors = ['Not specified'];
      if (formatted.recommendations.length === 0) {
        formatted.recommendations = ['No specific recommendations'];
      }
      if (formatted.details.length === 0) {
        formatted.details = ['No further details available'];
      }

      return formatted;
    }

    // Fallback for non-JSON responses
    return {
      status: 'Analysis Complete',
      factors: ['Automatic analysis complete'],
      recommendations: ['Review the analysis for specific recommendations'],
      currentIntensity: 'Moderate',
      details: [analysis || 'No additional details available'],
      lastUpdated: new Date().toISOString().split('T')[0],
      score: 75,
      hotspots: []
    };
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    return {
      status: 'Error',
      factors: ['Error in analysis'],
      recommendations: ['Please try again or check the input data'],
      currentIntensity: 'Unknown',
      details: ['Failed to parse the analysis response'],
      lastUpdated: new Date().toISOString().split('T')[0],
      score: 50,
      hotspots: []
    };
  }
};

// -------------------- Heat island analysis function --------------------

async function analyzeHeatIslands(city: string, coords: { lat: number; lng: number }): Promise<HeatIslandAnalysis> {
  try {
    // Use the mock implementation from the aiService
    return await aiService.analyzeHeatIslands(city, coords);
  } catch (error) {
    console.error('Error in analyzeHeatIslands:', error);
    // Return mock data if there's an error
    return {
      score: 0.5,
      hotspots: [],
      analysis: {
        status: 'Analysis Unavailable',
        factors: ['Unable to analyze at this time'],
        recommendations: ['Please try again later'],
        currentIntensity: 'Unknown',
        details: ['The analysis service is currently unavailable.'],
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };
  }
}

// -------------------- Component --------------------
export default function AIAnalysis({
  cityName,
  coordinates,
  historicalTemperatures = [],
  onAnalysisComplete,
}: AIAnalysisProps): JSX.Element {
  const [heatIslandData, setHeatIslandData] = useState<HeatIslandAnalysis | null>(null);
  const [predictions, setPredictions] = useState<TemperaturePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<LoadingState>({ predictions: false, heatIslands: false });
  const [error, setError] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [formattedAnalysis, setFormattedAnalysis] = useState<HeatIslandAnalysis['analysis'] | null>(null);

  // helpers for colors / labels
  const getTempColor = useCallback((temp: number) => {
    if (temp > 35) return '#ef4444';
    if (temp > 30) return '#f97316';
    if (temp > 25) return '#eab308';
    if (temp > 20) return '#22c55e';
    return '#3b82f6';
  }, []);

  const getIntensityLevel = useCallback((score: number) => {
    if (score >= 0.8) return 'Very High';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Moderate';
    if (score >= 0.2) return 'Low';
    return 'Minimal';
  }, []);

  const getIntensityColor = useCallback((score: number) => {
    if (score >= 0.8) return 'bg-red-100 text-red-800';
    if (score >= 0.6) return 'bg-orange-100 text-orange-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    if (score >= 0.2) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  }, []);

  // fetch heat island analysis
  useEffect(() => {
    if (!cityName || !coordinates) return;

    let isMounted = true;
    const run = async () => {
      setIsLoading((s) => ({ ...s, heatIslands: true }));
      setError(null);

      try {
        const analysis = await analyzeHeatIslands(cityName, coordinates);
        if (!isMounted) return;
        
        // Create a stable reference to prevent unnecessary re-renders
        const stableAnalysis = {
          ...analysis,
          hotspots: [...(analysis.hotspots || [])].map(h => ({
            ...h,
            coordinates: [...h.coordinates] as [number, number]
          })),
          analysis: {
            ...analysis.analysis,
            factors: [...(analysis.analysis.factors || [])],
            recommendations: [...(analysis.analysis.recommendations || [])],
            details: [...(analysis.analysis.details || [])]
          }
        };
        
        setHeatIslandData(stableAnalysis);
        setFormattedAnalysis(stableAnalysis.analysis);
        onAnalysisComplete?.(stableAnalysis);
      } catch (err) {
        if (!isMounted) return;
        console.error('analyzeHeatIslands error:', err);
        setError('Failed to analyze heat islands. Try again later.');
      } finally {
        if (isMounted) {
          setIsLoading((s) => ({ ...s, heatIslands: false }));
        }
      }
    };

    run();
    
    return () => {
      isMounted = false;
    };
  }, [cityName, coordinates, onAnalysisComplete]);

  // fetch temperature predictions
  useEffect(() => {
    if (!cityName || !coordinates) return;

    let isMounted = true;
    const run = async () => {
      setIsLoading((s) => ({ ...s, predictions: true }));
      setError(null);

      try {
        // Option 3 assumed: service returns an object with metadata + predictions
        const response = await aiService.predictTemperatures(cityName, { 
          lat: coordinates.lat, 
          lng: coordinates.lng 
        });

        if (!isMounted) return;

        let predictions: TemperaturePrediction[] = [];
        
        if (response && Array.isArray(response.predictions)) {
          predictions = response.predictions.map(p => ({
            ...p,
            weather: p.weather ? { ...p.weather } : undefined
          }));
        } else if (Array.isArray(response)) {
          // tolerate direct-array returners
          predictions = response.map(p => ({
            ...p,
            weather: p.weather ? { ...p.weather } : undefined
          })) as TemperaturePrediction[];
        } else {
          // fallback sample
          predictions = [{
            date: new Date().toISOString().split('T')[0],
            temperature: 28.5,
            confidence: 0.9,
            weather: { 
              main: 'Clear', 
              description: 'clear sky', 
              icon: 'https://openweathermap.org/img/wn/01d@2x.png' 
            },
          }];
        }

        setPredictions(predictions);
      } catch (err) {
        if (!isMounted) return;
        
        console.error('predictTemperatures error:', err);
        setError('Failed to fetch temperature predictions. Showing sample data.');
        
        const fallbackPredictions = [{
          date: new Date().toISOString().split('T')[0],
          temperature: 28.5,
          confidence: 0.9,
          weather: { 
            main: 'Clear', 
            description: 'clear sky', 
            icon: 'https://openweathermap.org/img/wn/01d@2x.png' 
          },
        }];
        
        setPredictions(fallbackPredictions);
      } finally {
        if (isMounted) {
          setIsLoading((s) => ({ ...s, predictions: false }));
        }
      }
    };

    run();
    
    return () => {
      isMounted = false;
    };
  }, [cityName, coordinates]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700">
        <AlertCircle className="inline-block mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heat Island Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Thermometer className="mr-2" /> Urban Heat Island Analysis — {cityName}
        </h3>

        {isLoading.heatIslands ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : heatIslandData && formattedAnalysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intensity */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Heat Island Intensity</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(heatIslandData.score)}`}>
                  {getIntensityLevel(heatIslandData.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${Math.round(heatIslandData.score * 100)}%`,
                    background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)',
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Score: {Math.round(heatIslandData.score * 100)}/100</p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                  Analysis Summary
                </h4>
                {formattedAnalysis.lastUpdated && <p className="text-xs text-gray-500 mt-1">Last updated: {formattedAnalysis.lastUpdated}</p>}
                {/* If the analysis is a partial/fallback (Gemini quota or failure), show a concise banner */}
                {(formattedAnalysis.status || '').toLowerCase().includes('partial') || (formattedAnalysis.status || '').toLowerCase().includes('quota') || (formattedAnalysis.status || '').toLowerCase().includes('unavailable') ? (
                  <div className="mt-3 p-2 rounded bg-yellow-50 text-yellow-800 text-sm flex items-center">
                    <AlertCircle className="mr-2" />
                    <div>
                      {formattedAnalysis.status}
                      {formattedAnalysis.details && formattedAnalysis.details.length > 0 ? ` — ${formattedAnalysis.details[0]}` : ''}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="p-5 space-y-6">
                {/* Current Intensity */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-semibold text-gray-700">Current Intensity</h5>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formattedAnalysis.currentIntensity.toLowerCase() === 'very high'
                          ? 'bg-red-100 text-red-800'
                          : formattedAnalysis.currentIntensity.toLowerCase() === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : formattedAnalysis.currentIntensity.toLowerCase() === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {formattedAnalysis.currentIntensity}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full`}
                      style={{
                        width:
                          formattedAnalysis.currentIntensity.toLowerCase() === 'very high'
                            ? '100%'
                            : formattedAnalysis.currentIntensity.toLowerCase() === 'high'
                            ? '75%'
                            : formattedAnalysis.currentIntensity.toLowerCase() === 'moderate'
                            ? '50%'
                            : '25%',
                        background:
                          formattedAnalysis.currentIntensity.toLowerCase() === 'very high'
                            ? 'linear-gradient(90deg,#ef4444,#991b1b)'
                            : formattedAnalysis.currentIntensity.toLowerCase() === 'high'
                            ? 'linear-gradient(90deg,#fb923c,#ea580c)'
                            : formattedAnalysis.currentIntensity.toLowerCase() === 'moderate'
                            ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                            : 'linear-gradient(90deg,#34d399,#059669)',
                      }}
                    />
                  </div>
                </div>

                {/* Factors */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Main Contributing Factors</h5>
                  <ul className="space-y-2">
                    {formattedAnalysis.factors.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </div>
                        <span className="text-sm text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h5>
                  <div className="space-y-3">
                    {formattedAnalysis.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                {formattedAnalysis.details.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Additional Insights</h5>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {formattedAnalysis.details.map((d, i) => (
                        <p key={i} className="text-sm text-gray-600 mb-2 last:mb-0">{d}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No heat island data available</p>
        )}
      </div>

      {/* Temperature Predictions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Thermometer className="mr-2" /> 7-Day Temperature Forecast
        </h3>

        {isLoading.predictions ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto py-2">
            {predictions.map((pred, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[80px]">
                <div className="text-sm text-gray-500">
                  {new Date(pred.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                {pred.weather?.icon && <img src={pred.weather.icon} alt={pred.weather.description || 'weather icon'} className="w-12 h-12" />}
                <div className="text-xl font-semibold my-1">{pred.temperature.toFixed(1)}°C</div>
                <div className="text-xs text-gray-500 capitalize">{pred.weather?.description || 'N/A'}</div>
                <div
                  className={`w-2 h-2 rounded-full ${pred.confidence > 0.8 ? 'bg-green-500' : pred.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  title={`Confidence: ${Math.round((pred.confidence || 0) * 100)}%`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotspots Map */}
      {heatIslandData?.hotspots && heatIslandData.hotspots.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <MapPin className="mr-2" /> Heat Island Hotspots
          </h3>

          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [coordinates.lng, coordinates.lat],
                scale: Math.max(2000, 2000 + (8 - mapZoom) * 300),
              }}
            >
              <ZoomableGroup
                center={[coordinates.lng, coordinates.lat]}
                zoom={Math.max(1, Math.min(12, mapZoom))}
                onMoveEnd={(pos: any) => {
                  // pos may contain .zoom
                  if (pos?.zoom) setMapZoom(Math.max(1, Math.min(12, pos.zoom)));
                }}
              >
                <Geographies geography="/features.json">
                  {({ geographies }) =>
                    geographies.map((geo: any) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#EAEAEC" stroke="#D6D6DA" />
                    ))
                  }
                </Geographies>

                {(heatIslandData.hotspots as HotspotType[]).map((hotspot, idx) => {
                  const [lng, lat] = hotspot.coordinates;
                  const temp = hotspot.temperature ?? (hotspot.intensity * 30 + 20);
                  return (
                    <Marker key={idx} coordinates={[lng, lat]}>
                      <circle r={Math.max(3, Math.min(12, temp / 3))} fill={getTempColor(temp)} fillOpacity={0.75} stroke="#fff" strokeWidth={0.5}>
                        <title>
                          {`Temp: ${temp.toFixed(1)}°C\n`}
                          {hotspot.zone_name ? `Zone: ${hotspot.zone_name}\n` : ''}
                          {hotspot.vegetation_index !== undefined && !isNaN(hotspot.vegetation_index) ? `Vegetation: ${(hotspot.vegetation_index * 100).toFixed(1)}%\n` : ''}
                          {hotspot.area_sqkm !== undefined ? `Area: ${hotspot.area_sqkm.toFixed(2)} km²\n` : ''}
                        </title>
                      </circle>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Hotspots list */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Hotspots Detected</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heatIslandData.hotspots.slice(0, 3).map((hotspot, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Hotspot {idx + 1}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${getIntensityColor(hotspot.intensity)}`}>+{(hotspot.intensity * 5).toFixed(1)}°C</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {hotspot.area_sqkm !== undefined && <p>Area: {hotspot.area_sqkm.toFixed(2)} km²</p>}
                    {hotspot.zone_name && <p>Zone: {hotspot.zone_name}</p>}
                    {hotspot.vegetation_index !== undefined && <p>Vegetation: {(hotspot.vegetation_index * 100).toFixed(1)}%</p>}
                  </div>
                </div>
              ))}
            </div>

            {heatIslandData.hotspots.length > 3 && <div className="mt-3 text-sm text-blue-600">+ {heatIslandData.hotspots.length - 3} more hotspots</div>}
          </div>
        </div>
      )}
    </div>
  );
}
