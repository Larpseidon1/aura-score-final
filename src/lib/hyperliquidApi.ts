import LZ4 from 'lz4js';

interface HyperliquidFill {
  coin: string;
  px: string;
  sz: string;
  side: 'A' | 'B'; // A = Ask/Sell, B = Bid/Buy
  time: number;
  fee: string;
  feeToken: string;
  builderFee?: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  tid: number;
}

interface ReferralData {
  cumVlm: string;
  unclaimedRewards: string;
  claimedRewards: string;
  builderRewards: string;
}

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

export class HyperliquidAPI {
  private async makeRequest(payload: any) {
    const response = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`);
    }

    return response.json();
  }

  async getUserFills(userAddress: string, startTime?: number, endTime?: number): Promise<HyperliquidFill[]> {
    const payload = startTime ? {
      type: 'userFillsByTime',
      user: userAddress,
      startTime,
      endTime: endTime || Date.now(),
    } : {
      type: 'userFills',
      user: userAddress,
    };

    return this.makeRequest(payload);
  }

  async getReferralData(userAddress: string): Promise<ReferralData> {
    const payload = {
      type: 'referral',
      user: userAddress,
    };

    return this.makeRequest(payload);
  }

  async getMaxBuilderFee(userAddress: string, builderAddress: string): Promise<number> {
    const payload = {
      type: 'maxBuilderFee',
      user: userAddress,
      builder: builderAddress,
    };

    return this.makeRequest(payload);
  }

  // Get builder rewards breakdown (for stacked charts)
  async getBuilderRewards(userAddress: string): Promise<{
    total: number;
    builderRewards: number;
    unclaimedReferralRewards: number;
    claimedReferralRewards: number;
    cumulativeVolume: number;
  }> {
    try {
      const referralData = await this.getReferralData(userAddress);
      
      // Get all types of rewards:
      // 1. Direct builder rewards (fees from building)
      const builderRewards = parseFloat(referralData.builderRewards || '0');
      
      // 2. Referral rewards (fees from referring users)  
      const unclaimedReferralRewards = parseFloat(referralData.unclaimedRewards || '0');
      const claimedReferralRewards = parseFloat(referralData.claimedRewards || '0');
      
      // Total rewards = builder fees + referral fees
      const total = builderRewards + unclaimedReferralRewards + claimedReferralRewards;
      
      // 3. Calculate REAL notional volume from total fees
      const cumulativeVolume = await this.calculateNotionalVolume(userAddress, total);
      
      return {
        total,
        builderRewards,
        unclaimedReferralRewards,
        claimedReferralRewards,
        cumulativeVolume
      };
    } catch (error) {
      console.error('Error fetching builder rewards:', error);
      return {
        total: 0,
        builderRewards: 0,
        unclaimedReferralRewards: 0,
        claimedReferralRewards: 0,
        cumulativeVolume: 0
      };
    }
  }

  // Estimate notional volume from total fees (more accurate for high-volume builders)
  async calculateNotionalVolume(userAddress: string, totalFees: number): Promise<number> {
    try {
      // Get sample fills to understand trading patterns
      const fills = await this.getUserFills(userAddress);
      
      if (fills.length === 0) {
        // Fallback: estimate from fees using typical derivatives fee rate
        const estimatedVolume = totalFees / 0.0003; // Assuming ~0.03% average fee rate
        console.log(`💎 ${userAddress}: Estimated ${estimatedVolume.toLocaleString()} volume from fees (no fills data)`);
        return estimatedVolume;
      }
      
      // Calculate actual fee rate from sample data
      let sampleVolume = 0;
      let sampleFees = 0;
      
      for (const fill of fills) {
        const price = parseFloat(fill.px || '0');
        const size = parseFloat(fill.sz || '0');
        const fee = parseFloat(fill.fee || '0');
        const builderFee = parseFloat(fill.builderFee || '0');
        
        sampleVolume += price * size;
        sampleFees += fee + builderFee;
      }
      
      if (sampleFees > 0 && sampleVolume > 0) {
        // Use observed fee rate to estimate total volume
        const observedFeeRate = sampleFees / sampleVolume;
        const estimatedTotalVolume = totalFees / observedFeeRate;
        
        console.log(`💎 ${userAddress}: Fee rate ${(observedFeeRate * 100).toFixed(4)}% from ${fills.length} fills`);
        console.log(`💎 ${userAddress}: Estimated ${estimatedTotalVolume.toLocaleString()} total volume from $${totalFees.toLocaleString()} fees`);
        
        return estimatedTotalVolume;
      } else {
        // Fallback to default rate
        const estimatedVolume = totalFees / 0.0003;
        console.log(`💎 ${userAddress}: Estimated ${estimatedVolume.toLocaleString()} volume using default 0.03% fee rate`);
        return estimatedVolume;
      }
    } catch (error) {
      console.error('Error calculating notional volume:', error);
      // Fallback: estimate from fees
      const estimatedVolume = totalFees / 0.0003;
      return estimatedVolume;
    }
  }

  // Fetch and parse builder fills CSV data for a specific date
  async getBuilderFillsCSV(builderAddress: string, date: string): Promise<any[]> {
    const url = `https://stats-data.hyperliquid.xyz/Mainnet/builder_fills/${builderAddress.toLowerCase()}/${date}.csv.lz4`;
    
    try {
      console.log(`🔄 Fetching builder fills for ${builderAddress} on ${date}...`);
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      
      // Get the compressed data as ArrayBuffer
      const compressedData = await response.arrayBuffer();
      
      // Decompress using LZ4
      const decompressed = LZ4.decompress(new Uint8Array(compressedData));
      
      // Convert to string and parse CSV
      const csvText = new TextDecoder().decode(decompressed);
      const lines = csvText.trim().split('\n');
      
      if (lines.length <= 1) return []; // No data or just headers
      
      // Parse CSV (assuming it has headers)
      const headers = lines[0].split(',');
      const fills = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const fill: any = {};
        headers.forEach((header, index) => {
          fill[header.trim()] = values[index]?.trim() || '';
        });
        fills.push(fill);
      }
      
      console.log(`✅ Parsed ${fills.length} fills for ${builderAddress} on ${date}`);
      return fills;
      
    } catch (error) {
      console.warn(`❌ Failed to fetch/parse builder fills for ${builderAddress} on ${date}:`, error);
      return [];
    }
  }

  // Test if an address is a valid builder (has revenue > 0)
  async testBuilderAddress(address: string): Promise<boolean> {
    try {
      const rewards = await this.getBuilderRewards(address);
      return rewards.total > 0;
    } catch (error) {
      return false;
    }
  }

  // Check if builder CSV data exists for a specific date
  async checkBuilderCSVExists(builderAddress: string, date: string): Promise<boolean> {
    const url = `https://stats-data.hyperliquid.xyz/Mainnet/builder_fills/${builderAddress.toLowerCase()}/${date}.csv.lz4`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Discover builders by testing a list of potential addresses
  async discoverBuilders(potentialAddresses: string[]): Promise<Array<{
    address: string;
    hasRevenue: boolean;
    totalRewards: number;
  }>> {
    const results = [];
    
    for (const address of potentialAddresses) {
      try {
        const rewards = await this.getBuilderRewards(address);
        const hasRevenue = rewards.total > 0;
        
        results.push({
          address,
          hasRevenue,
          totalRewards: rewards.total
        });
        
        if (hasRevenue) {
          console.log(`🎯 Found active builder: ${address} with $${rewards.total.toLocaleString()} total rewards`);
        }
      } catch (error) {
        console.warn(`❌ Failed to check ${address}:`, error);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Get real 30-day builder revenue combining direct builder fees + referral fees
  async getAnnualizedBuilderRevenue(userAddress: string): Promise<{
    annualizedRevenue: number;
    dataSource: string;
    totalCumulative: number;
    breakdown: {
      tradingFees30d: number;
      estimatedReferralFees30d: number;
      totalFees30d: number;
    };
  }> {
    try {
      // Get cumulative data for baseline comparison
      const referralData = await this.getReferralData(userAddress);
      const builderRewards = parseFloat(referralData.builderRewards || '0');
      const unclaimedReferralRewards = parseFloat(referralData.unclaimedRewards || '0');
      const claimedReferralRewards = parseFloat(referralData.claimedRewards || '0');
      
      // Total cumulative = builder rewards + all referral fees
      const totalCumulative = builderRewards + unclaimedReferralRewards + claimedReferralRewards;
      const cumulativeReferralFees = unclaimedReferralRewards + claimedReferralRewards;

      console.log(`🔄 Fetching real 30-day data for ${userAddress}...`);
      console.log(`📊 Cumulative breakdown: Builder=$${builderRewards.toLocaleString()}, Referral=$${cumulativeReferralFees.toLocaleString()}`);
      
      // 1. Get direct builder fees from CSV fills (last 30 days)
      let directBuilderFees30d = 0;
      let daysWithBuilderData = 0;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        
        const fills = await this.getBuilderFillsCSV(userAddress, dateStr);
        
        if (fills.length > 0) {
          daysWithBuilderData++;
          
          // Sum direct builder fees from CSV
          for (const fill of fills) {
            const builderFee = parseFloat(fill.builder_fee || '0');
            directBuilderFees30d += builderFee;
          }
        }
      }

      // 2. Estimate 30-day referral fees based on recent activity
      let estimatedReferralFees30d = 0;
      
      if (cumulativeReferralFees > 0) {
        // Check recent activity via getUserFills to gauge current referral activity level
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        try {
          const recentFills = await this.getUserFills(userAddress, sevenDaysAgo, now);
          const olderFills = await this.getUserFills(userAddress, thirtyDaysAgo, sevenDaysAgo);
          
          if (recentFills.length > 0) {
            // High recent activity → use 25% of cumulative as current annual rate
            estimatedReferralFees30d = (cumulativeReferralFees * 0.25) / 12; // 25% annually → monthly
            console.log(`💪 ${userAddress}: High referral activity detected, using 25% annual rate`);
          } else if (olderFills.length > 0) {
            // Some activity → use 10% of cumulative as current annual rate  
            estimatedReferralFees30d = (cumulativeReferralFees * 0.10) / 12; // 10% annually → monthly
            console.log(`📈 ${userAddress}: Moderate referral activity detected, using 10% annual rate`);
          } else {
            // Low activity → use 2% of cumulative as current annual rate
            estimatedReferralFees30d = (cumulativeReferralFees * 0.02) / 12; // 2% annually → monthly
            console.log(`📉 ${userAddress}: Low referral activity detected, using 2% annual rate`);
          }
        } catch (error) {
          // Fallback: conservative estimate
          estimatedReferralFees30d = (cumulativeReferralFees * 0.05) / 12; // 5% annually → monthly
          console.log(`🔄 ${userAddress}: Using fallback 5% referral rate due to API error`);
        }
      }

      // 3. Combine both revenue streams
      const totalFees30d = directBuilderFees30d + estimatedReferralFees30d;
      const annualizedRevenue = totalFees30d * 12;

      console.log(`✅ ${userAddress}: Direct builder fees: $${directBuilderFees30d.toFixed(3)} (30d)`);
      console.log(`✅ ${userAddress}: Estimated referral fees: $${estimatedReferralFees30d.toFixed(3)} (30d)`);
      console.log(`✅ ${userAddress}: Total fees: $${totalFees30d.toFixed(3)} (30d) → $${annualizedRevenue.toLocaleString()} annualized`);
      console.log(`📊 ${userAddress}: $${totalCumulative.toLocaleString()} total cumulative vs $${annualizedRevenue.toLocaleString()} annualized`);

      return {
        annualizedRevenue,
        dataSource: daysWithBuilderData > 0 ? `${daysWithBuilderData}d direct + referral estimate` : 'referral estimate only',
        totalCumulative,
        breakdown: {
          tradingFees30d: directBuilderFees30d,
          estimatedReferralFees30d,
          totalFees30d
        }
      };

    } catch (error) {
      console.error(`❌ Error fetching real 30-day data for ${userAddress}:`, error);
      
      // Fallback to cumulative estimation
      const referralData = await this.getReferralData(userAddress);
      const builderRewards = parseFloat(referralData.builderRewards || '0');
      const unclaimedReferralRewards = parseFloat(referralData.unclaimedRewards || '0');
      const claimedReferralRewards = parseFloat(referralData.claimedRewards || '0');
      const totalCumulative = builderRewards + unclaimedReferralRewards + claimedReferralRewards;
      
      const estimatedAnnual = totalCumulative * 2; // 6mo → 12mo assumption
      
      console.log(`🔄 ${userAddress}: Using cumulative fallback → $${estimatedAnnual.toLocaleString()} estimated annual`);
      
      return {
        annualizedRevenue: estimatedAnnual,
        dataSource: 'estimated from 6mo avg cumulative',
        totalCumulative,
        breakdown: {
          tradingFees30d: 0,
          estimatedReferralFees30d: totalCumulative / 6, // 6mo average as monthly estimate
          totalFees30d: totalCumulative / 6
        }
      };
    }
  }
}

export const hyperliquidApi = new HyperliquidAPI(); 