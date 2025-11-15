"""
Impact Calculator Service
Calculates carbon impact, cost-benefit analysis, and environmental metrics
"""

from typing import Dict, Any, List
import math

class ImpactCalculator:
    """Calculate environmental and economic impact of green infrastructure"""
    
    # Constants based on research
    CO2_PER_TREE_PER_YEAR = 22  # kg CO2 absorbed per tree per year
    TREES_PER_100M2 = 10  # Average trees per 100m² of green cover
    CO2_PER_KWH_SOLAR = 0.92  # kg CO2 prevented per kWh from solar
    SOLAR_KWH_PER_M2_PER_YEAR = 150  # kWh generated per m² per year
    
    # Cost estimates (USD)
    COST_PER_TREE = 100  # Including planting and 3-year maintenance
    COST_PER_M2_SOLAR = 150  # Solar panel installation per m²
    
    # Benefits (USD per year)
    ENERGY_SAVINGS_PER_DEGREE = 50  # Per household per degree reduction
    HEALTH_SAVINGS_PER_DEGREE = 75  # Reduced heat-related illness per capita
    PROPERTY_VALUE_INCREASE = 0.05  # 5% increase with green infrastructure
    
    @staticmethod
    def calculate_carbon_impact(
        city_area_km2: float,
        tree_cover_percentage: float,
        solar_roof_percentage: float,
        temperature_reduction: float
    ) -> Dict[str, Any]:
        """
        Calculate carbon impact of green infrastructure
        
        Args:
            city_area_km2: City area in square kilometers
            tree_cover_percentage: Percentage of tree cover (0-100)
            solar_roof_percentage: Percentage of solar roofs (0-100)
            temperature_reduction: Temperature reduction achieved (°C)
        
        Returns:
            Dictionary with carbon impact metrics
        """
        # Calculate tree impact
        tree_area_m2 = city_area_km2 * 1_000_000 * (tree_cover_percentage / 100)
        num_trees = (tree_area_m2 / 100) * ImpactCalculator.TREES_PER_100M2
        co2_trees_tons = (num_trees * ImpactCalculator.CO2_PER_TREE_PER_YEAR) / 1000
        
        # Calculate solar impact
        solar_area_m2 = city_area_km2 * 1_000_000 * (solar_roof_percentage / 100) * 0.3  # 30% of area is rooftops
        solar_kwh_year = solar_area_m2 * ImpactCalculator.SOLAR_KWH_PER_M2_PER_YEAR
        co2_solar_tons = (solar_kwh_year * ImpactCalculator.CO2_PER_KWH_SOLAR) / 1000
        
        # Total carbon offset
        total_co2_tons = co2_trees_tons + co2_solar_tons
        
        # Equivalent metrics (for impact visualization)
        cars_equivalent = int(total_co2_tons / 4.6)  # Average car emits 4.6 tons/year
        homes_powered = int(solar_kwh_year / 10_000)  # Average home uses 10,000 kWh/year
        
        return {
            "trees_planted": int(num_trees),
            "co2_absorbed_trees_tons": round(co2_trees_tons, 2),
            "solar_panels_m2": round(solar_area_m2, 2),
            "co2_prevented_solar_tons": round(co2_solar_tons, 2),
            "total_co2_offset_tons": round(total_co2_tons, 2),
            "equivalent_cars_removed": cars_equivalent,
            "equivalent_homes_powered": homes_powered,
            "temperature_reduction": round(temperature_reduction, 1)
        }
    
    @staticmethod
    def calculate_cost_benefit(
        city_area_km2: float,
        population: int,
        tree_cover_percentage: float,
        solar_roof_percentage: float,
        temperature_reduction: float,
        avg_property_value: float = 200_000
    ) -> Dict[str, Any]:
        """
        Calculate cost-benefit analysis of green infrastructure
        
        Args:
            city_area_km2: City area in square kilometers
            population: City population
            tree_cover_percentage: Percentage of tree cover (0-100)
            solar_roof_percentage: Percentage of solar roofs (0-100)
            temperature_reduction: Temperature reduction achieved (°C)
            avg_property_value: Average property value in USD
        
        Returns:
            Dictionary with cost-benefit metrics
        """
        # Calculate costs
        tree_area_m2 = city_area_km2 * 1_000_000 * (tree_cover_percentage / 100)
        num_trees = (tree_area_m2 / 100) * ImpactCalculator.TREES_PER_100M2
        tree_cost = num_trees * ImpactCalculator.COST_PER_TREE
        
        solar_area_m2 = city_area_km2 * 1_000_000 * (solar_roof_percentage / 100) * 0.3
        solar_cost = solar_area_m2 * ImpactCalculator.COST_PER_M2_SOLAR
        
        total_investment = tree_cost + solar_cost
        
        # Calculate annual benefits
        num_households = population / 3  # Average 3 people per household
        energy_savings = num_households * ImpactCalculator.ENERGY_SAVINGS_PER_DEGREE * temperature_reduction
        health_savings = population * ImpactCalculator.HEALTH_SAVINGS_PER_DEGREE * temperature_reduction
        
        # Property value increase (one-time)
        num_properties = num_households
        property_value_increase = num_properties * avg_property_value * ImpactCalculator.PROPERTY_VALUE_INCREASE
        
        # Solar energy revenue (assuming $0.10 per kWh)
        solar_kwh_year = solar_area_m2 * ImpactCalculator.SOLAR_KWH_PER_M2_PER_YEAR
        solar_revenue = solar_kwh_year * 0.10
        
        total_annual_benefits = energy_savings + health_savings + solar_revenue
        
        # Calculate ROI
        payback_years = total_investment / total_annual_benefits if total_annual_benefits > 0 else 0
        roi_10_years = ((total_annual_benefits * 10) - total_investment) / total_investment * 100 if total_investment > 0 else 0
        
        return {
            "investment": {
                "tree_planting": round(tree_cost, 2),
                "solar_installation": round(solar_cost, 2),
                "total_investment": round(total_investment, 2)
            },
            "annual_benefits": {
                "energy_savings": round(energy_savings, 2),
                "health_savings": round(health_savings, 2),
                "solar_revenue": round(solar_revenue, 2),
                "total_annual": round(total_annual_benefits, 2)
            },
            "one_time_benefits": {
                "property_value_increase": round(property_value_increase, 2)
            },
            "roi_metrics": {
                "payback_period_years": round(payback_years, 1),
                "roi_10_years_percent": round(roi_10_years, 1),
                "net_benefit_10_years": round((total_annual_benefits * 10) - total_investment, 2)
            }
        }
    
    @staticmethod
    def predict_future_temperature(
        current_temp: float,
        years_ahead: int = 10,
        climate_change_rate: float = 0.2,  # °C per decade
        with_intervention: bool = False,
        intervention_reduction: float = 0
    ) -> List[Dict[str, Any]]:
        """
        Predict future temperature trends
        
        Args:
            current_temp: Current average temperature
            years_ahead: Number of years to predict
            climate_change_rate: Temperature increase per decade due to climate change
            with_intervention: Whether green infrastructure is implemented
            intervention_reduction: Temperature reduction from intervention
        
        Returns:
            List of yearly predictions
        """
        predictions = []
        
        for year in range(years_ahead + 1):
            # Base climate change increase
            climate_increase = (climate_change_rate / 10) * year
            
            if with_intervention:
                # With intervention: initial reduction, then gradual climate change
                predicted_temp = current_temp - intervention_reduction + (climate_increase * 0.5)  # 50% mitigation
            else:
                # Without intervention: full climate change impact
                predicted_temp = current_temp + climate_increase
            
            predictions.append({
                "year": 2025 + year,
                "temperature": round(predicted_temp, 1),
                "scenario": "with_intervention" if with_intervention else "business_as_usual"
            })
        
        return predictions
    
    @staticmethod
    def calculate_gamification_score(
        temperature_reduction: float,
        co2_offset: float,
        tree_cover: float,
        solar_coverage: float
    ) -> Dict[str, Any]:
        """
        Calculate gamification score and achievements
        
        Args:
            temperature_reduction: Temperature reduction achieved
            co2_offset: CO2 offset in tons
            tree_cover: Tree cover percentage
            solar_coverage: Solar coverage percentage
        
        Returns:
            Dictionary with score and achievements
        """
        # Calculate base score (0-1000)
        temp_score = min(temperature_reduction * 50, 300)  # Max 300 points
        carbon_score = min(co2_offset / 100, 300)  # Max 300 points
        green_score = min((tree_cover + solar_coverage) * 2, 400)  # Max 400 points
        
        total_score = int(temp_score + carbon_score + green_score)
        
        # Determine level
        if total_score >= 900:
            level = "Climate Champion"
            level_icon = "🏆"
        elif total_score >= 700:
            level = "Green Leader"
            level_icon = "🌟"
        elif total_score >= 500:
            level = "Eco Warrior"
            level_icon = "💚"
        elif total_score >= 300:
            level = "Climate Activist"
            level_icon = "🌱"
        else:
            level = "Getting Started"
            level_icon = "🌿"
        
        # Achievements
        achievements = []
        
        if temperature_reduction >= 5:
            achievements.append({"name": "Cool City", "icon": "❄️", "description": "Reduced temperature by 5°C+"})
        if temperature_reduction >= 10:
            achievements.append({"name": "Ice Age", "icon": "🧊", "description": "Reduced temperature by 10°C+"})
        
        if co2_offset >= 1000:
            achievements.append({"name": "Carbon Crusher", "icon": "💨", "description": "Offset 1,000+ tons CO2"})
        if co2_offset >= 10000:
            achievements.append({"name": "Climate Hero", "icon": "🦸", "description": "Offset 10,000+ tons CO2"})
        
        if tree_cover >= 50:
            achievements.append({"name": "Forest Builder", "icon": "🌳", "description": "50%+ tree cover"})
        if tree_cover >= 75:
            achievements.append({"name": "Jungle Master", "icon": "🌴", "description": "75%+ tree cover"})
        
        if solar_coverage >= 50:
            achievements.append({"name": "Solar Pioneer", "icon": "☀️", "description": "50%+ solar coverage"})
        if solar_coverage >= 75:
            achievements.append({"name": "Renewable Champion", "icon": "⚡", "description": "75%+ solar coverage"})
        
        if tree_cover >= 50 and solar_coverage >= 50:
            achievements.append({"name": "Perfect Balance", "icon": "⚖️", "description": "50%+ trees and solar"})
        
        return {
            "total_score": total_score,
            "level": level,
            "level_icon": level_icon,
            "breakdown": {
                "temperature_score": int(temp_score),
                "carbon_score": int(carbon_score),
                "green_infrastructure_score": int(green_score)
            },
            "achievements": achievements,
            "next_level_at": 300 * (len([300, 500, 700, 900]) - sum(1 for x in [300, 500, 700, 900] if total_score >= x) + 1) if total_score < 900 else 1000
        }
