import React from 'react'

interface SimulatorControlsProps {
  treeCover: number
  solarRoof: number
  onTreeCoverChange: (value: number) => void
  onSolarRoofChange: (value: number) => void
  onReset: () => void
}

const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  treeCover,
  solarRoof,
  onTreeCoverChange,
  onSolarRoofChange,
  onReset
}) => {
  const getSliderColor = (value: number, type: 'tree' | 'solar') => {
    if (type === 'tree') {
      if (value > 60) return 'bg-green-600'
      if (value > 40) return 'bg-green-500'
      if (value > 20) return 'bg-green-400'
      return 'bg-green-300'
    } else {
      if (value > 60) return 'bg-blue-600'
      if (value > 40) return 'bg-blue-500'
      if (value > 20) return 'bg-blue-400'
      return 'bg-blue-300'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Tree Cover Percentage
          </label>
          <span className="text-lg font-semibold text-green-600">{treeCover}%</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={treeCover}
            onChange={(e) => onTreeCoverChange(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200`}
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${treeCover}%, #e5e7eb ${treeCover}%, #e5e7eb 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        <div className="mt-2 p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">
            {treeCover < 20 && "Very low tree cover - consider increasing green spaces"}
            {treeCover >= 20 && treeCover < 40 && "Moderate tree cover - good improvement opportunity"}
            {treeCover >= 40 && treeCover < 60 && "Good tree coverage - significant cooling benefits"}
            {treeCover >= 60 && "Excellent tree coverage - maximum urban cooling achieved"}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Solar Roof Percentage
          </label>
          <span className="text-lg font-semibold text-blue-600">{solarRoof}%</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={solarRoof}
            onChange={(e) => onSolarRoofChange(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200`}
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${solarRoof}%, #e5e7eb ${solarRoof}%, #e5e7eb 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            {solarRoof < 15 && "Low solar adoption - significant potential for renewable energy"}
            {solarRoof >= 15 && solarRoof < 35 && "Moderate solar coverage - good renewable energy mix"}
            {solarRoof >= 35 && solarRoof < 60 && "High solar adoption - excellent renewable energy generation"}
            {solarRoof >= 60 && "Outstanding solar coverage - maximum renewable potential"}
          </p>
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset to Default
        </button>

        <button
          onClick={() => { onTreeCoverChange(50); onSolarRoofChange(50) }}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors"
        >
          Optimal Balance
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl mb-1">🌳</div>
          <div className="text-xs text-gray-600">Trees Planted</div>
          <div className="text-lg font-semibold text-green-600">
            {Math.round(treeCover * 10)}
          </div>
          <div className="text-xs text-gray-500">per 100m²</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl mb-1">☀️</div>
          <div className="text-xs text-gray-600">Solar Panels</div>
          <div className="text-lg font-semibold text-blue-600">
            {Math.round(solarRoof * 2)}
          </div>
          <div className="text-xs text-gray-500">per 100m²</div>
        </div>
      </div>
    </div>
  )
}

export default SimulatorControls