# Quick Start Guide: Testing the Enhanced City Search Feature

## Prerequisites

Before testing, ensure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 13+ installed (or Docker)
- ✅ Git installed

## Option 1: Quick Test with Docker (Recommended)

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Services
```bash
# From project root
docker-compose up -d
```

### Step 3: Wait for Services
```bash
# Check if services are ready (takes ~30 seconds)
docker-compose logs -f backend
# Wait until you see: "Application startup complete"
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000 or http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Step 5: Test City Search
1. Click on **"City Explorer"** in the navigation bar
2. Enter a city name (try: Mumbai, London, Tokyo, New York)
3. Click **"Search"**
4. Wait 3-5 seconds for analysis
5. View comprehensive results!

---

## Option 2: Manual Setup (Development)

### Backend Setup

#### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Setup Database
```bash
# Create PostgreSQL database
createdb sustainable_ai

# Or use the connection string in config.py
# Default: postgresql://postgres:Rizwan25@localhost:5432/sustainable_ai
```

#### 4. Seed Database (Optional - for Pune data)
```bash
cd ..
python data/seed_data.py
```

#### 5. Start Backend Server
```bash
cd backend
uvicorn main:app --reload
```

**Backend should be running at**: http://localhost:8000

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

**Frontend should be running at**: http://localhost:5173

---

## Testing the Feature

### Test 1: Search Mumbai
1. Navigate to **City Explorer** page
2. Enter: `Mumbai`
3. Click **Search**
4. **Expected Results**:
   - City: Mumbai, Maharashtra, India
   - ~100 hotspots generated
   - Average temperature: ~34°C
   - Vegetation: ~42%
   - Traffic: ~6.5/10
   - 5 hottest areas listed
   - 6-8 recommendations displayed
   - Interactive heatmap shown

### Test 2: Search London
1. Enter: `London`
2. Click **Search**
3. **Expected Results**:
   - City: London, United Kingdom
   - ~100 hotspots generated
   - Average temperature: ~20-25°C (cooler)
   - Different urban characteristics
   - Tailored recommendations

### Test 3: Search Tokyo
1. Enter: `Tokyo`
2. Click **Search**
3. **Expected Results**:
   - City: Tokyo, Japan
   - ~100 hotspots generated
   - Moderate temperatures
   - High density urban patterns
   - Specific recommendations

### Test 4: Search Dubai
1. Enter: `Dubai`
2. Click **Search**
3. **Expected Results**:
   - City: Dubai, UAE
   - ~100 hotspots generated
   - High temperatures (35-40°C)
   - Low vegetation
   - Heat mitigation recommendations

### Test 5: Try Quick Cities
1. Click on any suggested city button
2. Form should auto-submit
3. Results should display

---

## API Testing (Optional)

### Using Browser
Visit: http://localhost:8000/docs

### Using cURL

#### Search a City
```bash
curl -X GET "http://localhost:8000/api/city/search/?city_name=Mumbai&generate_data=true&num_hotspots=100"
```

#### Get City Hotspots
```bash
curl -X GET "http://localhost:8000/api/city/hotspots/Mumbai?limit=50"
```

#### Delete City Data (for regeneration)
```bash
curl -X DELETE "http://localhost:8000/api/city/hotspots/Mumbai"
```

### Using Postman
1. Import collection from API docs
2. Test endpoints with different parameters

---

## Verification Checklist

### Backend ✅
- [ ] Server starts without errors
- [ ] `/api/city/search/` endpoint responds
- [ ] Hotspots are generated (check database)
- [ ] Statistics are calculated correctly
- [ ] Recommendations are returned
- [ ] Error handling works (try invalid city)

### Frontend ✅
- [ ] City Explorer page loads
- [ ] Search form submits
- [ ] Loading state shows
- [ ] Results display correctly
- [ ] Statistics cards render
- [ ] Hottest areas list shows
- [ ] Recommendations display
- [ ] Heatmap loads (if hotspots available)
- [ ] Error messages show for invalid cities
- [ ] Responsive on mobile

### Integration ✅
- [ ] Frontend calls backend API
- [ ] Data flows correctly
- [ ] Heatmap displays hotspots
- [ ] Navigation works
- [ ] Multiple searches work
- [ ] Cached searches are faster

---

## Common Issues & Solutions

### Issue 1: Backend Won't Start
**Error**: `ModuleNotFoundError: No module named 'geopy'`

**Solution**:
```bash
pip install -r requirements.txt
```

### Issue 2: Database Connection Error
**Error**: `could not connect to server`

**Solution**:
- Check PostgreSQL is running
- Verify connection string in `backend/config.py`
- Update credentials if needed

### Issue 3: Frontend Can't Connect to Backend
**Error**: `Network Error` or `CORS error`

**Solution**:
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify API URL in frontend code

### Issue 4: City Not Found
**Error**: `City 'XYZ' not found`

**Solution**:
- Check spelling
- Try with country name: "Paris, France"
- Use major city names

### Issue 5: Earth Engine Error
**Error**: `Earth Engine initialization failed`

**Solution**:
- This is non-critical - system will use fallback
- For full functionality, authenticate Earth Engine:
```bash
earthengine authenticate
```

### Issue 6: Slow Response
**Issue**: Search takes >10 seconds

**Solution**:
- First search is slower (geocoding + generation)
- Subsequent searches use cache (<1s)
- Reduce `num_hotspots` parameter if needed

---

## Performance Benchmarks

### Expected Response Times
- **First search**: 3-5 seconds
  - Geocoding: ~1s
  - Satellite data: ~1-2s
  - Hotspot generation: ~1s
  - Database save: ~0.5s

- **Cached search**: <1 second
  - Database retrieval only

### Resource Usage
- **Memory**: ~200MB (backend)
- **Database**: ~1MB per 100 hotspots
- **Network**: ~5KB per response

---

## Advanced Testing

### Test Different Parameters

#### Generate More Hotspots
```bash
curl -X GET "http://localhost:8000/api/city/search/?city_name=Mumbai&num_hotspots=500"
```

#### Skip Data Generation
```bash
curl -X GET "http://localhost:8000/api/city/search/?city_name=Mumbai&generate_data=false"
```

### Test Error Handling

#### Invalid City
```bash
curl -X GET "http://localhost:8000/api/city/search/?city_name=InvalidCityXYZ123"
```
**Expected**: 404 error with message

#### Out of Range Hotspots
```bash
curl -X GET "http://localhost:8000/api/city/search/?city_name=Mumbai&num_hotspots=1000"
```
**Expected**: Validation error (max 500)

---

## Database Verification

### Check Generated Data
```sql
-- Connect to database
psql -U postgres -d sustainable_ai

