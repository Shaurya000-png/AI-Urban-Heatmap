const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const analyzeCityWithGemini = async (cityData: any): Promise<string> => {
  try {
    const prompt = `Analyze this city's heat data and provide concise recommendations in markdown format. Use bullet points and keep it brief.
    
    City: ${cityData.city}
    Location: ${cityData.latitude}, ${cityData.longitude}
    Avg Temp: ${cityData.statistics.average_temperature}°C
    Vegetation: ${(cityData.statistics.average_vegetation * 100).toFixed(1)}%
    Traffic: ${cityData.statistics.average_traffic.toFixed(1)}/10
    Hotspots: ${cityData.hotspots_generated}
    
    Format your response as:
    ### Key Findings
    - 2-3 bullet points about heat patterns
    - 1-2 points on urban heat island effect
    
    ### Top Recommendations
    - 3-5 actionable items with highest impact
    - Focus on quick wins first
    
    ### Long-term Solutions
    - 2-3 strategic improvements
    - Include potential impact`;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available.';
  } catch (error) {
    console.error('Error analyzing city with Gemini:', error);
    return 'Unable to generate analysis at this time. Please try again later.';
  }
};

export const getSimulationInsights = async (simulationData: any): Promise<string> => {
  try {
    const prompt = `Analyze these simulation results and provide key insights in markdown format. Be concise and focus on actionable items.
    
    ### Simulation Results
    - Original: ${simulationData.base_temperature}°C
    - New: ${simulationData.adjusted_temperature}°C
    - Change: ${simulationData.temperature_change}°C
    - Tree Cover: ${simulationData.tree_cover_percentage}%
    - Solar Roofs: ${simulationData.solar_roof_percentage}%
    
    ### Key Takeaways
    - 2-3 bullet points on impact
    - 1-2 points on cost-effectiveness
    
    ### Next Steps
    - 2-3 specific recommendations
    - Estimated benefits/impact`;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No simulation insights available.';
  } catch (error) {
    console.error('Error getting simulation insights:', error);
    return 'Unable to generate simulation insights at this time.';
  }
};
// In src/services/geminiService.ts
import { CityData } from '../types/city';

export const generateComparisonAnalysis = async (cities: CityData[]): Promise<string> => {
  try {
    // This is a mock implementation - replace with actual API call to your AI service
    const cityNames = cities.map(c => c.city).join(', ');
    const hotspotsCount = cities.reduce((sum, city) => sum + city.hotspots.length, 0);
    const avgTemp = cities.reduce((sum, city) => {
      const temps = city.hotspots.map(h => h.temperature);
      return sum + (temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0);
    }, 0) / cities.length;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return `# Comparative Analysis: ${cityNames}

## Overview
- **Cities Compared**: ${cities.length}
- **Total Hotspots Analyzed**: ${hotspotsCount}
- **Average Temperature Across Cities**: ${avgTemp.toFixed(1)}°C

## Key Findings
1. **Temperature Patterns**: 
   - ${cities[0].city} shows ${cities[0].hotspots.length > cities[1]?.hotspots.length ? 'higher' : 'lower'} hotspot concentration.
   - Temperature variance is ${cities[0].hotspots.length > 10 ? 'significant' : 'moderate'}.

2. **Risk Assessment**:
   - ${cities[0].city} has ${cities[0].hotspots.length} hotspots, compared to ${cities[1]?.hotspots.length || 0} in ${cities[1]?.city || 'the other city'}.
   - Areas with higher building density show increased heat retention.

## Recommendations
1. **Urban Planning**:
   - Increase green spaces in high-temperature zones.
   - Implement cool roof initiatives in ${cities[0].city}.

2. **Infrastructure**:
   - Consider heat-reflective materials for new constructions.
   - Expand tree canopy in urban centers.

3. **Public Health**:
   - Issue heat advisories during peak temperature periods.
   - Establish cooling centers in identified hotspots.

*This analysis is based on current heat data and predictive modeling. For detailed urban planning, consult with local environmental experts.*`;
  } catch (error) {
    console.error('Error generating comparison analysis:', error);
    return 'Unable to generate comparison analysis at this time. Please try again later.';
  }
};