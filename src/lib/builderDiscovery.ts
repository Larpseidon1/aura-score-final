import { HyperliquidAPI } from './hyperliquidApi';

// Known ecosystem projects and potential builder addresses
// These addresses could be DeFi projects, trading bots, or dApps
const POTENTIAL_BUILDER_ADDRESSES = [
  // Known builders (already in our system)
  '0x0cbf655b0d22ae71fba3a674b0e1c0c7e7f975af', // pvp.trade
  '0x1cc34f6af34653c515b47a83e1de70ba9b0cda1f', // Axiom
  '0x1922810825c90f4270048b96da7b1803cd8609ef', // Defi App
  '0x6acc0acd626b29b48923228c111c94bd4faa6a43', // Okto
  '0x7975cafdff839ed5047244ed3a0dd82a89866081', // Dexari
  
  // Potential additional builders (need to be discovered/verified)
  // These are example addresses - in practice you'd get these from:
  // - Block explorers
  // - Community discussions
  // - GitHub repositories
  // - Known DeFi project addresses
  '0xa0b86a33e6776b9e15c92f0b1de5f2b89c83a99e',
  '0xb1c28d2e15a5a1f8c96e4f2c7d89e3b8a9d4c5f6',
  '0xc2d39e3f25b6b2g9d97f5e3d8f90a4c9b5d6e7f8',
  // Add more potential addresses here
];

// Alternative discovery methods
export class BuilderDiscovery {
  private api: HyperliquidAPI;

  constructor() {
    this.api = new HyperliquidAPI();
  }

  // Method 1: Test potential addresses for builder activity
  async discoverFromAddressList(): Promise<Array<{
    address: string;
    hasRevenue: boolean;
    totalRewards: number;
    builderRewards: number;
    referralRewards: number;
  }>> {
    console.log('🔍 Scanning potential builder addresses...');
    
    const results = [];
    
    for (const address of POTENTIAL_BUILDER_ADDRESSES) {
      try {
        const rewards = await this.api.getBuilderRewards(address);
        const hasRevenue = rewards.total > 0;
        
        const result = {
          address,
          hasRevenue,
          totalRewards: rewards.total,
          builderRewards: rewards.builderRewards,
          referralRewards: rewards.unclaimedReferralRewards + rewards.claimedReferralRewards
        };
        
        results.push(result);
        
        if (hasRevenue) {
          console.log(`✅ Active builder found: ${address}`);
          console.log(`   Total: $${rewards.total.toLocaleString()}`);
          console.log(`   Builder: $${rewards.builderRewards.toLocaleString()}`);
          console.log(`   Referral: $${(rewards.unclaimedReferralRewards + rewards.claimedReferralRewards).toLocaleString()}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to check ${address}:`, error);
        results.push({
          address,
          hasRevenue: false,
          totalRewards: 0,
          builderRewards: 0,
          referralRewards: 0
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }

  // Method 2: Check for CSV data existence (indicates builder activity)
  async checkBuilderCSVData(addresses: string[], dateRange: string[] = ['20241201', '20241202', '20241203']): Promise<Array<{
    address: string;
    hasCSVData: boolean;
    activeDates: string[];
  }>> {
    console.log('📁 Checking for builder CSV data...');
    
    const results = [];
    
    for (const address of addresses) {
      const activeDates = [];
      
      for (const date of dateRange) {
        try {
          const url = `https://stats-data.hyperliquid.xyz/Mainnet/builder_fills/${address.toLowerCase()}/${date}.csv.lz4`;
          const response = await fetch(url, { method: 'HEAD' });
          
          if (response.ok) {
            activeDates.push(date);
          }
        } catch (error) {
          // CSV doesn't exist for this date
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      results.push({
        address,
        hasCSVData: activeDates.length > 0,
        activeDates
      });
      
      if (activeDates.length > 0) {
        console.log(`📊 CSV data found for ${address} on dates: ${activeDates.join(', ')}`);
      }
    }
    
    return results;
  }

  // Method 3: Analyze known builders for patterns or relationships
  async analyzeKnownBuilders(): Promise<{
    totalRevenue: number;
    averageRevenue: number;
    topBuilder: string;
    revenueDistribution: Array<{ address: string; revenue: number; percentage: number }>;
  }> {
    console.log('📈 Analyzing known builders...');
    
    const knownBuilders = POTENTIAL_BUILDER_ADDRESSES.slice(0, 5); // Our known 5
    const revenues = [];
    let totalRevenue = 0;
    
    for (const address of knownBuilders) {
      try {
        const rewards = await this.api.getBuilderRewards(address);
        revenues.push({ address, revenue: rewards.total });
        totalRevenue += rewards.total;
      } catch (error) {
        console.warn(`Failed to get data for ${address}`);
      }
    }
    
    revenues.sort((a, b) => b.revenue - a.revenue);
    
    const revenueDistribution = revenues.map(item => ({
      address: item.address,
      revenue: item.revenue,
      percentage: (item.revenue / totalRevenue) * 100
    }));
    
    return {
      totalRevenue,
      averageRevenue: totalRevenue / revenues.length,
      topBuilder: revenues[0]?.address || '',
      revenueDistribution
    };
  }

  // Method 4: Generate comprehensive report
  async generateDiscoveryReport(): Promise<{
    knownBuilders: number;
    potentialBuilders: number;
    totalMarketSize: number;
    recommendations: string[];
  }> {
    console.log('📋 Generating builder discovery report...');
    
    const addressResults = await this.discoverFromAddressList();
    const activeBuilders = addressResults.filter(r => r.hasRevenue);
    const analysis = await this.analyzeKnownBuilders();
    
    const recommendations = [
      'Monitor community channels for new project announcements',
      'Check ecosystem directories and GitHub repositories',
      'Analyze high-volume trading addresses from block explorers',
      'Track referral program participants',
      'Look for addresses with consistent CSV data uploads'
    ];
    
    const report = {
      knownBuilders: activeBuilders.length,
      potentialBuilders: addressResults.length - activeBuilders.length,
      totalMarketSize: analysis.totalRevenue,
      recommendations
    };
    
    console.log('📊 Discovery Report:');
    console.log(`   Active builders found: ${report.knownBuilders}`);
    console.log(`   Total market size: $${report.totalMarketSize.toLocaleString()}`);
    console.log(`   Potential addresses tested: ${addressResults.length}`);
    
    return report;
  }
}

// Export utility functions
export const builderDiscovery = new BuilderDiscovery();

// Export potential addresses for manual verification
export { POTENTIAL_BUILDER_ADDRESSES }; 