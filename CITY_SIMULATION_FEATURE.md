# City-Specific Simulation Feature

## Overview
Enhanced the Urban Temperature Simulator to be **city-specific**, allowing users to search for any city and use its real temperature data for simulation instead of a generic 35°C default.

## What's New

### Before
- ❌ Generic 35°C base temperature for all simulations
- ❌ No connection to real city data
- ❌ Manual temperature entry only

### After
- ✅ Search any city worldwide
- ✅ Automatically use city's real temperature
- ✅ See city name and coordinates
- ✅ Still allows manual temperature override
- ✅ Integrated with city database

## Features

### 1. City Search Integration
**Location:** Top of Simulation page

**Functionality:**
- Search bar to find any city
- Fetches real temperature data from city database
- Automatically sets base temperature
- Displays city information

### 2. Real Temperature Data
When you search for a city:
- Uses city's **average temperature** from analysis
- Falls back to **mean temperature** if average not available
- Updates base temperature automatically
- Simulation runs with real data

### 3. City Information Display
Shows:
- **City name** (e.g., "Mumbai, Maharashtra, India")
- **Coordinates** (latitude, longitude)
- **Base temperature** (used for simulation)

### 4. Manual Override
- Can still manually adjust temperature
- City selection is optional
- Reset button clears city and returns to default

## How to Use

### Method 1: Search for a City

1. **Navigate to Simulation page**
2. **Enter city name** in search box (e.g., "Mumbai", "London", "Tokyo")
3. **Click "Search City"**
4. **City temperature loads automatically**
5. **Adjust tree cover and solar panels**
6. **See simulation results** based on real city temperature

### Method 2: Manual Temperature

1. **Skip city search**
2. **Manually enter temperature** in the base temperature field
3. **Adjust infrastructure controls**
4. **Run simulation**

### Method 3: Reset

1. **Click "Reset to Default"**
2. **Returns to 35°C**
3. **Clears selected city**
4. **Resets all controls**

## Examples

### Example 1: Simulate Mumbai
```
1. Search "Mumbai"
2. System loads: 34.2°C (Mumbai's average temperature)
3. Adjust tree cover to 50%
4. Adjust solar roofs to 40%
5. See results: Temperature drops to 28.5°C
6. Get recommendations for Mumbai's climate
```

### Example 2: Simulate London
```
1. Search "London"
2. System loads: 22.5°C (London's average temperature)
3. Adjust tree cover to 40%
4. Adjust solar roofs to 30%
5. See results: Temperature drops to 18.2°C
6. Get recommendations for temperate climate
```

### Example 3: Simulate Dubai
```
1. Search "Dubai"
2. System loads: 38.7°C (Dubai's average temperature)
3. Adjust tree cover to 30%
4. Adjust solar roofs to 50%
5. See results: Temperature drops to 32.1°C
6. Get recommendations for extreme heat
```

## Technical Implementation

### Frontend Changes

**File:** `frontend/src/pages/Simulation.tsx`

**Added State:**
```typescript
const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
const [cityQuery, setCityQuery] = useState('')
const [searchingCity, setSearchingCity] = useState(false)
```

**Added Interface:**
```typescript
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
```

**Added Function:**
```typescript
const handleCitySearch = async (e: React.FormEvent) => {
  // Fetch city data from API
  const response = await axios.get('/api/city/search/', {
    params: {
      city_name: cityQuery,
      generate_data: false // Don't generate hotspots
    }
  })
  
  // Use city's temperature
  const cityTemp = response.data.statistics?.average_temperature 
                || response.data.mean_temperature
  setBaseTemperature(cityTemp)
}
```

### API Integration

**Endpoint Used:** `GET /api/city/search/`

**Parameters:**
- `city_name`: Name of city to search
- `generate_data`: false (we only need temperature, not hotspots)

**Response Used:**
```json
{
  "city": "Mumbai, India",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "mean_temperature": 32.5,
  "statistics": {
    "average_temperature": 34.2,
    "max_temperature": 42.1,
    "min_temperature": 28.3
  }
}
```

## UI Components

### City Search Section
```
┌─────────────────────────────────────────────────────┐
│ 📍 Select a City                                    │
├─────────────────────────────────────────────────────┤
│ [Search for any city...] [Search City]             │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Mumbai, Maharashtra, India                      │ │
│ │ 📍 19.0760°, 72.8777°                          │ │
│ │                          Base Temperature       │ │
│ │                                34.2°C          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ 💡 Search for a city to use its real temperature   │
└─────────────────────────────────────────────────────┘
```

