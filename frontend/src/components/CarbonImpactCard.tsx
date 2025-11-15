import React from 'react';
import { Leaf, Car, Home, TrendingDown } from 'lucide-react';

interface CarbonImpactProps {
  carbonImpact: {
    trees_planted: number;
    co2_absorbed_trees_tons: number;
    solar_panels_m2: number;
    co2_prevented_solar_tons: number;
    total_co2_offset_tons: number;
    equivalent_cars_removed: number;
    equivalent_homes_powered: number;
    temperature_reduction: number;
  };
}

const CarbonImpactCard: React.FC<CarbonImpactProps> = ({ carbonImpact }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-green-900">Carbon Impact</h3>
      </div>

      {/* Total CO2 Offset - Hero Metric */}
      <div className="bg-white rounded-lg p-6 mb-4 text-center border-2 border-green-300">
        <p className="text-sm text-gray-600 mb-1">Total CO₂ Offset</p>
        <p className="text-5xl font-bold text-green-600">
          {carbonImpact.total_co2_offset_tons.toLocaleString()}
        </p>
        <p className="text-lg text-gray-700 mt-1">tons per year</p>
      </div>

      {/* Impact Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-gray-700">Trees</p>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {carbonImpact.trees_planted.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {carbonImpact.co2_absorbed_trees_tons.toLocaleString()} tons CO₂/year
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 text-yellow-600">☀️</div>
            <p className="text-xs font-semibold text-gray-700">Solar</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {Math.round(carbonImpact.solar_panels_m2).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            m² panels
          </p>
        </div>
      </div>

      {/* Equivalents */}
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Cars Removed</p>
                <p className="text-xs text-gray-600">from roads annually</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {carbonImpact.equivalent_cars_removed.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Homes Powered</p>
                <p className="text-xs text-gray-600">by solar energy</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {carbonImpact.equivalent_homes_powered.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Temperature Drop</p>
                <p className="text-xs opacity-90">cooling achieved</p>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {carbonImpact.temperature_reduction}°C
            </p>
          </div>
        </div>
      </div>

      {/* Impact Message */}
      <div className="mt-4 p-3 bg-green-600 text-white rounded-lg text-center">
        <p className="text-sm font-semibold">
          🌍 This is equivalent to planting a forest the size of{' '}
          {Math.round(carbonImpact.trees_planted / 100)} football fields!
        </p>
      </div>
    </div>
  );
};

export default CarbonImpactCard;
