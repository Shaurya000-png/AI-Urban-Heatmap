import { useCallback, useEffect, useMemo, useState } from 'react';
import { Thermometer, AlertTriangle, X, Plus, Clock } from 'lucide-react';
import { predictHeatPatterns } from '../services/predictionService';
import PredictionChart from '../components/PredictionChart';
import { HeatPrediction } from '../types';
import { hotspotsApi } from '../services/api';
import { Hotspot } from '../types/city';
import type { HeatIslandAnalysis } from '../services/aiServices';

type CityCoordinates = Record<string, { lat: number; lng: number }>;

interface SearchResult {
  name: string;
  label: string;
  hasData: boolean;
}

interface CityData {
  name: string;
  temperature: number;
  airQuality: number;
  greenCoverage: number;
  populationDensity: number;
  heatRisk: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  hotspot_count: number;
  hotspots: Hotspot[];
  recommendations: string[];
  lastUpdated?: string;
  coordinates?: { lat: number; lng: number } | null;
  aiAnalysis?: HeatIslandAnalysis;
  historicalTemperatures?: number[];
}

const getHeatRisk = (temp: number): 'low' | 'medium' | 'high' => {
  if (temp < 25) return 'low';
  if (temp < 30) return 'medium';
  return 'high';
};

export default function Dashboard(): JSX.Element {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedCitiesData, setSelectedCitiesData] = useState<CityData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [predictions, setPredictions] = useState<Record<string, HeatPrediction[]>>({});
  const [isPredicting, setIsPredicting] = useState<Record<string, boolean>>({});
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const cityCoordinates: CityCoordinates = useMemo(
    () => ({
      Pune: { lat: 18.5204, lng: 73.8567 },
      Mumbai: { lat: 19.076, lng: 72.8777 },
      Nashik: { lat: 19.9975, lng: 73.7898 },
      Delhi: { lat: 28.6139, lng: 77.209 },
      Hyderabad: { lat: 17.385, lng: 78.4867 },
      Bangalore: { lat: 12.9716, lng: 77.5946 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Ahmedabad: { lat: 23.0225, lng: 72.5714 },
      Surat: { lat: 21.1702, lng: 72.8311 },
      Jaipur: { lat: 26.9124, lng: 75.7873 },
      Indore: { lat: 22.7196, lng: 75.8577 },
      Nagpur: { lat: 21.1458, lng: 79.0882 },
      Chandigarh: { lat: 30.7333, lng: 76.7794 },
      Lucknow: { lat: 26.8467, lng: 80.9462 },
      Kanpur: { lat: 26.4499, lng: 80.3319 },
      Bhopal: { lat: 23.2599, lng: 77.4126 },
      Amritsar: { lat: 31.634, lng: 74.8723 },
      Ranchi: { lat: 23.3441, lng: 85.3096 },
    }),
    []
  );

  const generateRecommendations = useCallback((temp: number, green: number, hotspots: Hotspot[] = []) => {
    const recs: string[] = [];
    const avgTemp = temp;
    const hotspotCount = hotspots.length;
    const avgHotspotTemp = hotspots.length > 0 
      ? hotspots.reduce((sum, h) => sum + h.temperature, 0) / hotspots.length 
      : avgTemp;

    // Temperature-based recommendations
    if (avgTemp > 32) {
      recs.push('🚨 Implement emergency cooling centers in high-density areas.');
      recs.push('🌳 Plant drought-resistant trees in urban heat islands.');
    } else if (avgTemp > 28) {
      recs.push('🌿 Increase green roofs and vertical gardens in commercial districts.');
      recs.push('💧 Install water features in public spaces to lower ambient temperature.');
    }

    // Green coverage recommendations
    if (green < 15) {
      recs.push('🌱 Launch urban forestry program to increase green cover by 20% in 2 years.');
    } else if (green < 30) {
      recs.push('🌻 Create more pocket parks in high-density neighborhoods.');
    }

    // Hotspot-specific recommendations
    if (hotspotCount > 0) {
      const highTempHotspots = hotspots.filter(h => h.temperature > 32).length;
      if (highTempHotspots > 0) {
        recs.push(`🌡️ Target cooling measures in ${highTempHotspots} high-temperature hotspots.`);
      }

      // Check for areas with low vegetation
      const lowVegAreas = hotspots.filter(h => h.vegetation_index < 0.3).length;
      if (lowVegAreas > 0) {
        recs.push(`🌿 ${lowVegAreas} areas identified for green infrastructure improvements.`);
      }

      // Check for high traffic areas
      const highTrafficAreas = hotspots.filter(h => h.traffic_density > 70).length;
      if (highTrafficAreas > 0) {
        recs.push(`🚗 Implement traffic calming and green corridors in ${highTrafficAreas} high-traffic zones.`);
      }
    }

    // General recommendations
    recs.push('🏙️ Use cool/reflective materials for roofs and pavements.');
    recs.push('🌇 Implement smart shading solutions for buildings and public spaces.');

    // Ensure we have at least 3 recommendations
    if (recs.length < 3) {
      recs.push('📊 Monitor temperature variations to identify emerging heat islands.');
      recs.push('🌐 Develop community engagement programs for heat resilience.');
    }

    return recs.slice(0, 5); // Return top 5 most relevant recommendations
  }, []);

  const generateMockCityData = useCallback(
    (cityName: string): CityData => {
      const baseTemp = 20 + Math.random() * 15;
      const air = Math.round(30 + Math.random() * 60);
      const green = Math.round(10 + Math.random() * 40);
      const pop = Math.round(3000 + Math.random() * 12000);

      return {
        name: cityName,
        temperature: parseFloat(baseTemp.toFixed(1)),
        airQuality: air,
        greenCoverage: green,
        populationDensity: pop,
        heatRisk: getHeatRisk(baseTemp),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        hotspot_count: 0,
        hotspots: [],
        recommendations: generateRecommendations(baseTemp, green),
        lastUpdated: new Date().toISOString(),
        coordinates: cityCoordinates[cityName] ?? null,
        historicalTemperatures: [],
      };
    },
    [cityCoordinates, generateRecommendations]
  );

  const fetchHotspotsForCity = useCallback(
    async (cityName: string): Promise<CityData> => {
      setIsAnalyzing((p) => ({ ...p, [cityName]: true }));
      setLoading((p) => ({ ...p, [cityName]: true }));
      setError(null);

      try {
        const coordinates = cityCoordinates[cityName] ?? null;
        let hotspotsData: Hotspot[] = [];

        try {
          const res = (await hotspotsApi.getHotspots({ city: cityName })) as { data?: Hotspot[] } | Hotspot[];
          const arr = Array.isArray(res) ? res : res?.data ?? [];

          if (Array.isArray(arr)) {
            hotspotsData = arr.map((h: any) => ({
              ...h,
              id: h.id ?? String(h._id ?? Math.random()),
              temperature: Number(h.temperature) || 25,
              latitude: h.latitude ?? h.lat ?? coordinates?.lat ?? 0,
              longitude: h.longitude ?? h.lng ?? coordinates?.lng ?? 0,
              timestamp: h.timestamp ?? new Date().toISOString(),
            }));
          }
        } catch (apiErr) {
          console.warn(`hotspotsApi failed for ${cityName}:`, apiErr);
          const mockCount = 5 + Math.floor(Math.random() * 6);
          hotspotsData = Array.from({ length: mockCount }).map((_, i) => {
            const lat = (coordinates?.lat ?? 19.0) + (Math.random() * 0.1 - 0.05);
            const lng = (coordinates?.lng ?? 73.7) + (Math.random() * 0.1 - 0.05);
            
            return {
              id: i+1,
              city: cityName,
              latitude: lat,
              longitude: lng,
              temperature: parseFloat((25 + Math.random() * 10).toFixed(1)),
              timestamp: new Date().toISOString(),
              vegetation_index: 0,
              traffic_density: 0,
              land_use: 'residential',
              zone_name: 'Zone ' + (i + 1),
              zone_analysis: 'No analysis available',
              coordinates: [lng, lat] as [number, number]
            } as Hotspot;
          });
        }

        const avgTemperature =
          hotspotsData.length > 0
            ? parseFloat((hotspotsData.reduce((s, h) => s + (h.temperature ?? 0), 0) / hotspotsData.length).toFixed(1))
            : parseFloat((25 + Math.random() * 10).toFixed(1));

        const existing = cityData[cityName];
        const updatedCityData: CityData = {
          ...(existing ?? generateMockCityData(cityName)),
          name: cityName,
          hotspots: hotspotsData,
          hotspot_count: hotspotsData.length,
          temperature: avgTemperature,
          heatRisk: getHeatRisk(avgTemperature),
          lastUpdated: new Date().toISOString(),
          airQuality: existing?.airQuality ?? Math.round(30 + Math.random() * 60),
          greenCoverage: existing?.greenCoverage ?? Math.round(10 + Math.random() * 40),
          populationDensity: existing?.populationDensity ?? Math.round(1000 + Math.random() * 10000),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          recommendations: generateRecommendations(
          avgTemperature, 
          existing?.greenCoverage ?? 20,
          hotspotsData
        ),
          coordinates,
        };

        setCityData((prev) => ({ ...prev, [cityName]: updatedCityData }));
        return updatedCityData;
      } catch (err) {
        console.error(`Error fetching data for ${cityName}:`, err);
        setError(`Failed to load data for ${cityName}`);
        throw err;
      } finally {
        setIsAnalyzing((p) => ({ ...p, [cityName]: false }));
        setLoading((p) => ({ ...p, [cityName]: false }));
      }
    },
    [cityCoordinates, cityData, generateMockCityData, generateRecommendations]
  );

  const handleCitySelect = useCallback(
    async (cityName: string) => {
      if (!cityName) return;
      setSearchQuery('');
      setSearchResults([]);

      setSelectedCities((prev) => (prev.includes(cityName) ? prev : [...prev, cityName]));

      if (!cityData[cityName]) {
        try {
          await fetchHotspotsForCity(cityName);
        } catch (err) {
          console.error('handleCitySelect error:', err);
        }
      }
    },
    [cityData, fetchHotspotsForCity]
  );

  const removeCityFromComparison = useCallback((cityName: string) => {
    setSelectedCities((prev) => prev.filter((c) => c !== cityName));
    setSelectedCitiesData((prev) => prev.filter((c) => c.name !== cityName));
  }, []);

  const handleRefresh = useCallback(async () => {
    if (selectedCities.length === 0) return;
    setError(null);
    try {
      setLoading((p) => ({
        ...p,
        ...Object.fromEntries(selectedCities.map((c) => [c, true])),
      }));
      await Promise.all(selectedCities.map((c) => fetchHotspotsForCity(c)));
    } catch (err) {
      console.error('Refresh failed:', err);
      setError('Failed to refresh city data');
    } finally {
      setLoading((p) => {
        const copy = { ...p };
        selectedCities.forEach((c) => (copy[c] = false));
        return copy;
      });
    }
  }, [selectedCities, fetchHotspotsForCity]);

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      setSearchQuery(trimmed);

      if (!trimmed) {
        setSearchResults([]);
        return;
      }

      setError(null);

      try {
        const coordMatches = Object.keys(cityCoordinates)
          .filter((city) => city.toLowerCase().includes(trimmed.toLowerCase()) && !selectedCities.includes(city))
          .map((city) => ({ name: city, label: city, hasData: true } as SearchResult));
        if (coordMatches.length > 0) {
          setSearchResults(coordMatches);
          return;
        }

        const cachedMatches = Object.keys(cityData)
          .filter((city) => city.toLowerCase().includes(trimmed.toLowerCase()) && !selectedCities.includes(city))
          .map((city) => ({ name: city, label: city, hasData: true } as SearchResult));
        if (cachedMatches.length > 0) {
          setSearchResults(cachedMatches);
          return;
        }

        try {
          const res = (await hotspotsApi.getHotspots({ city: trimmed })) as { data?: any[] } | any[];
          const arr = Array.isArray(res) ? res : res?.data ?? [];

          if (Array.isArray(arr) && arr.length > 0) {
            const citiesFromApi = Array.from(new Set(arr.filter((r: any) => r.city).map((r: any) => r.city)));
            const uniqueCities = citiesFromApi
              .filter((city: string) => !selectedCities.includes(city))
              .map((city: string) => ({ name: city, label: city, hasData: true } as SearchResult));

            if (uniqueCities.length > 0) {
              setSearchResults(uniqueCities);
              return;
            }
          }

          setSearchResults([{ name: trimmed, label: `No data found. Click to add "${trimmed}"`, hasData: false }]);
          return;
        } catch (apiErr) {
          console.warn('API search failed, falling back to local suggestion', apiErr);
          setSearchResults([{ name: trimmed, label: `Add "${trimmed}" (no remote data)`, hasData: false }]);
          return;
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search');
        setSearchResults([]);
      }
    },
    [cityCoordinates, cityData, selectedCities]
  );

  useEffect(() => {
    const data = selectedCities.map((c) => cityData[c] ?? generateMockCityData(c)).filter(Boolean);
    setSelectedCitiesData(data);
  }, [selectedCities, cityData, generateMockCityData]);

  useEffect(() => {
    const loadInitialData = async () => {
      const defaultCities = ['Nashik', 'Mumbai', 'Pune'];
      await Promise.all(
        defaultCities.map(async (city) => {
          if (!cityData[city]) {
            try {
              await fetchHotspotsForCity(city);
            } catch {
              // ignore
            }
          }
        })
      );
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      for (const city of selectedCitiesData) {
        if (!predictions[city.name] && !isPredicting[city.name]) {
          try {
            setIsPredicting(prev => ({ ...prev, [city.name]: true }));
            const cityPredictions = await predictHeatPatterns({
              ...city,
              coordinates: city.coordinates || { lat: 0, lng: 0 }
            });
            setPredictions(prev => ({
              ...prev,
              [city.name]: cityPredictions
            }));
          } catch (error) {
            console.error(`Failed to get predictions for ${city.name}:`, error);
            setPredictionError(`Failed to load predictions for ${city.name}. Using sample data.`);
          } finally {
            setIsPredicting(prev => ({ ...prev, [city.name]: false }));
          }
        }
      }
    };

    if (selectedCitiesData.length > 0) {
      fetchPredictions();
    }
  }, [selectedCitiesData, predictions, isPredicting]);

  const anyAnalyzing = Object.values(isAnalyzing).some(Boolean);
  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Urban Heat Comparison Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M23 4v6h-6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 20v-6h6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.51 9a9 9 0 0114.13-3.36L23 10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 15a9 9 0 01-14.13 3.36L1 14" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 relative">
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="city-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Add cities to compare
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      id="city-search"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Search for a city..."
                      value={searchQuery}
                      onChange={(e) => {
                        const q = e.target.value;
                        setSearchQuery(q);
                        handleSearch(q);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery) {
                          if (searchResults.length === 1) {
                            handleCitySelect(searchResults[0].name);
                          } else {
                            handleCitySelect(searchQuery);
                          }
                        }
                      }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="clear search"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => searchQuery && handleCitySelect(searchQuery)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <ul className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10 absolute w-full sm:w-96">
                    {searchResults.map((result) => (
                      <li
                        key={result.name}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          !result.hasData ? 'text-gray-500 italic' : ''
                        }`}
                        onClick={() => handleCitySelect(result.name)}
                      >
                        {result.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedCities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCities.map((city) => (
                    <div
                      key={city}
                      className="inline-flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                    >
                      <span>{city}</span>
                      <button
                        type="button"
                        onClick={() => removeCityFromComparison(city)}
                        className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
                        aria-label={`remove ${city}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(anyLoading || anyAnalyzing) && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="ml-2">Loading city data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {selectedCitiesData.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">City Comparison</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Overview of key metrics across selected cities</p>
                </div>

                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                          {selectedCitiesData.map((city) => (
                            <th key={city.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {city.name}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Temperature</td>
                          {selectedCitiesData.map((city) => (
                            <td key={`${city.name}-temp`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Thermometer
                                  className={`h-4 w-4 mr-2 ${
                                    city.temperature > 35 ? 'text-red-500' : city.temperature > 30 ? 'text-yellow-500' : 'text-blue-500'
                                  }`}
                                />
                                {city.temperature}°C
                              </div>
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Air Quality</td>
                          {selectedCitiesData.map((city) => (
                            <td key={`${city.name}-air`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div
                                  className={`h-2 w-2 rounded-full mr-2 ${
                                    city.airQuality > 70 ? 'bg-red-500' : city.airQuality > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                />
                                {city.airQuality}/100
                              </div>
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Green Coverage</td>
                          {selectedCitiesData.map((city) => (
                            <td key={`${city.name}-green`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${city.greenCoverage}%` }}
                                  />
                                </div>
                                {city.greenCoverage}%
                              </div>
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Population Density</td>
                          {selectedCitiesData.map((city) => (
                            <td key={`${city.name}-pop`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {city.populationDensity.toLocaleString()}/km²
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Heat Risk</td>
                          {selectedCitiesData.map((city) => (
                            <td key={`${city.name}-risk`} className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  city.heatRisk === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : city.heatRisk === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {city.heatRisk}
                              </span>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* AI Predictions */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center">
                  <Clock className="h-6 w-6 text-indigo-600 mr-2" />
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Powered Heat Predictions</h3>
                    <p className="mt-1 text-sm text-gray-500">7-day forecast of urban heat patterns</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-4">
                  {predictionError && (
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                      {predictionError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    {selectedCitiesData.map((city) => (
                      <div key={`prediction-${city.name}`} className="relative">
                        {isPredicting[city.name] && (
                          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        )}
                        {predictions[city.name] ? (
                          <PredictionChart 
                            predictions={predictions[city.name]} 
                            cityName={city.name} 
                          />
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                            Loading predictions for {city.name}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedCitiesData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Select cities to view heat predictions
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select cities to compare their heat data</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}