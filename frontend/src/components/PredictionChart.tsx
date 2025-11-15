import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Thermometer, AlertTriangle, Info } from 'lucide-react';
import { HeatPrediction } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionChartProps {
  predictions?: HeatPrediction[] | null;
  cityName: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ 
  predictions, 
  cityName 
}) => {
  // Ensure predictions is always an array
  const safePredictions = Array.isArray(predictions) ? predictions : [];

  // If no predictions or empty array, show message
  if (!safePredictions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Info className="w-12 h-12 mb-2" />
        <p>No prediction data available for {cityName}</p>
      </div>
    );
  }

  // Safely get chart data
  const getChartData = () => {
    try {
      return {
        labels: safePredictions
          .filter(p => p?.date)
          .map(p => new Date(p.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })),
        datasets: [
          {
            label: 'Temperature (°C)',
            data: safePredictions.map(p => p?.predictedTemp ?? 0),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Confidence',
            data: safePredictions.map(p => (p?.confidence ?? 0) * 100),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            yAxisID: 'y1',
            pointRadius: 0
          }
        ]
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return {
        labels: [],
        datasets: []
      };
    }
  };

  const data = getChartData();

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Temperature Forecast for ${cityName}`
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.dataset.label === 'Confidence' 
                ? `${context.parsed.y.toFixed(1)}%` 
                : `${context.parsed.y.toFixed(1)}°C`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Confidence (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="p-4">
      <div className="h-80">
        {data.datasets.length > 0 ? (
          <Line options={options} data={data} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Unable to display chart data
          </div>
        )}
      </div>
      {safePredictions[0]?.recommendations?.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Recommendations
          </h4>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {safePredictions[0].recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictionChart;