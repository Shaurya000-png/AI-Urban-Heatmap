import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, Leaf, Sun, Info, MapPin } from 'lucide-react'
import { simulationApi, SimulationResponse } from '../services/api'
import SimulatorControls from '../components/SimulatorControls'
import CarbonImpactCard from '../components/CarbonImpactCard'
import CostBenefitCard from '../components/CostBenefitCard'
import FuturePredictionChart from '../components/FuturePredictionChart'
import GamificationCard from '../components/GamificationCard'
import axios from 'axios'

interface CityData {
  city: string
  latitude: number
  longitude: number
  mean_temperature: number
  statistics: {
    average_temperature: number
    max_temperature: number
    min_temperature: number
  }
}

const Simulation: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [cityQuery, setCityQuery] = useState('')
  const [searchingCity, setSearchingCity] = useState(false)
  const [baseTemperature, setBaseTemperature] = useState(35.0)
  const [treeCover, setTreeCover] = useState(30)
  const [solarRoof, setSolarRoof] = useState(25)
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [impactsData, setImpactsData] = useState<any>(null)

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityQuery.trim()) return

    try {
      setSearchingCity(true)
      setError(null)
      
      const response = await axios.get<CityData>(
        'http://localhost:8000/api/city/search/',
        {
          params: {
            city_name: cityQuery,
            generate_data: false // Don't generate hotspots, just get temperature
          }
        }
      )
      
      setSelectedCity(response.data)
      // Use the city's average temperature as base temperature
      const cityTemp = response.data.statistics?.average_temperature || response.data.mean_temperature
      setBaseTemperature(Number(cityTemp.toFixed(1)))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch city data')
    } finally {
      setSearchingCity(false)
    }
  }

  const runSimulation = async () => {
    if (!baseTemperature || baseTemperature < 20 || baseTemperature > 50) {
      setError('Please enter a valid base temperature between 20°C and 50°C')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await simulationApi.simulateTemperature({
        base_temperature: baseTemperature,
        tree_cover_percentage: treeCover,
        solar_roof_percentage: solarRoof
      })

      setSimulationResult(result)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Simulation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadImpacts = async () => {
    try {
      const data = await simulationApi.getSimulationImpacts()
      setImpactsData(data)
    } catch (err) {
      console.error('Failed to load impacts data:', err)
    }
  }

  useEffect(() => {
    loadImpacts()
  }, [])

  useEffect(() => {
    if (baseTemperature) {
      runSimulation()
    }
  }, [treeCover, solarRoof, baseTemperature])

  const handleReset = () => {
    setTreeCover(30)
    setSolarRoof(25)
    setBaseTemperature(35.0)
    setSelectedCity(null)
    setCityQuery('')
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 38) return 'text-red-600'
    if (temp > 35) return 'text-orange-600'
    if (temp > 32) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getTemperatureBackground = (temp: number) => {
    if (temp > 38) return 'bg-red-50 border-red-200'
    if (temp > 35) return 'bg-orange-50 border-orange-200'
    if (temp > 32) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Urban Temperature Simulator</h1>
        <p className="text-gray-600 mt-1">
          Test what-if scenarios to understand the impact of green infrastructure on urban temperatures
        </p>
      </div>

      {/* City Search Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl shadow-lg p-6 border border-emerald-200">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-emerald-900">Select a City</h3>
        </div>
        
        <form onSubmit={handleCitySearch} className="flex gap-3 mb-3">
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Search for any city (e.g., Mumbai, London, Tokyo)..."
            className="flex-1 px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={searchingCity}
          />
          <button
            type="submit"
            disabled={searchingCity}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {searchingCity ? 'Searching...' : 'Search City'}
          </button>
        </form>

        {selectedCity && (
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-emerald-900">{selectedCity.city}</p>
                <p className="text-sm text-gray-600">
                  📍 {selectedCity.latitude.toFixed(4)}°, {selectedCity.longitude.toFixed(4)}°
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Base Temperature</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {baseTemperature}°C
                </p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-emerald-700 mt-3">
          💡 Search for a city to use its real temperature data for simulation, or manually enter a temperature below.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Leaf className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-text">Infrastructure Controls</h2>
            </div>

            <SimulatorControls
              treeCover={treeCover}
              solarRoof={solarRoof}
              onTreeCoverChange={setTreeCover}
              onSolarRoofChange={setSolarRoof}
              onReset={handleReset}
            />

            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Temperature (°C)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="20"
                  max="50"
                  step="0.5"
                  value={baseTemperature}
                  onChange={(e) => setBaseTemperature(Number(e.target.value))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="text-sm text-gray-500">Current average temperature</div>
              </div>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Enter the current average temperature for your target area. This represents the baseline
                  temperature before applying green infrastructure improvements.
                </p>
              </div>
            </div>
          </div>

          {impactsData && (
            <div className="bg-surface rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-semibold text-text">Impact Formulas</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Temperature Reduction Rules</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Tree Cover Impact:</span>
                      <span className="text-sm text-green-600">
                        {impactsData.impact_formula.tree_cover}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Solar Roof Impact:</span>
                      <span className="text-sm text-blue-600">
                        {impactsData.impact_formula.solar_roof}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-700">Combined Effect:</span>
                      <span className="text-sm text-purple-600">
                        {impactsData.impact_formula.combined_effect}
                      </span>
                    </div>
                  </div>
                </div>

                {impactsData.sample_scenarios && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Sample Scenarios</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Trees</th>
                            <th className="text-left py-2">Solar</th>
                            <th className="text-left py-2">Temperature Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {impactsData.sample_scenarios.map((scenario: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{scenario.tree_cover_percentage}%</td>
                              <td className="py-2">{scenario.solar_roof_percentage}%</td>
                              <td className="py-2">
                                <span className={scenario.temperature_change_celsius < -1 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                  {scenario.temperature_change_celsius > 0 ? '+' : ''}{scenario.temperature_change_celsius}°C
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          {simulationResult && (
            <div className={`rounded-lg shadow-lg p-6 border-2 ${getTemperatureBackground(simulationResult.adjusted_temperature)}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text">Simulation Results</h2>
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <span className={getTemperatureColor(simulationResult.adjusted_temperature)}>
                      {simulationResult.adjusted_temperature}°C
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">New Temperature</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Original</div>
                    <div className="text-lg font-semibold">{baseTemperature}°C</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Change</div>
                    <div className={`text-lg font-semibold flex items-center ${
                      simulationResult.temperature_change < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {simulationResult.temperature_change > 0 ? '+' : ''}
                      {simulationResult.temperature_change}°C
                      {simulationResult.temperature_change < 0 && (
                        <TrendingDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Infrastructure Impact</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Trees ({treeCover}%)</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        -{(0.15 * treeCover).toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Solar ({solarRoof}%)</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        -{(0.08 * solarRoof).toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>

                {simulationResult.recommendations && simulationResult.recommendations.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Recommendations</div>
                    <div className="space-y-2">
                      {simulationResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-700">💡 {recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(treeCover * 10)}
                      </div>
                      <div className="text-xs text-green-700">Trees per 100m²</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(solarRoof * 2)}
                      </div>
                      <div className="text-xs text-blue-700">Panels per 100m²</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Sustainability Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Reduced energy consumption for cooling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Improved air quality through vegetation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Renewable energy generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Enhanced urban biodiversity</span>
              </div>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Enhanced Impact Visualizations */}
      {simulationResult && simulationResult.carbon_impact && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Detailed Impact Analysis</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbon Impact */}
            <CarbonImpactCard carbonImpact={simulationResult.carbon_impact} />
            
            {/* Cost-Benefit Analysis */}
            {simulationResult.cost_benefit && (
              <CostBenefitCard costBenefit={simulationResult.cost_benefit} />
            )}
          </div>

          {/* Future Predictions */}
          {simulationResult.future_predictions && (
            <FuturePredictionChart 
              futurePredictions={simulationResult.future_predictions} 
              city={selectedCity?.city} 
            />
          )}

          {/* Gamification */}
          {simulationResult.gamification && (
            <GamificationCard gamification={simulationResult.gamification} />
          )}
        </div>
      )}
    </div>
  )
}

export default Simulation