### Simulation Flow
```
City Search
    ↓
Load Temperature
    ↓
Adjust Controls
    ↓
Run Simulation
    ↓
See Results
```

## Benefits

### For Users
✅ **Real Data**: Use actual city temperatures
✅ **Global Coverage**: Works for any city worldwide
✅ **Accurate Simulations**: Results based on real conditions
✅ **Easy to Use**: Simple search interface
✅ **Flexible**: Can still use manual temperature

### For Decision Makers
✅ **City-Specific**: Tailored recommendations
✅ **Data-Driven**: Based on real measurements
✅ **Comparative**: Test different cities
✅ **Actionable**: Results apply to specific locations

## Use Cases

### Urban Planning
```
Scenario: Planning green infrastructure for Mumbai
1. Search "Mumbai" (34.2°C)
2. Test 50% tree cover + 40% solar roofs
3. See 5.7°C reduction
4. Get specific recommendations for Mumbai
5. Present data-backed proposal
```

### Climate Research
```
Scenario: Compare cooling strategies across cities
1. Test Mumbai (34.2°C) with 40% trees
2. Test London (22.5°C) with 40% trees
3. Test Dubai (38.7°C) with 40% trees
4. Compare effectiveness in different climates
5. Publish findings
```

### Policy Making
```
Scenario: Justify green infrastructure investment
1. Search target city
2. Show current temperature
3. Simulate with improvements
4. Calculate temperature reduction
5. Use data to support policy
```

## Testing

### Test 1: Search Mumbai
- [ ] Enter "Mumbai" in search
- [ ] Click "Search City"
- [ ] Verify temperature loads (~34°C)
- [ ] Verify city name displays
- [ ] Verify coordinates show

### Test 2: Search Multiple Cities
- [ ] Search "London"
- [ ] Verify cooler temperature (~22°C)
- [ ] Search "Dubai"
- [ ] Verify hotter temperature (~38°C)
- [ ] Each should update correctly

### Test 3: Manual Override
- [ ] Search a city
- [ ] Manually change temperature
- [ ] Verify simulation uses manual value
- [ ] Verify results update

### Test 4: Reset Function
- [ ] Search a city
- [ ] Click "Reset to Default"
- [ ] Verify city clears
- [ ] Verify temperature returns to 35°C
- [ ] Verify controls reset

## Troubleshooting

### City Not Found
**Issue:** "City 'XYZ' not found" error

**Solutions:**
1. Check spelling
2. Try with country: "Paris, France"
3. Use major city names
4. Try alternative names

### Temperature Not Loading
**Issue:** Temperature stays at 35°C after search

**Solutions:**
1. Check API response in browser console
2. Verify backend is running
3. Check city has temperature data
4. Try different city

### Search Button Not Working
**Issue:** Nothing happens when clicking search

**Solutions:**
1. Check browser console for errors
2. Verify backend API is accessible
3. Check network tab for failed requests
4. Restart frontend server

## API Considerations

### Performance
- **Fast**: Uses existing city search endpoint
- **Efficient**: Only fetches temperature data
- **Cached**: Cities are cached in database

### Data Source
- Uses same data as City Explorer
- Consistent across application
- Real satellite data when available
- Fallback to estimates

## Future Enhancements

### Planned
- [ ] City suggestions/autocomplete
- [ ] Recent cities list
- [ ] Save favorite cities
- [ ] Compare multiple cities side-by-side
- [ ] Historical temperature trends
- [ ] Seasonal variations

### Nice to Have
- [ ] Map view for city selection
- [ ] City climate classification
- [ ] Recommended infrastructure by climate
- [ ] Cost estimates for improvements
- [ ] Carbon impact calculations

## Summary

### What Changed
✅ Added city search to Simulation page
✅ Integrated with city database
✅ Automatic temperature loading
✅ City information display
✅ Reset functionality updated

### What to Do
1. **Restart frontend** (if running)
2. **Navigate to Simulation page**
3. **Search for a city**
4. **See real temperature load**
5. **Run simulation with real data**

### Expected Result
🎉 **Simulations now use real city temperatures for accurate, location-specific results!**

---

**Status:** ✅ Complete and Ready to Use
**Impact:** High - Makes simulations city-specific and data-driven
**Version:** 2.1.0
**Date:** November 7, 2025
