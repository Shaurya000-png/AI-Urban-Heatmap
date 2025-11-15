import { useState, useEffect } from 'react';
import AIAnalysis from '../components/AIAnalysis';
import { MapPin } from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lng: number;
  population?: number;
  area?: number;
}

export default function CityDashboard() {
  // List of major Indian cities with their coordinates
  const cities: City[] = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 20.4, area: 603.4 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, population: 18.7, area: 1484.0 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, population: 12.3, area: 709.0 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, population: 10.4, area: 650.0 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, population: 10.9, area: 426.0 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, population: 14.9, area: 205.0 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, population: 7.3, area: 729.0 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, population: 7.6, area: 505.0 },
  ];

  const [selectedCity, setSelectedCity] = useState<City>(cities[0]);
  const [historicalTemperatures, setHistoricalTemperatures] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate random historical temperature data
  useEffect(() => {
    const generateHistoricalData = () => {
      return Array(7).fill(0).map(() => {
        // Base temperature based on city's latitude (colder in the north)
        const baseTemp = 30 - ((selectedCity.lat - 8) * 0.2);
        // Add some variation
        return Math.round((baseTemp + (Math.random() * 8 - 4)) * 10) / 10;
      });
    };

    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setHistoricalTemperatures(generateHistoricalData());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedCity]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = cities.find(c => c.name === e.target.value);
    if (city) {
      setSelectedCity(city);
    }
  };

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Analysis complete for', selectedCity.name, ':', analysis);
    // You can store or process the analysis data here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Urban Heat Island Analysis</h1>
          <p className="text-gray-600">Analyze and compare urban heat island effects across major Indian cities</p>
        </header>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select City
                </label>
                <div className="relative">
                  <select
                    id="city-select"
                    value={selectedCity.name}
                    onChange={handleCityChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    {cities.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <MapPin size={20} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-2/3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">LATITUDE</p>
                  <p className="text-lg font-semibold">{selectedCity.lat.toFixed(4)}°</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">LONGITUDE</p>
                  <p className="text-lg font-semibold">{selectedCity.lng.toFixed(4)}°</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">POPULATION</p>
                  <p className="text-lg font-semibold">
                    {selectedCity.population ? `${selectedCity.population}M` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <AIAnalysis
                cityName={selectedCity.name}
                coordinates={{ lat: selectedCity.lat, lng: selectedCity.lng }}
                historicalTemperatures={historicalTemperatures}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About Urban Heat Islands</h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              Urban Heat Islands (UHI) occur when cities experience higher temperatures than nearby rural areas due to human activities and urban development. 
              The temperature difference is usually larger at night than during the day, and is most apparent when winds are weak.
            </p>
            <p className="mt-2">
              This dashboard helps you analyze the UHI effect in major Indian cities, providing insights into temperature patterns, 
              contributing factors, and potential mitigation strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
