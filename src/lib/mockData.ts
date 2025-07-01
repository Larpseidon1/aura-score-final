import { BuilderRevenue, DashboardData, ChartDataPoint } from '@/types';

// Generate realistic builder names and codes
const builderNames = [
  'AlphaTrader',
  'BetaBot',
  'GammaGrid',
  'DeltaDex',
  'EpsilonEdge',
  'ZetaZone',
  'EtaEngine',
  'ThetaTrader',
  'IotaIndex',
  'KappaKeeper',
  'LambdaLiquidity',
  'MuMarket',
  'NuNetwork',
  'XiXchange',
  'OmicronOrder'
];

const builderCodes = [
  'ALPHA001',
  'BETA002',
  'GAMMA003',
  'DELTA004',
  'EPSILON005',
  'ZETA006',
  'ETA007',
  'THETA008',
  'IOTA009',
  'KAPPA010',
  'LAMBDA011',
  'MU012',
  'NU013',
  'XI014',
  'OMICRON015'
];

// Generate daily revenue data for the last 90 days
function generateDailyRevenue(days: number, baseRevenue: number, volatility: number) {
  const data = [];
  let cumulativeRevenue = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some randomness and trend
    const randomFactor = 0.5 + Math.random();
    const trendFactor = 1 + (Math.sin(i * 0.1) * 0.2);
    const dailyRevenue = baseRevenue * randomFactor * trendFactor;
    
    cumulativeRevenue += dailyRevenue;
    
    const transactionCount = Math.floor(dailyRevenue / (10 + Math.random() * 20));
    const avgFee = dailyRevenue / transactionCount;
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(dailyRevenue * 100) / 100,
      transactionCount,
      avgFee: Math.round(avgFee * 100) / 100
    });
  }
  
  return data;
}

// Generate mock builders data
function generateMockBuilders(): BuilderRevenue[] {
  return builderCodes.map((code, index) => {
    const baseRevenue = 1000 + Math.random() * 5000;
    const dailyRevenue = generateDailyRevenue(90, baseRevenue, 0.3);
    const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const totalTransactions = dailyRevenue.reduce((sum, day) => sum + day.transactionCount, 0);
    const avgFee = totalRevenue / totalTransactions;
    
    // Calculate growth rate (comparing last 7 days vs previous 7 days)
    const last7Days = dailyRevenue.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
    const prev7Days = dailyRevenue.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
    const growthRate = prev7Days > 0 ? ((last7Days - prev7Days) / prev7Days) * 100 : 0;
    
    // Simulate revenue breakdown
    const builderRewards = totalRevenue * 0.6; // 60% from builder rewards
    const unclaimedReferralRewards = totalRevenue * 0.25; // 25% unclaimed referral
    const claimedReferralRewards = totalRevenue * 0.15; // 15% claimed referral
    
    return {
      builderCode: code,
      builderName: builderNames[index],
      dailyRevenue,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      builderRewards: Math.round(builderRewards * 100) / 100,
      unclaimedReferralRewards: Math.round(unclaimedReferralRewards * 100) / 100,
      claimedReferralRewards: Math.round(claimedReferralRewards * 100) / 100,
      totalTransactions,
      avgFee: Math.round(avgFee * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      cumulativeVolume: Math.round(totalRevenue * (20 + Math.random() * 30) * 100) / 100 // Mock volume: 20-50x revenue
    };
  });
}

// Generate chart data points
function generateChartData(builders: BuilderRevenue[], timeRange: '24h' | '7d' | '30d' | '90d' | 'all'): ChartDataPoint[] {
  const daysMap: { [key: string]: { revenue: number; cumulativeRevenue: number; builders: { [key: string]: number } } } = {};
  
  builders.forEach(builder => {
    const daysToInclude = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const recentData = builder.dailyRevenue.slice(-daysToInclude);
    
    let cumulativeRevenue = 0;
    recentData.forEach(day => {
      if (!daysMap[day.date]) {
        daysMap[day.date] = { revenue: 0, cumulativeRevenue: 0, builders: {} };
      }
      
      daysMap[day.date].revenue += day.revenue;
      daysMap[day.date].builders[builder.builderCode] = day.revenue;
      cumulativeRevenue += day.revenue;
      daysMap[day.date].cumulativeRevenue = cumulativeRevenue;
    });
  });
  
  return Object.entries(daysMap).map(([date, data]: [string, { revenue: number; cumulativeRevenue: number; builders: { [key: string]: number } }]) => ({
    date,
    revenue: Math.round(data.revenue * 100) / 100,
    cumulativeRevenue: Math.round(data.cumulativeRevenue * 100) / 100,
    builderCode: Object.keys(data.builders).join(','),
    builderName: Object.keys(data.builders).join(', ')
  }));
}

// Generate mock dashboard data
export function generateMockDashboardData(timeRange: '24h' | '7d' | '30d' | '90d' | 'all' = '7d'): DashboardData {
  const builders = generateMockBuilders();
  const chartData = generateChartData(builders, timeRange);
  
  const totalRevenue = builders.reduce((sum, builder) => sum + builder.totalRevenue, 0);
  const totalVolume = builders.reduce((sum, builder) => sum + (builder.cumulativeVolume || 0), 0);
  const activeBuilders = builders.filter(b => b.totalRevenue > 0).length;
  
  // Calculate overall growth rate
  const totalLast7Days = builders.reduce((sum, builder) => {
    const last7Days = builder.dailyRevenue.slice(-7).reduce((s, day) => s + day.revenue, 0);
    return sum + last7Days;
  }, 0);
  
  const totalPrev7Days = builders.reduce((sum, builder) => {
    const prev7Days = builder.dailyRevenue.slice(-14, -7).reduce((s, day) => s + day.revenue, 0);
    return sum + prev7Days;
  }, 0);
  
  const growthRate = totalPrev7Days > 0 ? ((totalLast7Days - totalPrev7Days) / totalPrev7Days) * 100 : 0;
  
  return {
    builders,
    timeRange,
    lastUpdated: new Date().toISOString(),
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    activeBuilders,
    growthRate: Math.round(growthRate * 100) / 100,
    totalVolume: Math.round(totalVolume * 100) / 100
  };
}

// Export individual builders for API endpoints
export function getBuilderByCode(code: string): BuilderRevenue | null {
  const builders = generateMockBuilders();
  return builders.find(b => b.builderCode === code) || null;
}

// Export all builders for leaderboard
export function getAllBuilders(): BuilderRevenue[] {
  return generateMockBuilders().sort((a, b) => b.totalRevenue - a.totalRevenue);
} 