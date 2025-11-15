import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Leaf, Thermometer, Cpu, Globe } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-surface shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-text">SustainAble AI</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Urban Heatmap</span>
          </div>

          <div className="flex space-x-1">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') || isActive('/')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Thermometer className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/simulation"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/simulation')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Simulation</span>
            </Link>

            <Link
              to="/city-explorer"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/city-explorer')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>City Explorer</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Leaf className="h-4 w-4" />
              <span>About</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar