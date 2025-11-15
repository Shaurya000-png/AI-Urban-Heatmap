import React, { useState, useMemo } from 'react';
import { Globe, Info, Thermometer, Droplet, TrendingUp } from 'lucide-react';
import CitySearch from '../components/CitySearch';
import Heatmap from '../components/Heatmap';
import { CityData } from '../types/city';

const CityExplorer: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    if (!selectedCity?.hotspots?.length) return [];

    return selectedCity.hotspots
      .filter(hotspot => 
        hotspot.latitude != null && 
        hotspot.longitude != null &&
        !isNaN(hotspot.latitude) && 
        !isNaN(hotspot.longitude) &&
        Math.abs(hotspot.latitude) <= 90 &&
        Math.abs(hotspot.longitude) <= 180
      )
      .map(hotspot => [
        parseFloat(hotspot.latitude.toString()),
        parseFloat(hotspot.longitude.toString()),
        parseFloat(hotspot.temperature?.toString() || '1')
      ] as [number, number, number]);
  }, [selectedCity]);

  const handleCitySelect = (cityData: CityData) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCity(cityData);
    } catch (err) {
      console.error('Error setting city data:', err);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">City Explorer</h1>
      
      <div className="mb-8">
        <CitySearch onCitySelect={handleCitySelect} />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {selectedCity ? (
        <div className="space-y-8">
          {/* City Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">{selectedCity.city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Thermometer className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">Temperature</span>
                </div>
                <p className="text-2xl font-bold">
                  {selectedCity.mean_temperature?.toFixed(1) || 'N/A'}°C
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCity.statistics?.total_hotspots || 0} hotspots analyzed
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Droplet className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">Hotspots</span>
                </div>
                <p className="text-2xl font-bold">
                  {selectedCity.hotspots?.length || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCity.hotspots_generated || 0} generated
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">Heat Index</span>
                </div>
                <p className="text-2xl font-bold">
                  {selectedCity.statistics?.average_temperature
                    ? `${selectedCity.statistics.average_temperature.toFixed(1)}°C`
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Max: {selectedCity.statistics?.max_temperature?.toFixed(1) || 'N/A'}°C
                </p>
              </div>
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Heatmap Visualization</h3>
            </div>
            <div className="h-[500px] w-full">
              {selectedCity.latitude && selectedCity.longitude && (
                <Heatmap
                  center={[selectedCity.latitude, selectedCity.longitude]}
                  zoom={12}
                  heatmapData={heatmapData}
                />
              )}
            </div>
          </div>

          {/* AI Analysis will be shown in the CitySearch component */}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No city selected
          </h3>
          <p className="mt-1 text-gray-500">
            Search for a city to view its heatmap and statistics
          </p>
        </div>
      )}
    </div>
  );
};

export default CityExplorer;