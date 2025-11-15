import React from 'react';
import { DollarSign, TrendingUp, PiggyBank, Calendar } from 'lucide-react';

interface CostBenefitProps {
  costBenefit: {
    investment: {
      tree_planting: number;
      solar_installation: number;
      total_investment: number;
    };
    annual_benefits: {
      energy_savings: number;
      health_savings: number;
      solar_revenue: number;
      total_annual: number;
    };
    one_time_benefits: {
      property_value_increase: number;
    };
    roi_metrics: {
      payback_period_years: number;
      roi_10_years_percent: number;
      net_benefit_10_years: number;
    };
  };
}

const CostBenefitCard: React.FC<CostBenefitProps> = ({ costBenefit }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-blue-900">Cost-Benefit Analysis</h3>
      </div>

      {/* ROI Hero Metric */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-4 text-white text-center">
        <p className="text-sm opacity-90 mb-1">10-Year ROI</p>
        <p className="text-5xl font-bold">
          {costBenefit.roi_metrics.roi_10_years_percent > 0 ? '+' : ''}
          {costBenefit.roi_metrics.roi_10_years_percent.toFixed(0)}%
        </p>
        <p className="text-sm mt-2 opacity-90">
          Payback in {costBenefit.roi_metrics.payback_period_years.toFixed(1)} years
        </p>
      </div>

      {/* Investment Breakdown */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="w-5 h-5 text-orange-600" />
          <h4 className="font-semibold text-gray-800">Initial Investment</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">🌳 Tree Planting</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(costBenefit.investment.tree_planting)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">☀️ Solar Installation</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(costBenefit.investment.solar_installation)}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total Investment</span>
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(costBenefit.investment.total_investment)}
            </span>
          </div>
        </div>
      </div>

      {/* Annual Benefits */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-gray-800">Annual Benefits</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">⚡ Energy Savings</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(costBenefit.annual_benefits.energy_savings)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">🏥 Health Savings</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(costBenefit.annual_benefits.health_savings)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">☀️ Solar Revenue</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(costBenefit.annual_benefits.solar_revenue)}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total Annual</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(costBenefit.annual_benefits.total_annual)}
            </span>
          </div>
        </div>
      </div>

      {/* 10-Year Projection */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5" />
          <h4 className="font-semibold">10-Year Net Benefit</h4>
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(costBenefit.roi_metrics.net_benefit_10_years)}
        </p>
        <p className="text-sm mt-2 opacity-90">
          + {formatCurrency(costBenefit.one_time_benefits.property_value_increase)} property value increase
        </p>
      </div>

      {/* Impact Message */}
      <div className="mt-4 p-3 bg-blue-600 text-white rounded-lg text-center">
        <p className="text-sm font-semibold">
          💰 Every $1 invested returns ${((costBenefit.annual_benefits.total_annual * 10) / costBenefit.investment.total_investment).toFixed(2)} over 10 years!
        </p>
      </div>
    </div>
  );
};

export default CostBenefitCard;
