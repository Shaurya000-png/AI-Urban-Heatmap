import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictionPoint {
  year: number;
  temperature: number;
  scenario?: string;
}

interface FuturePredictionProps {
  futurePredictions: Array<{
    business_as_usual: PredictionPoint[];
    with_intervention: PredictionPoint[];
  }>;
  city?: string;
}

const FuturePredictionChart: React.FC<FuturePredictionProps> = ({ futurePredictions, city = 'Your Location' }) => {
  // Get the first prediction set from the array
  const predictionData = futurePredictions[0];
  
  if (!predictionData || !predictionData.business_as_usual || !predictionData.with_intervention) {
    return (
      <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
        <p className="text-orange-800">No prediction data available</p>
      </div>
    );
  }

  const businessAsUsual = predictionData.business_as_usual;
  const withIntervention = predictionData.with_intervention;
  
  const years = businessAsUsual.map(p => p.year);
  
  // Add some padding to the temperature range for better visualization
  const maxTemp = Math.max(
    ...businessAsUsual.map(p => p.temperature),
    ...withIntervention.map(p => p.temperature)
  ) + 2; // Add 2 degrees padding
  
  const minTemp = Math.min(
    ...businessAsUsual.map(p => p.temperature),
    ...withIntervention.map(p => p.temperature)
  ) - 2; // Subtract 2 degrees padding
  
  const tempRange = maxTemp - minTemp;

  // Ensure we don't divide by zero
  const getYPosition = (temp: number) => {
    const y = ((maxTemp - temp) / tempRange) * 100;
    // Ensure the value is within the chart bounds
    return Math.min(100, Math.max(0, y));
  };

  const finalYearBau = businessAsUsual[businessAsUsual.length - 1];
  const finalYearIntervention = withIntervention[withIntervention.length - 1];
  const tempDifference = finalYearBau.temperature - finalYearIntervention.temperature;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl shadow-lg p-6 border-2 border-orange-200">
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-orange-900"> Temperature Predictions (10 Years)</h3>
        </div>
        {city && <p className="text-sm text-gray-600 ml-8">Location: {city}</p>}
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-red-500 text-white rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-semibold">Without Action</p>
          </div>
          <p className="text-3xl font-bold">{finalYearBau.temperature}°C</p>
          <p className="text-xs mt-1 opacity-90">by {finalYearBau.year}</p>
        </div>

        <div className="bg-green-500 text-white rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-semibold">With Action</p>
          </div>
          <p className="text-3xl font-bold">{finalYearIntervention.temperature}°C</p>
          <p className="text-xs mt-1 opacity-90">by {finalYearIntervention.year}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-orange-200">
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
            <span>{maxTemp.toFixed(1)}°C</span>
            <span>{((maxTemp + minTemp) / 2).toFixed(1)}°C</span>
            <span>{minTemp.toFixed(1)}°C</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>

            {/* Business as Usual line */}
            <svg className="absolute inset-0 w-full h-full">
              <polyline
                points={businessAsUsual
                  .map((p, i) => {
                    const x = (i / Math.max(1, years.length - 1)) * 100; // Prevent division by zero
                    const y = getYPosition(p.temperature);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
              {businessAsUsual.map((p, i) => (
                <circle
                  key={i}
                  cx={`${(i / Math.max(1, years.length - 1)) * 100}%`}
                  cy={`${getYPosition(p.temperature)}%`}
                  r="4"
                  fill="#ef4444"
                />
              ))}
            </svg>

            {/* With Intervention line */}
            <svg className="absolute inset-0 w-full h-full">
              <polyline
                points={withIntervention
                  .map((p, i) => {
                    const x = (i / Math.max(1, years.length - 1)) * 100; // Prevent division by zero
                    const y = getYPosition(p.temperature);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              {withIntervention.map((p, i) => (
                <circle
                  key={i}
                  cx={`${(i / Math.max(1, years.length - 1)) * 100}%`}
                  cy={`${getYPosition(p.temperature)}%`}
                  r="4"
                  fill="#10b981"
                />
              ))}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-600 mt-2">
            {[years[0], years[Math.floor(years.length / 2)], years[years.length - 1]].map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-500 border-dashed border-2 border-red-500"></div>
            <span className="text-sm text-gray-700">Business as Usual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-green-500"></div>
            <span className="text-sm text-gray-700">With Green Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Impact Message */}
      <div className="mt-4 p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg">
        <p className="text-center font-semibold">
          🚨 Acting now prevents {tempDifference.toFixed(1)}°C of warming by {finalYearBau.year}!
        </p>
        <p className="text-center text-sm mt-2 opacity-90">
          That's the difference between livable and dangerous heat levels.
        </p>
      </div>
    </div>
  );
};

export default FuturePredictionChart;
