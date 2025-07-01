export interface BuilderRevenue {
  builderCode: string;
  builderName?: string;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
    avgFee: number;
  }>;
  totalRevenue: number;
  // Revenue breakdown for stacked charts
  builderRewards: number;
  unclaimedReferralRewards: number;
  claimedReferralRewards: number;
  totalTransactions: number;
  avgFee: number;
  growthRate: number;
  // Volume data
  cumulativeVolume: number;
}

export interface DashboardData {
  builders: BuilderRevenue[];
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
  lastUpdated: string;
  totalRevenue: number;
  activeBuilders: number;
  growthRate: number;
  totalVolume: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  cumulativeRevenue: number;
  builderCode: string;
  builderName: string;
}

export interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface TimeRange {
  label: string;
  value: '24h' | '7d' | '30d' | '90d' | 'all';
  days: number;
}

// New types for Infrastructure vs Apps comparison
export interface CryptoProject {
  name: string;
  category: 'L1' | 'L2' | 'dApp' | 'Application' | 'Stablecoins';
  secondaryCategory?: string; // Optional secondary label like "Hyperliquid"
  amountRaised: number; // in USD
  useDefillama: boolean; // Flag to determine data source: true = Defillama APIs, false = Hyperliquid APIs
  
  // External API data (optional)
  marketCap?: number;
  fdv?: number;
  currentPrice?: number; // Current token price from CoinGecko
  revenue?: number; // daily revenue for protocols
  ecosystemRevenue?: number; // daily ecosystem fees for chains
  appFees?: number; // daily app fees for chains
  annualizedRevenue?: number; // daily revenue * 365 for Aura Score calculation
  annualizedAppFees?: number; // daily app fees * 365
  
  // Funding and TGE data
  lastFundingRoundValuation?: number; // Most recent funding round valuation in USD
  tgePrice?: number; // Token Generation Event price in USD
  returnVsFunding?: number; // % return vs. most recent funding round (calculated)
  returnSinceTGE?: number; // % return since TGE (calculated)
  
  // Additional metadata
  geckoId?: string;
  defillama?: {
    protocol?: string;
    chain?: string;
  };
  hyperliquidBuilder?: string; // Builder address for Hyperliquid API calls
}

export interface ComparisonData {
  projects: CryptoProject[];
  lastUpdated: string;
  summary: {
    totalInfrastructure: {
      count: number;
      totalRaised: number;
      totalRevenue: number;
      avgValuation: number;
    };
    totalApplications: {
      count: number;
      totalRaised: number;
      totalRevenue: number;
      avgValuation: number;
    };
  };
} 