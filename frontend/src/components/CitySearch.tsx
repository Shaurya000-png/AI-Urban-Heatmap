import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Thermometer, TreePine, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { CityData } from '../types/city';
import { analyzeCityWithGemini } from '../services/geminiService';
import { renderMarkdown } from '../utils/markdown';

interface CitySearchProps {
  onCitySelect?: (data: CityData) => void;
  onSearch?: (query: string) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect, onSearch }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [renderedAnalysis, setRenderedAnalysis] = useState('');

  useEffect(() => {
    const renderAnalysis = async () => {
      if (analysis) {
        const html = await renderMarkdown(analysis);
        setRenderedAnalysis(html);
      } else {
        setRenderedAnalysis('');
      }
    };
    renderAnalysis().catch(console.error);
  }, [analysis]);

  const handleAnalyzeCity = async () => {
    if (!cityData) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeCityWithGemini(cityData);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing city:', error);
      setError('Failed to analyze city data. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;
    
    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    // Only proceed with local search if onCitySelect is provided
    if (!onCitySelect) return;
    
    setIsLoading(true);
    setError(null);
    setCityData(null);
    
    try {
      const response = await axios.get<CityData>('http://localhost:8000/api/city/search/', {
        params: { 
          city_name: query,
          generate_data: true,
          num_hotspots: 100
        }
      });
      setCityData(response.data);
      if (onCitySelect) {
        onCitySelect(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch city data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="city-search w-full">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any city (e.g., Mumbai, London, Tokyo)..."
          className="px-4 py-2 border border-emerald-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {!analysis ? (
        <button
          onClick={handleAnalyzeCity}
          disabled={!cityData || isAnalyzing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Get AI Analysis
            </>
          )}
        </button>
      ) : (
        <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI-Powered City Analysis
            </h3>
            <button
              onClick={() => setAnalysis(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: renderedAnalysis }} 
          />
        </div>
      )}

      {cityData && (
        <div className="space-y-6 animate-fadeIn">
          {/* City Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">{cityData.city}</h2>
                <div className="flex items-center gap-4 text-sm text-emerald-700">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{cityData.latitude.toFixed(4)}°, {cityData.longitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="font-semibold">{cityData.mean_temperature}°C</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-600">Hotspots Generated</p>
                <p className="text-3xl font-bold text-emerald-900">{cityData.hotspots_generated}</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Average Temperature</p>
              <p className="text-2xl font-bold text-emerald-900">{cityData.statistics.average_temperature}°C</p>
              <p className="text-xs text-gray-500 mt-1">
                Range: {cityData.statistics.min_temperature}°C - {cityData.statistics.max_temperature}°C
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Vegetation Coverage</p>
              <p className="text-2xl font-bold text-green-600">
                {(cityData.statistics.average_vegetation * 100).toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${cityData.statistics.average_vegetation * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Traffic Density</p>
              <p className="text-2xl font-bold text-orange-600">
                {cityData.statistics.average_traffic.toFixed(1)}/10
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${cityData.statistics.average_traffic * 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hottest Areas */}
          {cityData.hottest_areas.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Hottest Areas
              </h3>
              <div className="space-y-3">
                {cityData.hottest_areas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{area.area_type}</p>
                      <p className="text-sm text-gray-600">{area.hotspot_count} hotspots</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{area.average_temperature}°C</p>
                      <p className="text-xs text-gray-500">Max: {area.max_temperature}°C</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {cityData.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Sustainability Recommendations
              </h3>
              <ul className="space-y-3">
                {cityData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-600 font-bold text-lg">•</span>
                    <span className="text-gray-700 text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySearch;