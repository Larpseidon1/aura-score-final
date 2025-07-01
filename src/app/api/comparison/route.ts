import { NextRequest, NextResponse } from 'next/server';
import { CryptoProject, ComparisonData } from '@/types';
import { enrichAllProjects } from '@/lib/externalApis';

// Mark this route as dynamic since it uses caching and external API calls
export const dynamic = 'force-dynamic';

// Base project data from the spreadsheet
const BASE_PROJECTS: CryptoProject[] = [
  { name: 'Hyperliquid', category: 'L1', amountRaised: 0, useDefillama: true, tgePrice: 3.81 },
  { name: 'Berachain', category: 'L1', amountRaised: 211_000_000, useDefillama: true, lastFundingRoundValuation: 1_500_000_000, tgePrice: 15.00 },
  { name: 'Blast', category: 'L2', amountRaised: 20_000_000, useDefillama: true, lastFundingRoundValuation: 100_000_000, tgePrice: 0.03 },
  { name: 'Sonic', category: 'L1', amountRaised: 29_350_000, useDefillama: true, lastFundingRoundValuation: 100_000_000, tgePrice: 0.32 },
  { name: 'Celestia', category: 'L1', amountRaised: 155_000_000, useDefillama: true, lastFundingRoundValuation: 1_500_000_000, tgePrice: 1.50 },
  { name: 'Optimism', category: 'L2', amountRaised: 267_500_000, useDefillama: true, lastFundingRoundValuation: 1_650_000_000, tgePrice: 1.91 },
  { name: 'Arbitrum', category: 'L2', amountRaised: 143_700_000, useDefillama: true, lastFundingRoundValuation: 4_500_000_000, tgePrice: 1.20 },
  { name: 'Solana', category: 'L1', amountRaised: 319_500_000, useDefillama: true, lastFundingRoundValuation: 110_000_000, tgePrice: 0.22 },
  { name: 'Ethereum', category: 'L1', amountRaised: 18_000_000, useDefillama: true, lastFundingRoundValuation: 22_000_000, tgePrice: 0.31 },
  { name: 'Story Protocol', category: 'L1', amountRaised: 143_000_000, useDefillama: true, lastFundingRoundValuation: 2_250_000_000, tgePrice: 2.50 },
  { name: 'Movement', category: 'L1', amountRaised: 55_000_000, useDefillama: true, lastFundingRoundValuation: 1_600_000_000, tgePrice: 0.68 },
  { name: 'Sui Network', category: 'L1', amountRaised: 336_000_000, useDefillama: true, lastFundingRoundValuation: 1_500_000_000, tgePrice: 0.10 },
  { name: 'Initia', category: 'L1', amountRaised: 24_000_000, useDefillama: true, lastFundingRoundValuation: 600_000_000, tgePrice: 0.60 },
  { name: 'Tron', category: 'L1', amountRaised: 76_000_000, useDefillama: true, tgePrice: 0.002 },
  { name: 'Polygon', category: 'L1', amountRaised: 450_000_000, useDefillama: true, tgePrice: 0.003 },
  { name: 'Ton', category: 'L1', amountRaised: 658_000_000, useDefillama: true, tgePrice: 0.78 },
  
  // Apps from the spreadsheet
  { name: 'pvp.trade', category: 'Application', secondaryCategory: 'Hyperliquid', amountRaised: 1_200_000, useDefillama: false, hyperliquidBuilder: '0x0cbf655b0d22ae71fba3a674b0e1c0c7e7f975af' },
  { name: 'Axiom', category: 'Application', amountRaised: 500_000, useDefillama: true, hyperliquidBuilder: '0x1cc34f6af34653c515b47a83e1de70ba9b0cda1f' },
  { name: 'Okto', category: 'Application', secondaryCategory: 'Hyperliquid', amountRaised: 27_000_000, useDefillama: false, hyperliquidBuilder: '0x6acc0acd626b29b48923228c111c94bd4faa6a43' },
  { name: 'Defi App', category: 'Application', secondaryCategory: 'Hyperliquid', amountRaised: 6_000_000, useDefillama: false, hyperliquidBuilder: '0x1922810825c90f4270048b96da7b1803cd8609ef', lastFundingRoundValuation: 100_000_000, tgePrice: 0.03 },
  { name: 'Dexari', category: 'Application', secondaryCategory: 'Hyperliquid', amountRaised: 2_300_000, useDefillama: false, hyperliquidBuilder: '0x7975cafdff839ed5047244ed3a0dd82a89866081' },
  
  // New apps from spreadsheet update
  { name: 'Moonshot', category: 'Application', amountRaised: 60_000_000, useDefillama: true },
  { name: 'Tether', category: 'Stablecoins', amountRaised: 69_420_000, useDefillama: true },
  { name: 'Circle', category: 'Stablecoins', amountRaised: 1_200_000_000, useDefillama: true },
  { name: 'Pump.fun', category: 'Application', amountRaised: 70_000_000, useDefillama: true },
  { name: 'Phantom', category: 'Application', amountRaised: 268_000_000, useDefillama: true }
];

