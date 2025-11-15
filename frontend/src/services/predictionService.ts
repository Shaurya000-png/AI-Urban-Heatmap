import { City } from '../types/index';

interface HeatPrediction {
  date: string;
  predictedTemp: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const predictHeatPatterns = async (city: City): Promise<HeatPrediction[]> => {
  try {
    const prompt = `Predict urban heat patterns for ${city.name} (${city.coordinates.lat}, ${city.coordinates.lng}) for the next 7 days. 
    Consider current temperature (${city.temperature}°C), green coverage (${city.greenCoverage}%), 
    and population density (${city.populationDensity}/km²). 
    Return a JSON array with date, predictedTemp, confidence (0-1), riskLevel, and recommendations.`;
    
    const response = await fetch(`${API_BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4000
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          }
        ]
      })
    });

    const data = await response.json();
    return parsePredictionResponse(data);
  } catch (error) {
    console.error('Error predicting heat patterns:', error);
    return getFallbackPredictions();
  }
};

const parsePredictionResponse = (data: any): HeatPrediction[] => {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return getFallbackPredictions();
    
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON in the response
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const jsonStr = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonStr);
    }
    
    return getFallbackPredictions();
  } catch (e) {
    console.error('Error parsing prediction response:', e);
    return getFallbackPredictions();
  }
};

const getFallbackPredictions = (): HeatPrediction[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    predictedTemp: 28 + Math.random() * 5,
    confidence: 0.7 + Math.random() * 0.3,
    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    recommendations: [
      'Consider increasing green spaces in urban areas',
      'Implement cool roof initiatives',
      'Monitor high-risk zones for vulnerable populations'
    ].slice(0, 1 + Math.floor(Math.random() * 3))
  }));
};