-- View cities in database
SELECT DISTINCT city, COUNT(*) as hotspot_count 
FROM hotspots 
GROUP BY city;

-- View hotspots for specific city
SELECT * FROM hotspots WHERE city LIKE '%Mumbai%' LIMIT 10;

-- Check temperature distribution
SELECT 
    city,
    AVG(temperature) as avg_temp,
    MAX(temperature) as max_temp,
    MIN(temperature) as min_temp
FROM hotspots
GROUP BY city;
```

---

## Troubleshooting Commands

### Check Services Status
```bash
# Docker
docker-compose ps

# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean Restart
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (clears database)
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## Success Indicators

You'll know it's working when:

✅ **Backend**:
- Server starts without errors
- API docs accessible at `/docs`
- City search returns comprehensive JSON

✅ **Frontend**:
- City Explorer page loads
- Search form is interactive
- Results display beautifully
- Heatmap renders

✅ **Integration**:
- Search completes in 3-5 seconds
- All sections populate with data
- Recommendations are relevant
- Heatmap shows markers

---

## Next Steps

After successful testing:

1. **Try Multiple Cities**: Test global coverage
2. **Compare Results**: See how different cities differ
3. **Explore Heatmap**: Click on hotspot markers
4. **Read Recommendations**: Understand sustainability advice
5. **Check Database**: Verify data persistence
6. **Test Edge Cases**: Invalid inputs, special characters
7. **Performance Test**: Multiple rapid searches
8. **Mobile Test**: Check responsive design

---

## Getting Help

### Resources
- **API Documentation**: http://localhost:8000/docs
- **Feature Documentation**: `CITY_SEARCH_FEATURE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Comparison**: `BEFORE_AFTER_COMPARISON.md`

### Debug Mode
Enable verbose logging:
```python
# In backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Contact
For issues:
1. Check backend logs
2. Check frontend console (F12)
3. Review error messages
4. Check database connectivity

---

## Quick Test Script

Save as `test_city_search.sh`:
```bash
#!/bin/bash

echo "Testing City Search Feature..."

# Test 1: Mumbai
echo "\n1. Testing Mumbai..."
curl -s "http://localhost:8000/api/city/search/?city_name=Mumbai" | jq '.city, .hotspots_generated, .statistics.average_temperature'

# Test 2: London
echo "\n2. Testing London..."
curl -s "http://localhost:8000/api/city/search/?city_name=London" | jq '.city, .hotspots_generated, .statistics.average_temperature'

# Test 3: Tokyo
echo "\n3. Testing Tokyo..."
curl -s "http://localhost:8000/api/city/search/?city_name=Tokyo" | jq '.city, .hotspots_generated, .statistics.average_temperature'

echo "\n✅ All tests complete!"
```

Run with:
```bash
chmod +x test_city_search.sh
./test_city_search.sh
```

---

**Happy Testing! 🚀**

For any issues, refer to the comprehensive documentation files included in the project.
