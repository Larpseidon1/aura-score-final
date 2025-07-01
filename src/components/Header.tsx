'use client';

import { DashboardData, TimeRange } from '@/types';
import { formatCurrency, formatNumber, formatVolume, getTimeAgo } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  data: DashboardData;
  timeRange: TimeRange['value'];
  onTimeRangeChange: (range: TimeRange['value']) => void;
  isLoading?: boolean;
}

export function Header({ data, timeRange, onTimeRangeChange, isLoading = false }: HeaderProps) {
  const { builders, lastUpdated, totalVolume } = data;
  
  // Calculate totals
  const totalRevenue = builders.reduce((sum, builder) => sum + builder.totalRevenue, 0);
  const totalBuilders = builders.length;
  
  const timeRanges: TimeRange[] = [
    { label: '24H', value: '24h', days: 1 },
    { label: '7D', value: '7d', days: 7 },
    { label: '30D', value: '30d', days: 30 },
    { label: '90D', value: '90d', days: 90 },
    { label: 'All Time', value: 'all', days: 365 },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Image 
              src="/Shape_Mini_03_Black.png" 
              alt="Hyperliquid Builders icon" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            Hyperliquid Builders
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Real-time builder code revenue analytics
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-1 sm:gap-2 w-full lg:w-auto">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => !isLoading && onTimeRangeChange(range.value)}
              disabled={isLoading}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 min-w-[50px] sm:min-w-[60px] text-sm sm:text-base flex-1 lg:flex-none ${
                timeRange === range.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white/80 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
              } ${isLoading ? 'opacity-60' : ''}`}
            >
              {isLoading && timeRange === range.value ? (
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <div className="animate-spin rounded-full border border-white border-t-transparent h-3 w-3"></div>
                  <span className="text-xs">{range.label}</span>
                </div>
              ) : (
                range.label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white sm:bg-white/90 sm:backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white sm:bg-white/90 sm:backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Builders</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {totalBuilders}
          </p>
        </div>
        <div className="bg-white sm:bg-white/90 sm:backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 md:col-span-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volume</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            ${(totalVolume / 1e12).toFixed(2)}T
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs sm:text-sm text-gray-500 text-center">
        Last updated: {new Date(lastUpdated).toLocaleString()}
        {isLoading && (
          <span className="ml-2 inline-flex items-center gap-1">
            <div className="animate-spin rounded-full border border-gray-400 border-t-transparent h-3 w-3"></div>
            Updating...
          </span>
        )}
      </div>
    </div>
  );
} 