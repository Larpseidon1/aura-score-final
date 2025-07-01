'use client';

import React, { useState } from 'react';

interface DiscoveryResult {
  address: string;
  hasRevenue: boolean;
  totalRewards: number;
  fees: number;
  referralFees: number;
}

interface DiscoveryResponse {
  action: string;
  results: DiscoveryResult[];
  summary?: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function BuilderDiscovery() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoveryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiscovery = async (action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/builders/discover?action=${action}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Discovery failed');
      }
      
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Builder Discovery Tool</h2>
      
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-4">
          This tool helps discover new Hyperliquid builders by testing potential addresses 
          and analyzing existing data sources.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => runDiscovery('scan')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Scan Addresses
          </button>
          
          <button
            onClick={() => runDiscovery('analyze')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Analyze Known
          </button>
          
          <button
            onClick={() => runDiscovery('csv')}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Check CSV Data
          </button>
          
          <button
            onClick={() => runDiscovery('report')}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Full Report
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Discovering builders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {results && !loading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">
            📊 Discovery Results ({results.action})
          </h3>
          
          {results.summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                <div className="text-sm text-blue-800">Total Tested</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">{results.summary.active}</div>
                <div className="text-sm text-green-800">Active Builders</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-2xl font-bold text-gray-600">{results.summary.inactive}</div>
                <div className="text-sm text-gray-800">Inactive</div>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.results.map((result: DiscoveryResult, index: number) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.hasRevenue 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-sm">{result.address}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.hasRevenue ? '✅ Active Builder' : '❌ No Activity'}
                    </div>
                  </div>
                  
                  {result.hasRevenue && (
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${result.totalRewards.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                                          Fees: ${result.fees.toLocaleString()} | 
                  Referral Fees: ${result.referralFees.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Discovery Methods</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Scan:</strong> Tests potential addresses for builder activity</li>
          <li>• <strong>Analyze:</strong> Examines revenue patterns of known builders</li>
          <li>• <strong>CSV:</strong> Checks for builder transaction data files</li>
          <li>• <strong>Report:</strong> Comprehensive discovery analysis</li>
        </ul>
      </div>
    </div>
  );
} 