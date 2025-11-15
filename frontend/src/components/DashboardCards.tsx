import React from 'react'
import { Thermometer, MapPin, TrendingUp, AlertTriangle } from 'lucide-react'
import { HotspotStats } from '../services/api'

interface DashboardCardsProps {
  stats: HotspotStats | null
  loading: boolean
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 38) return 'text-red-600'
    if (temp > 35) return 'text-orange-600'
    if (temp > 32) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getHotspotLevel = () => {
    if (stats.max_temperature > 42) return { level: 'Extreme', color: 'text-red-600', bg: 'bg-red-100' }
    if (stats.max_temperature > 38) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (stats.max_temperature > 35) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Normal', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const hotspotLevel = getHotspotLevel()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-surface rounded-lg shadow-lg p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Average Temperature</p>
            <p className={`text-2xl font-bold ${getTemperatureColor(stats.average_temperature)}`}>
              {stats.average_temperature}°C
            </p>
            <p className="text-xs text-gray-500">Across all monitored areas</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Thermometer className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-lg p-6 border-l-4 border-secondary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Hotspots</p>
            <p className="text-2xl font-bold text-text">{stats.total_hotspots.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Active monitoring points</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <MapPin className="h-6 w-6 text-secondary" />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-lg p-6 border-l-4 border-accent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Cities Covered</p>
            <p className="text-2xl font-bold text-text">{stats.cities_count}</p>
            <p className="text-xs text-gray-500">Urban areas monitored</p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-lg p-6 border-l-4 border-orange-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Heat Level</p>
            <p className={`text-2xl font-bold ${hotspotLevel.color}`}>{hotspotLevel.level}</p>
            <p className="text-xs text-gray-500">Max: {stats.max_temperature}°C</p>
          </div>
          <div className={`p-3 rounded-full ${hotspotLevel.bg}`}>
            <AlertTriangle className={`h-6 w-6 ${hotspotLevel.color}`} />
          </div>
        </div>
      </div>

      {stats.hottest_cities && stats.hottest_cities.length > 0 && (
        <div className="bg-surface rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-4">
          <h3 className="text-lg font-semibold text-text mb-4">Hottest Cities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.hottest_cities.map((city, index) => (
              <div key={city.city} className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">#{index + 1}</div>
                <div className="font-medium text-text">{city.city}</div>
                <div className={`text-lg font-semibold ${getTemperatureColor(city.average_temperature)}`}>
                  {city.average_temperature}°C
                </div>
                <div className="text-xs text-gray-500">{city.hotspot_count} hotspots</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardCards