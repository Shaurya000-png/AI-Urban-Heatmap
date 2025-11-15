# SustainAble AI - AI-Powered Urban Heatmap

🌡️ **Visualize, predict, and simulate urban heat hotspots using AI for sustainable city planning.**

An innovative full-stack web application that leverages artificial intelligence to analyze urban temperature patterns, provide real-time heat mapping, and enable what-if scenario testing for sustainable urban development.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)
![React 18](https://img.shields.io/badge/react-18-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)

## 🎯 Key Features

- **🗺️ Interactive Heatmap Visualization**: Real-time temperature mapping with Leaflet.js
- **🤖 AI-Powered Predictions**: Machine learning models for temperature forecasting
- **⚡ What-If Simulator**: Test urban planning scenarios with green infrastructure
- **📊 Comprehensive Dashboard**: Statistics, trends, and insights
- **🌳 Sustainability Focus**: Tree cover and solar roof impact analysis
- **🏙️ Real City Data**: Initial implementation focused on Pune, India

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for modern UI development
- **Tailwind CSS** for responsive, sustainable-themed styling
- **Leaflet.js** for interactive map visualization
- **Recharts** for data visualization
- **Axios** for API communication

### Backend
- **FastAPI** with Python for high-performance API
- **PostgreSQL** with SQLAlchemy ORM for data management
- **Scikit-learn** for machine learning predictions
- **TensorFlow** support for advanced AI models
- **Pydantic** for data validation

### Infrastructure
- **Docker** with multi-stage builds
- **Docker Compose** for development orchestration
- **Nginx** for production serving
- **Alembic** for database migrations

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js 18+** and npm
- **Python 3.9+**
- **PostgreSQL 13+** (or use Docker)
- **Docker & Docker Compose** (recommended)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SustainableAI.git
   cd SustainableAI
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up database**
   ```bash
   # Ensure PostgreSQL is running
   # Create database 'sustainable_ai'
   createdb sustainable_ai
   ```

4. **Configure environment variables**
   ```bash
   # Set DATABASE_URL in .env file
   DATABASE_URL=postgresql://username:password@localhost:5432/sustainable_ai
   ```

5. **Initialize database and seed data**
   ```bash
   cd ..
   python data/seed_data.py
   ```

6. **Start backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file in frontend directory
   VITE_API_URL=http://localhost:8000
   VITE_MAP_CENTER_LAT=18.5204
   VITE_MAP_CENTER_LNG=73.8567
   VITE_DEFAULT_ZOOM=12
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

#### Hotspots
- `GET /api/hotspots` - Retrieve all temperature hotspots
- `GET /api/hotspots/city/{city}` - Get hotspots for specific city
- `GET /api/hotspots/stats` - Get dashboard statistics

#### Predictions
- `POST /api/predict_heat` - Predict temperature for location
- `GET /api/model_info` - Get ML model information

#### Simulations
- `POST /api/simulate` - Run what-if simulation
- `GET /api/simulation_impacts` - Get impact formulas

## 🗂️ Project Structure

```
SustainableAI/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # FastAPI backend application
│   ├── main.py             # Application entry point
│   ├── routes/             # API route handlers
│   ├── models/             # Database and ML models
│   ├── services/           # Business logic layer
│   ├── database.py         # Database configuration
│   └── config.py           # Application settings
├── data/                   # Sample data and scripts
│   ├── pune_hotspots.csv   # Sample hotspot data
│   └── seed_data.py        # Database seeding script
├── models/                 # Trained ML models
├── docker-compose.yml      # Development orchestration
├── Dockerfile             # Production build
└── README.md              # This file
```

## 🌍 Sample Data

The application includes realistic sample data for **Pune, India**, featuring:

- **500+ temperature hotspots** across metropolitan Pune
- **8 distinct areas**: Koregaon Park, Kothrud, Hinjewadi, Camp, Shivajinagar, Aundh, Kalyani Nagar, Viman Nagar
- **Environmental factors**: vegetation index, traffic density, land use patterns
- **Temperature ranges**: 25°C - 42°C reflecting Pune's climate
- **Green spaces**: Parks and recreational areas with cooling effects

## 🤖 AI Model Features

### Temperature Prediction
- **Algorithm**: Random Forest Regressor (v1.0)
- **Features**: latitude, longitude, vegetation_index, traffic_density, land_use
- **Accuracy**: Mean Absolute Error < 2°C on training data
- **Explainability**: Feature importance tracking

### Simulation Engine
- **Tree Cover Impact**: -0.15°C per 1% (non-linear scaling)
- **Solar Roof Impact**: -0.08°C per 1% (max effect at 70%)
- **Combined Effects**: Diminishing returns when both > 40%
- **Environmental Benefits**: CO₂ reduction, energy savings calculations

## 🎨 Design System

### Sustainable Color Palette
- **Primary**: #059669 (emerald-600) - Nature and growth
- **Secondary**: #0284c7 (sky-600) - Water and sky
- **Accent**: #10b981 (emerald-500) - Fresh green
- **Background**: #f0fdf4 (green-50) - Soft natural
- **Surface**: #ffffff (white) - Clean content
- **Text**: #064e3b (emerald-900) - Dark readable

### UI Components
- **Responsive design** with Tailwind CSS
- **Interactive maps** with Leaflet.js
- **Animated dashboards** with real-time updates
- **Accessibility** features (ARIA labels, keyboard navigation)

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist

#### Backend
- [ ] Start FastAPI server: `uvicorn main:app --reload`
- [ ] Test GET `/api/hotspots` returns data
- [ ] Test POST `/api/predict_heat` with sample data
- [ ] Test POST `/api/simulate` with various scenarios
- [ ] Verify database connections and data persistence

#### Frontend
- [ ] Start React app: `npm run dev`
- [ ] Verify heatmap loads with Pune data
- [ ] Test interactive tooltips on hotspot hover
- [ ] Test simulator sliders update temperature in real-time
- [ ] Verify responsive design on different screen sizes
- [ ] Test navigation between Dashboard, Simulation, and About pages

## 🚀 Deployment

### Production with Docker

1. **Build production image**
   ```bash
   docker build -t sustainable-ai .
   ```

2. **Deploy with docker-compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

#### Render Deployment
1. **Backend**: Render web service with FastAPI
2. **Database**: Render PostgreSQL add-on
3. **Frontend**: Render static site service
4. **Environment Variables**: Configure in Render dashboard

#### Vercel + Render
1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Render
3. **API Proxy**: Configure Vercel to proxy API calls

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Backend
SECRET_KEY=your-secret-key
BACKEND_URL=http://localhost:8000

# Frontend
VITE_API_URL=http://localhost:8000
VITE_MAP_CENTER_LAT=18.5204
VITE_MAP_CENTER_LNG=73.8567
```

## 🔧 Development

### Adding New Cities

1. **Update seed data** in `data/seed_data.py`
2. **Add city coordinates** to generation logic
3. **Update frontend city filter** in `Dashboard.tsx`
4. **Retrain ML model** with new data

### Customizing AI Model

1. **Modify `backend/models/ml_model.py`**
2. **Add new features** to training data
3. **Experiment with algorithms** (RandomForest, LSTM, etc.)
4. **Update model version** in configuration

### Extending API

1. **Add new routes** in `backend/routes/`
2. **Update Pydantic models** for request/response
3. **Add corresponding frontend services**
4. **Update API documentation**

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code patterns and naming conventions
- Add tests for new features
- Update documentation
- Ensure TypeScript types are correct
- Test responsive design

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

#### Frontend Build Issues
```bash
# Clear node modules
rm -rf frontend/node_modules
cd frontend && npm install
```

#### ML Model Training Errors
```bash
# Check Python dependencies
pip install -r backend/requirements.txt

# Verify data format
python data/seed_data.py --validate-only
```

### Performance Optimization

#### Database Indexes
Ensure proper indexes on location queries:
```sql
CREATE INDEX idx_hotspots_location ON hotspots (latitude, longitude);
CREATE INDEX idx_hotspots_city ON hotspots (city);
```

#### Frontend Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large datasets
- Optimize map tile loading

#### Backend Optimization
- Add API response caching
- Implement database query optimization
- Use connection pooling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Leaflet.js** for interactive mapping
- **OpenStreetMap** for map tiles
- **Scikit-learn** for machine learning
- **FastAPI** for the backend framework
- **React** for the frontend framework

## 📞 Contact

- **Project Maintainer**: [Your Name]
- **Email**: your.email@example.com
- **Issues**: [GitHub Issues](https://github.com/your-username/SustainableAI/issues)

---

**🌍 Making cities cooler, greener, and smarter through data-driven urban planning.**