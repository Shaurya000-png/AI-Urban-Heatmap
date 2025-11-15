import React from 'react'

const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-text mb-6">About SustainAble AI</h1>

        <div className="prose prose-green max-w-none">
          <h2 className="text-2xl font-semibold text-primary mb-4">AI-Powered Urban Heatmap</h2>

          <p className="text-gray-700 mb-6">
            SustainAble AI is an innovative web application that leverages artificial intelligence to visualize,
            predict, and simulate urban heat hotspots for sustainable city planning. By analyzing various environmental
            factors and providing what-if scenario analysis, cities can make data-driven decisions to create more
            livable and sustainable urban environments.
          </p>

          <h3 className="text-xl font-semibold text-text mb-3">Key Features</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Interactive heatmap visualization using real-time temperature data</li>
            <li>AI-powered temperature prediction based on multiple environmental factors</li>
            <li>What-if simulation tools for testing urban planning scenarios</li>
            <li>Comprehensive dashboard with city statistics and insights</li>
            <li>Data-driven recommendations for sustainable urban development</li>
          </ul>

          <h3 className="text-xl font-semibold text-text mb-3">Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-background p-4 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">Frontend</h4>
              <ul className="text-sm text-gray-600">
                <li>• React 18 with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Leaflet.js for interactive maps</li>
                <li>• Recharts for data visualization</li>
              </ul>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">Backend</h4>
              <ul className="text-sm text-gray-600">
                <li>• FastAPI with Python</li>
                <li>• PostgreSQL database</li>
                <li>• Scikit-learn for ML models</li>
                <li>• SQLAlchemy for database ORM</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-text mb-3">How It Works</h3>
          <div className="space-y-4 text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold mb-2">1. Data Collection</h4>
              <p className="text-sm">
                The system collects temperature data, vegetation indices, traffic density, and land use information
                from various sources across the city.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-secondary">
              <h4 className="font-semibold mb-2">2. AI Analysis</h4>
              <p className="text-sm">
                Machine learning models analyze the collected data to identify patterns and predict temperature
                variations across different urban environments.
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold mb-2">3. Visualization & Simulation</h4>
              <p className="text-sm">
                Interactive maps and simulation tools help city planners understand current conditions and test
                various intervention scenarios like adding green spaces or solar panels.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-text mb-3 mt-8">Sample City: Pune, India</h3>
          <p className="text-gray-700 mb-6">
            Our initial implementation focuses on Pune, India, providing detailed heat map analysis for this
            rapidly growing metropolitan area. The system includes real data from various neighborhoods including
            Koregaon Park, Kothrud, Hinjewadi, Camp, and Shivajinagar.
          </p>

          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg mt-8">
            <h3 className="text-2xl font-bold mb-3">Making Cities Cooler, Greener, and Smarter</h3>
            <p className="text-sm opacity-90">
              Join us in our mission to create more sustainable and livable cities through data-driven urban planning
              and artificial intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About