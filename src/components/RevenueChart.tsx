'use client';

import { DashboardData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';

interface RevenueChartProps {
  data: DashboardData;
  timeRange: string;
}

// Consistent colors for each builder (by their code)
const BUILDER_COLORS: Record<string, string> = {
  'PVP001': '#000000', // pvp.trade - Black
  'AXM001': '#526FFF', // Axiom - Blue
  'DFA001': '#0F271F', // Defi App - Dark Green
  'OKT001': '#563FFA', // Okto - Purple
  'DEX001': '#E5DBB7', // Dexari - Beige/Tan
  // Add more colors as needed
  'default': '#6b7280', // Gray for unknown builders
};

// Get color for a builder
function getBuilderColor(builderCode: string): string {
  return BUILDER_COLORS[builderCode] || BUILDER_COLORS.default;
}

// Transform data for stacked bar chart
function generateStackedBarChartData(data: DashboardData) {
  return data.builders.map(builder => ({
    name: builder.builderName || builder.builderCode,
    fees: builder.builderRewards,
    referralFees: builder.unclaimedReferralRewards + builder.claimedReferralRewards,
    total: builder.totalRevenue
  }));
}

// Colors for the two revenue categories
const stackColors = {
  fees: '#67A883',           // Green - Builder Fees
  referralFees: '#82AFD9'    // Light Blue - Referral Fees
};

// Generate pie chart data from dashboard data
function generatePieChartData(data: DashboardData) {
  return data.builders
    .filter(builder => builder.totalRevenue > 0)
    .map(builder => ({
      name: builder.builderName,
      value: builder.totalRevenue,
      fullName: builder.builderName,
      color: getBuilderColor(builder.builderCode),
    }))
    .sort((a, b) => b.value - a.value);
}

export function RevenueChart({ data, timeRange }: RevenueChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  const stackedBarChartData = generateStackedBarChartData(data);
  const pieChartData = generatePieChartData(data);
  
  const CustomTooltipStacked = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload?.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'fees' && 'Builder Fees: '}
              {entry.dataKey === 'referralFees' && 'Referral Fees: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
          <div className="border-t pt-1 mt-1">
            <p className="text-sm font-medium">Total: {formatCurrency(total)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Revenue: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };



  const getChartDescription = () => {
    switch (chartType) {
      case 'bar':
        return 'Breakdown of builder fees and referral fees by project';
      case 'pie':
        return 'Distribution of total builder revenue across all projects';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-lg border-t border-gray-100 sm:border sm:border-gray-200 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: '#181818' }}>
            Builder Revenue
          </h2>
          <p className="text-muted-foreground text-sm">
            {getChartDescription()}
          </p>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
              chartType === 'bar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
              chartType === 'pie'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      <div className="h-80 sm:h-96 relative">
        {/* Watermark */}
        <div 
          className="absolute top-0 left-0 right-0 h-full flex justify-center pointer-events-none z-0"
          style={{ 
            opacity: 0.15, 
            alignItems: 'flex-start',
            paddingTop: '15%'
          }}
        >
          <img 
            src="/logo-watermark.svg" 
            alt="Watermark" 
            className="max-w-[250px] max-h-[75px] object-contain"
          />
        </div>
        
        {/* Chart */}
        <div className="relative z-10 h-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
            <BarChart data={stackedBarChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-sm" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-sm" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `$${(value / 1000).toFixed(0)}K`;
                  } else {
                    return `$${value.toString()}`;
                  }
                }}
                scale="sqrt"
                domain={[0, 'dataMax']}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltipStacked />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value: string) => {
                  if (value === 'fees') return 'Builder Fees';
                  if (value === 'referralFees') return 'Referral Fees';
                  return value;
                }}
              />
              <Bar dataKey="fees" stackId="a" fill={stackColors.fees} radius={[0, 0, 0, 0]} />
              <Bar dataKey="referralFees" stackId="a" fill={stackColors.referralFees} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
            </PieChart>
          )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Builder Legend with Percentages */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Revenue Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pieChartData.map((builder) => {
            const percentage = ((builder.value / data.totalRevenue) * 100).toFixed(1);
            return (
              <div key={builder.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: builder.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {builder.name}
                  </span>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {percentage}%
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatCurrency(builder.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 