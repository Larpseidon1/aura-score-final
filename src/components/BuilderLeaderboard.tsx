'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BuilderRevenue } from '@/types';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

interface BuilderLeaderboardProps {
  builders: BuilderRevenue[];
  auraRanks?: Record<string, number>; // Map of builder name to aura rank
}

type SortField = 'rank' | 'builderName' | 'totalRevenue' | 'auraRank';
type SortDirection = 'asc' | 'desc';

// Builder configuration with links and profile images
const builderConfig: Record<string, { url: string; image: string }> = {
  'pvp.trade': {
    url: 'https://pvp.trade/join/uq53km',
    image: '/PVP Trade Profile Image.jpg'
  },
  'Axiom': {
    url: 'https://axiom.trade/@auraa',
    image: '/Axiom Profile Image.jpg'
  },
  'Okto': {
    url: 'https://x.com/Okto_wallet',
    image: '/Okto Profile Image.png'
  },
  'Defi App': {
    url: 'https://app.defi.app/join/5Cmw19',
    image: '/Defi App Avatar.jpg'
  },
  'Dexari': {
    url: 'https://x.com/DexariDotCom',
    image: '/Dexari Profile Image.jpg'
  }
};

export function BuilderLeaderboard({ builders, auraRanks = {} }: BuilderLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedBuilders = [...builders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'rank') {
      // For rank, we sort by totalRevenue in reverse (highest revenue = rank 1)
      aValue = a.totalRevenue;
      bValue = b.totalRevenue;
      // Flip the sort direction for rank
      const effectiveDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return effectiveDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (sortField === 'builderName') {
      aValue = a.builderName || a.builderCode;
      bValue = b.builderName || b.builderCode;
    } else if (sortField === 'auraRank') {
      // Get aura ranks for comparison, default to 999 if not found
      aValue = auraRanks[a.builderName || a.builderCode] || 999;
      bValue = auraRanks[b.builderName || b.builderCode] || 999;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const totalPages = Math.ceil(sortedBuilders.length / itemsPerPage);
  const paginatedBuilders = sortedBuilders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-secondary-500" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-400" />
      : <ChevronDown className="h-4 w-4 text-primary-400" />;
  };

  return (
    <div className="bg-white sm:rounded-lg sm:shadow-lg sm:border sm:border-gray-200 p-0 sm:p-6">
      <div className="mb-4 sm:mb-6 px-4 py-4 sm:px-0 sm:py-0 border-b border-gray-100 sm:border-b-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Builder Leaderboard
        </h2>
        <p className="text-gray-700 text-sm">
          Top builders ranked by revenue performance
        </p>
      </div>

      {/* Mobile Card Layout - Only visible on mobile */}
      <div className="block md:hidden space-y-0">
        {paginatedBuilders.map((builder, index) => {
          const rank = (currentPage - 1) * itemsPerPage + index + 1;
          const builderName = builder.builderName || builder.builderCode;
          const config = builderConfig[builderName];
          const auraRank = auraRanks[builderName];

          return (
            <div 
              key={builder.builderCode}
              className="bg-white p-4 border-b border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    rank === 1 ? 'bg-yellow-500/20 text-yellow-600' :
                    rank === 2 ? 'bg-gray-500/20 text-gray-600' :
                    rank === 3 ? 'bg-orange-500/20 text-orange-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {rank}
                  </span>
                  {config ? (
                    <Image
                      src={config.image}
                      alt={`${builderName} logo`}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {builderName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{builderName}</p>
                  </div>
                </div>
                {config && (
                  <Link 
                    href={config.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                  </Link>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Revenue</p>
                  <p className="text-gray-900 font-semibold">{formatCurrency(builder.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Aura Rank</p>
                  {auraRank ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      auraRank <= 3 ? 'bg-yellow-500/20 text-yellow-600' :
                      auraRank <= 10 ? 'bg-blue-500/20 text-blue-600' :
                      'bg-gray-500/20 text-gray-600'
                    }`}>
                      #{auraRank}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">N/A</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 px-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ‹
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table Layout - Only visible on desktop */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-800">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Rank
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('builderName')}
                >
                  <div className="flex items-center gap-2">
                    Builder
                    <SortIcon field="builderName" />
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('totalRevenue')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Total Revenue
                    <SortIcon field="totalRevenue" />
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('auraRank')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Aura Rank
                    <SortIcon field="auraRank" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedBuilders.map((builder, index) => {
                const rank = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr 
                    key={builder.builderCode}
                    className="border-b border-secondary-800/50 hover:bg-secondary-900/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-secondary-800 text-secondary-400'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const builderName = builder.builderName || builder.builderCode;
                          const config = builderConfig[builderName];
                          
                          if (config) {
                            return (
                              <Link 
                                href={config.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                              >
                                <Image
                                  src={config.image}
                                  alt={`${builderName} logo`}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                              </Link>
                            );
                          } else {
                            return (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600">
                                  {builderName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            );
                          }
                        })()}
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">
                            {builder.builderName || builder.builderCode}
                          </p>
                        </div>
                        {(() => {
                          const builderName = builder.builderName || builder.builderCode;
                          const config = builderConfig[builderName];
                          
                          if (config) {
                            return (
                              <Link 
                                href={config.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <ExternalLink className="h-4 w-4 text-secondary-500 hover:text-primary-400 cursor-pointer transition-colors" />
                              </Link>
                            );
                          } else {
                            return (
                              <ExternalLink className="h-4 w-4 text-secondary-300" />
                            );
                          }
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(builder.totalRevenue)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {(() => {
                        const auraRank = auraRanks[builder.builderName || builder.builderCode];
                        if (auraRank) {
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              auraRank <= 3 ? 'bg-yellow-500/20 text-yellow-600' :
                              auraRank <= 10 ? 'bg-blue-500/20 text-blue-600' :
                              'bg-gray-500/20 text-gray-600'
                            }`}>
                              #{auraRank}
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-gray-400 italic text-xs">
                              N/A
                            </span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-4 sm:gap-0">
          <p className="text-xs sm:text-sm text-secondary-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, builders.length)} of {builders.length} builders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md bg-secondary-800 text-secondary-400 hover:bg-secondary-700 hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-secondary-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md bg-secondary-800 text-secondary-400 hover:bg-secondary-700 hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 