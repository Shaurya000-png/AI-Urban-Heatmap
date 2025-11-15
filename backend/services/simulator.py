from typing import Dict, Any, List
from models.ml_model import HeatPredictionModel

class UrbanSimulator:
    def __init__(self):
        self.model = HeatPredictionModel()

    def simulate_scenario(self, base_temperature: float,
                         tree_cover_percentage: float,
                         solar_roof_percentage: float) -> Dict[str, Any]:
        """
        Simulate temperature changes based on green infrastructure scenarios

        Args:
            base_temperature: Current base temperature
            tree_cover_percentage: Percentage of tree coverage (0-100)
            solar_roof_percentage: Percentage of solar roof coverage (0-100)

        Returns:
            Dictionary containing simulation results
        """
        # Validate inputs
        if not (0 <= tree_cover_percentage <= 100):
            raise ValueError("Tree cover percentage must be between 0 and 100")
        if not (0 <= solar_roof_percentage <= 100):
            raise ValueError("Solar roof percentage must be between 0 and 100")
        if not (20 <= base_temperature <= 50):
            raise ValueError("Base temperature must be between 20°C and 50°C")

        # Calculate temperature impact
        temperature_change = self.model.calculate_temperature_impact(
            tree_cover_percentage,
            solar_roof_percentage
        )

        adjusted_temperature = base_temperature + temperature_change

        # Generate recommendations
        recommendations = self._generate_recommendations(
            tree_cover_percentage,
            solar_roof_percentage,
            temperature_change
        )

        return {
            'base_temperature': float(base_temperature),
            'adjusted_temperature': float(adjusted_temperature),
            'temperature_change': float(temperature_change),
            'tree_cover_percentage': float(tree_cover_percentage),
            'solar_roof_percentage': float(solar_roof_percentage),
            'recommendations': recommendations,
            'scenario_analysis': self._analyze_scenario(
                tree_cover_percentage,
                solar_roof_percentage
            )
        }

    def _generate_recommendations(self, tree_cover: float, solar_roof: float,
                                temp_change: float) -> List[str]:
        """Generate sustainability recommendations"""
        recommendations = []

        # Temperature-based recommendations
        if temp_change > -0.5:
            recommendations.append(
                "Consider increasing green infrastructure to achieve better cooling effects"
            )
        elif temp_change < -2.0:
            recommendations.append(
                "Excellent cooling strategy! This combination provides significant temperature reduction"
            )

        # Tree cover recommendations
        if tree_cover < 20:
            recommendations.append(
                "Increase tree cover to at least 30% for optimal urban cooling"
            )
        elif tree_cover > 70:
            recommendations.append(
                "Tree cover is high, consider diversifying with other vegetation types"
            )

        # Solar roof recommendations
        if solar_roof < 15:
            recommendations.append(
                "Add more solar panels to reduce heat absorption and generate renewable energy"
            )
        elif solar_roof > 60:
            recommendations.append(
                "Great solar coverage! Consider combining with green roofs for maximum benefit"
            )

        # Combined effect recommendations
        if tree_cover > 40 and solar_roof > 40:
            recommendations.append(
                "You've achieved an excellent balance of green infrastructure and renewable energy"
            )

        if not recommendations:
            recommendations.append(
                "Current green infrastructure strategy is providing moderate cooling benefits"
            )

        return recommendations

    def _analyze_scenario(self, tree_cover: float, solar_roof: float) -> Dict[str, Any]:
        """Analyze the scenario for additional insights"""
        # Calculate energy and environmental benefits
        co2_reduction_kg_per_year = (tree_cover * 2.5) + (solar_roof * 1.8)
        energy_saved_mwh_per_year = solar_roof * 0.15
        air_quality_improvement = min(tree_cover / 20, 1.0)  # Max improvement at 20% tree cover

        # Calculate cost estimates
        tree_implementation_cost = tree_cover * 50  # $50 per percentage point
        solar_implementation_cost = solar_roof * 75  # $75 per percentage point
        total_implementation_cost = tree_implementation_cost + solar_implementation_cost

        # Calculate ROI (simplified)
        annual_energy_savings = energy_saved_mwh_per_year * 100  # $100 per MWh
        roi_years = total_implementation_cost / annual_energy_savings if annual_energy_savings > 0 else float('inf')

        return {
            'environmental_benefits': {
                'co2_reduction_kg_per_year': round(co2_reduction_kg_per_year, 1),
                'energy_saved_mwh_per_year': round(energy_saved_mwh_per_year, 2),
                'air_quality_improvement_percent': round(air_quality_improvement * 100, 1)
            },
            'economic_analysis': {
                'implementation_cost_usd': round(total_implementation_cost, 0),
                'annual_energy_savings_usd': round(annual_energy_savings, 0),
                'payback_period_years': round(roi_years, 1) if roi_years != float('inf') else "N/A"
            },
            'sustainability_score': min((tree_cover * 0.6 + solar_roof * 0.4) / 100, 1.0)
        }

    def compare_scenarios(self, scenarios: List[Dict]) -> List[Dict]:
        """
        Compare multiple scenarios and rank them by effectiveness

        Args:
            scenarios: List of scenario dictionaries with base_temperature,
                      tree_cover_percentage, and solar_roof_percentage

        Returns:
            List of scenarios with analysis results, ranked by temperature reduction
        """
        analyzed_scenarios = []

        for scenario in scenarios:
            try:
                result = self.simulate_scenario(
                    scenario['base_temperature'],
                    scenario['tree_cover_percentage'],
                    scenario['solar_roof_percentage']
                )
                analyzed_scenarios.append(result)
            except Exception as e:
                analyzed_scenarios.append({
                    'error': str(e),
                    'scenario': scenario
                })

        # Sort by temperature reduction (most negative first)
        analyzed_scenarios.sort(key=lambda x: x.get('temperature_change', 0))

        return analyzed_scenarios

    def get_optimal_scenario(self, base_temperature: float,
                           budget_constraint: float = None,
                           space_constraint: float = None) -> Dict[str, Any]:
        """
        Find the optimal scenario based on constraints

        Args:
            base_temperature: Current base temperature
            budget_constraint: Maximum implementation budget in USD
            space_constraint: Maximum available space percentage

        Returns:
            Optimal scenario recommendation
        """
        best_scenario = None
        best_score = -float('inf')

        # Search through possible combinations
        for tree_cover in range(0, 101, 10):
            for solar_roof in range(0, 101, 10):
                try:
                    # Check constraints
                    if space_constraint and (tree_cover + solar_roof) > space_constraint:
                        continue

                    scenario = self.simulate_scenario(
                        base_temperature, tree_cover, solar_roof
                    )

                    cost = scenario['scenario_analysis']['economic_analysis']['implementation_cost_usd']
                    if budget_constraint and cost > budget_constraint:
                        continue

                    # Calculate effectiveness score
                    temp_reduction = abs(scenario['temperature_change'])
                    sustainability_score = scenario['scenario_analysis']['sustainability_score']
                    effectiveness = temp_reduction * sustainability_score

                    if effectiveness > best_score:
                        best_score = effectiveness
                        best_scenario = scenario

                except Exception:
                    continue

        return best_scenario or {
            'error': 'No feasible scenario found with given constraints'
        }