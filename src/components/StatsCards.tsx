'use client';

import { DashboardData } from '@/types';
import { formatCurrency, formatNumber, formatPercentage, formatVolume } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Target } from 'lucide-react';

interface StatsCardsProps {
  data: DashboardData;
}

export function StatsCards({ data }: StatsCardsProps) {
  // Find top builder
  const topBuilder = data.builders.reduce((prev, current) => 
    prev.totalRevenue > current.totalRevenue ? prev : current
  );

  // Calculate average daily revenue
  const totalDays = data.timeRange === '24h' ? 1 : data.timeRange === '7d' ? 7 : data.timeRange === '30d' ? 30 : 90;
  const avgDailyRevenue = data.totalRevenue / totalDays;

  const stats = [
    {
      title: 'Top Builder',
      value: topBuilder.builderName || topBuilder.builderCode,
      subtitle: formatCurrency(topBuilder.totalRevenue),
      icon: Target,
      change: topBuilder.growthRate,
      changeType: topBuilder.growthRate >= 0 ? 'positive' : 'negative' as const,
    },
    {
      title: 'Average Daily Revenue',
      value: formatCurrency(avgDailyRevenue),
      subtitle: 'Per day',
      icon: DollarSign,
      change: data.growthRate,
      changeType: data.growthRate >= 0 ? 'positive' : 'negative' as const,
    },
    {
      title: 'Total Volume',
      value: '$' + formatVolume(data.totalVolume),
      subtitle: 'Notional trading volume',
      icon: Activity,
      change: undefined,
      changeType: 'neutral' as const,
    },
    {
      title: 'Active Builders',
      value: formatNumber(data.activeBuilders),
      subtitle: 'Generating revenue',
      icon: Users,
      change: undefined,
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-lg border-b border-gray-100 sm:border sm:border-gray-200 p-4 sm:p-6 transition-all sm:hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                                      <Icon className="h-5 w-5 text-gray-700" />
                  <p className="text-gray-800 text-sm font-medium">
                    {stat.title}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  {stat.subtitle}
                </p>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${
                    stat.changeType === 'positive' ? 'text-success' : 'text-error'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{formatPercentage(stat.change)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 