// Cache to avoid hitting APIs too frequently - REDUCED cache duration to avoid memory issues
let cachedData: ComparisonData | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 1000 * 60 * 15; // REDUCED from 1 hour to 15 minutes

export async function GET(request: NextRequest) {
  try {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      console.log('🚀 Returning cached comparison data');
      return NextResponse.json(cachedData);
    }

    console.log('🔄 Fetching fresh comparison data...');

    // Use a timeout to prevent API calls from hanging
    const enrichedProjects = await Promise.race([
      enrichAllProjects(BASE_PROJECTS),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 30000) // 30 second timeout
      )
    ]) as any;

    // Calculate summary statistics
    const infrastructureProjects = enrichedProjects.filter((p: any) => p.category === 'L1' || p.category === 'L2');
    const applicationProjects = enrichedProjects.filter((p: any) => p.category === 'Application' || p.category === 'Stablecoins');

    const totalInfrastructure = {
      count: infrastructureProjects.length,
      totalRaised: infrastructureProjects.reduce((sum: number, p: any) => sum + p.amountRaised, 0),
      totalRevenue: infrastructureProjects.reduce((sum: number, p: any) => sum + (p.ecosystemRevenue || p.revenue || 0), 0),
      avgValuation: infrastructureProjects.reduce((sum: number, p: any) => sum + (p.fdv || p.marketCap || 0), 0) / infrastructureProjects.length
    };

    const totalApplications = {
      count: applicationProjects.length,
      totalRaised: applicationProjects.reduce((sum: number, p: any) => sum + p.amountRaised, 0),
      totalRevenue: applicationProjects.reduce((sum: number, p: any) => sum + (p.revenue || 0), 0),
      avgValuation: applicationProjects.reduce((sum: number, p: any) => sum + (p.fdv || p.marketCap || 0), 0) / applicationProjects.length
    };

    const comparisonData: ComparisonData = {
      projects: enrichedProjects,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalInfrastructure,
        totalApplications
      }
    };

    // Cache the data
    cachedData = comparisonData;
    lastFetch = now;

    console.log('✅ Successfully fetched and cached comparison data');
    return NextResponse.json(comparisonData);

  } catch (error) {
    console.error('Error fetching comparison data:', error);
    
    // Return base data without enrichment if external APIs fail
    const fallbackData: ComparisonData = {
      projects: BASE_PROJECTS,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalInfrastructure: {
          count: BASE_PROJECTS.filter(p => p.category === 'L1' || p.category === 'L2').length,
          totalRaised: BASE_PROJECTS.filter(p => p.category === 'L1' || p.category === 'L2').reduce((sum, p) => sum + p.amountRaised, 0),
          totalRevenue: 0,
          avgValuation: 0
        },
        totalApplications: {
          count: BASE_PROJECTS.filter(p => p.category === 'Application' || p.category === 'Stablecoins').length,
          totalRaised: BASE_PROJECTS.filter(p => p.category === 'Application' || p.category === 'Stablecoins').reduce((sum, p) => sum + p.amountRaised, 0),
          totalRevenue: 0,
          avgValuation: 0
        }
      }
    };

    return NextResponse.json(fallbackData);
  }
} 