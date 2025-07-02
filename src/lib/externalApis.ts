import { CryptoProject } from '@/types';
import { HyperliquidAPI } from './hyperliquidApi';

// DeFiLlama API
const DEFILLAMA_BASE_URL = 'https://api.llama.fi';

// Rate limiting helper
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 1000; // 1 second between requests to avoid rate limiting

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
}

// Simplified project mapping for DeFiLlama chain slugs only
const CHAIN_MAPPINGS: Record<string, string> = {
  'Hyperliquid': 'hyperliquid',
  'Berachain': 'berachain',
  'Blast': 'blast',
  'Sonic': 'sonic',
  'Celestia': 'celestia',
  'Optimism': 'op-mainnet',
  'Arbitrum': 'arbitrum',
  'Solana': 'solana',
  'Ethereum': 'ethereum',
  'Story Protocol': 'story',
  'Movement': 'movement',
  'Sui Network': 'sui',
  'Initia': 'initia',
  'Tron': 'tron',
  'Polygon': 'polygon',
  'Ton': 'ton'
};

// App mappings for DeFiLlama protocol slugs
const APP_MAPPINGS: Record<string, string> = {
  'Axiom': 'axiom',
  'Moonshot': 'moonshot.money',
  'Tether': 'tether',
  'Circle': 'circle',
  'Pump.fun': 'pump.fun',
  'Phantom': 'phantom'
};

async function fetchHyperliquidBuilderRevenue(builderAddress: string): Promise<number> {
  try {
    console.log(`🔄 Fetching Hyperliquid builder revenue for ${builderAddress}...`);
    
    const api = new HyperliquidAPI();
    const annualizedData = await api.getAnnualizedBuilderRevenue(builderAddress);
    
    // Use properly calculated annualized revenue based on recent activity
    const annualizedRevenue = annualizedData.annualizedRevenue;
    
    console.log(`✅ ${builderAddress}: $${annualizedRevenue.toLocaleString()} annualized builder revenue (${annualizedData.dataSource})`);
    console.log(`📊 ${builderAddress}: $${annualizedData.totalCumulative.toLocaleString()} total cumulative vs $${annualizedRevenue.toLocaleString()} annualized`);
    
    if (annualizedData.breakdown.tradingFees30d > 0) {
      console.log(`💎 ${builderAddress}: Trading: $${annualizedData.breakdown.tradingFees30d.toFixed(2)}, Referral: $${annualizedData.breakdown.estimatedReferralFees30d.toFixed(2)} (30d breakdown)`);
    }
    
    return annualizedRevenue;
  } catch (error) {
    console.error(`❌ Error fetching Hyperliquid builder revenue for ${builderAddress}:`, error);
    return 0;
  }
}

async function fetchAppProtocolRevenue(protocolName: string): Promise<number> {
  try {
    // Special handling for Pump.fun - aggregate from both pump.fun and pumpswap
    if (protocolName === 'Pump.fun') {
      console.log(`🚀 Special handling for Pump.fun - fetching from both pump.fun and pumpswap`);
      
      const [pumpData, pumpswapData] = await Promise.all([
        fetch(`https://api.llama.fi/summary/fees/pump.fun`).then(res => res.json()),
        fetch(`https://api.llama.fi/summary/fees/pumpswap`).then(res => res.json())
      ]);
      
      // Use 30d data if available, fallback to 7d×52, then 24h×365
      let pumpRevenue = 0;
      let pumpswapRevenue = 0;
      let methodology = '';
      
      if (pumpData.total30d && pumpswapData.total30d) {
        pumpRevenue = (pumpData.total30d || 0) * 12;
        pumpswapRevenue = (pumpswapData.total30d || 0) * 12;
        methodology = '30d total × 12';
      } else if (pumpData.total7d && pumpswapData.total7d) {
        pumpRevenue = (pumpData.total7d || 0) * 52;
        pumpswapRevenue = (pumpswapData.total7d || 0) * 52;
        methodology = '7d total × 52';
      } else if (pumpData.total24h && pumpswapData.total24h) {
        pumpRevenue = (pumpData.total24h || 0) * 365;
        pumpswapRevenue = (pumpswapData.total24h || 0) * 365;
        methodology = '24h × 365';
      }
      
      const totalRevenue = pumpRevenue + pumpswapRevenue;
      console.log(`✅ Pump.fun combined: $${totalRevenue.toLocaleString()} annual revenue (${methodology})`);
      console.log(`   - pump.fun: $${pumpRevenue.toLocaleString()}`);
      console.log(`   - pumpswap: $${pumpswapRevenue.toLocaleString()}`);
      
      return totalRevenue;
    }
    
    // Special handling for Phantom - multi-chain revenue (Solana + Ethereum + Base + Polygon)
    if (protocolName === 'Phantom') {
      console.log(`🔗 Special handling for Phantom - fetching multi-chain data`);
      
      const response = await fetch(`https://api.llama.fi/summary/fees/phantom`);
      const data = await response.json();
      
      if (data.totalDataChartBreakdown) {
        // Calculate total multi-chain revenue from the last 30 days if available
        let totalRevenue = 0;
        let daysCount = 0;
        
        // Get recent data (last 30 entries for daily data)
        const recentData = data.totalDataChartBreakdown.slice(-30);
        
        for (const entry of recentData) {
          if (entry && entry[1]) {
            const dayTotal = Object.values(entry[1]).reduce((sum: number, chainData: any) => {
              return sum + Object.values(chainData).reduce((chainSum: number, value: any) => chainSum + (Number(value) || 0), 0);
            }, 0);
            totalRevenue += dayTotal;
            daysCount++;
          }
        }
        
        if (daysCount > 0) {
          // Use 30d × 12 methodology to match DeFiLlama exactly
          const annualizedRevenue = totalRevenue * 12;
          
          console.log(`✅ Phantom multi-chain: $${annualizedRevenue.toLocaleString()} annual revenue (30d total × 12)`);
          console.log(`   - 30d total: $${totalRevenue.toLocaleString()}`);
          console.log(`   - Days processed: ${daysCount}`);
          
          return annualizedRevenue;
        }
      }
      
      // Fallback to summary data if breakdown not available
      const summaryData = data;
      if (summaryData.total30d) {
        const annualizedRevenue = summaryData.total30d * 12;
        console.log(`✅ Phantom fallback: $${annualizedRevenue.toLocaleString()} annual revenue (30d total × 12)`);
        return annualizedRevenue;
      } else if (summaryData.total7d) {
        const annualizedRevenue = summaryData.total7d * 52;
        console.log(`✅ Phantom fallback: $${annualizedRevenue.toLocaleString()} annual revenue (7d total × 52)`);
        return annualizedRevenue;
      } else if (summaryData.total24h) {
        const annualizedRevenue = summaryData.total24h * 365;
        console.log(`✅ Phantom fallback: $${annualizedRevenue.toLocaleString()} annual revenue (24h × 365)`);
        return annualizedRevenue;
      }
    }

    // Default handling for other protocols
    const slug = APP_MAPPINGS[protocolName] || protocolName.toLowerCase();
    
    const response = await fetch(`https://api.llama.fi/summary/fees/${slug}`);
    if (!response.ok) {
      console.log(`❌ Failed to fetch DeFiLlama revenue for ${protocolName}: ${response.status}`);
      return 0;
    }
    
    const data = await response.json();
    
    // Use 30d data if available, fallback to 7d×52, then 24h×365
    if (data.total30d) {
      const annualizedRevenue = data.total30d * 12;
      console.log(`✅ ${slug}: $${annualizedRevenue.toLocaleString()} annual protocol revenue (30d total × 12)`);
      return annualizedRevenue;
    } else if (data.total7d) {
      const annualizedRevenue = data.total7d * 52;
      console.log(`✅ ${slug}: $${annualizedRevenue.toLocaleString()} annual protocol revenue (7d total × 52)`);
      return annualizedRevenue;
    } else if (data.total24h) {
      const annualizedRevenue = data.total24h * 365;
      console.log(`✅ ${slug}: $${annualizedRevenue.toLocaleString()} annual protocol revenue (24h × 365)`);
      return annualizedRevenue;
    }
    
    console.log(`⚠️ No revenue data found for ${protocolName}`);
    return 0;
  } catch (error) {
    console.error(`❌ Error fetching revenue for ${protocolName}:`, error);
    return 0;
  }
}

async function fetchChainRevenue(chainSlug: string): Promise<number | null> {
  try {
    console.log(`🔄 Fetching revenue for ${chainSlug}...`);
    
    // For all chains, use the standard chain revenue API
    const response = await rateLimitedFetch(`${DEFILLAMA_BASE_URL}/summary/fees/${chainSlug}`);
    
    if (!response.ok) {
      console.log(`❌ Failed to fetch DeFiLlama revenue for ${chainSlug}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Prefer 30-day total × 12 months for consistency, fallback to 7d × 52, then 24h × 365
    let annualizedRevenue: number;
    let dataSource: string;
    
    if (data.total30d) {
      annualizedRevenue = data.total30d * 12;  // 30-day total × 12 months (most consistent)
      dataSource = '30d total × 12';
    } else if (data.total7d) {
      annualizedRevenue = data.total7d * 52;  // 7-day total × 52 weeks (fallback)
      dataSource = '7d total × 52';
    } else {
      annualizedRevenue = (data.total24h || 0) * 365;  // 24h × 365 (last resort)
      dataSource = '24h × 365';
    }
    
    console.log(`✅ ${chainSlug}: $${annualizedRevenue.toLocaleString()} annual revenue (${dataSource})`);
    return annualizedRevenue;
  } catch (error) {
    console.error(`❌ Error fetching revenue for ${chainSlug}:`, error);
    return null;
  }
}

// Fetch app fees data for a given project from DeFiLlama
export async function fetchAppFees(project: CryptoProject): Promise<number | null> {
  // TEMPORARILY DISABLE HEAVY API CALLS TO AVOID CACHE OVERFLOW
  if (project.useDefillama && project.name) {
    try {
      // Only fetch for key projects to reduce payload size
      const keyProjects = ['ethereum', 'solana', 'arbitrum', 'optimism', 'polygon'];
      const projectKey = project.name.toLowerCase().replace(/\s+/g, '-');
      
      if (!keyProjects.includes(projectKey)) {
        console.log(`⚡ Skipping heavy API call for ${project.name} to reduce payload`);
        return null;
      }

      const response = await fetch(`https://api.llama.fi/overview/fees/${projectKey}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        console.error(`❌ Failed to fetch DeFiLlama revenue for ${project.name}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      // Get the most recent 30-day revenue data
      if (data.totalDataChart && data.totalDataChart.length > 0) {
        const recent30Days = data.totalDataChart.slice(-30);
        const total30DayRevenue = recent30Days.reduce((sum: number, entry: any) => {
          return sum + (entry[1] || 0);
        }, 0);
        
        // Annualize the 30-day revenue
        const annualizedRevenue = (total30DayRevenue / 30) * 365;
        console.log(`✅ ${project.name}: $${annualizedRevenue.toLocaleString()} annual app fees (30d total × 12)`);
        return annualizedRevenue;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch app fees for ${project.name}:`, error);
      return null;
    }
  }
  
  return null;
}

// Token mapping for CoinGecko API (updated from spreadsheet)
const COINGECKO_TOKEN_MAP: Record<string, string> = {
  'Hyperliquid': 'hyperliquid',
  'Berachain': 'berachain-bera',
  'Blast': 'blast',
  'Sonic': 'sonic-3',
  'Celestia': 'celestia',
  'Optimism': 'optimism',
  'Arbitrum': 'arbitrum',
  'Solana': 'solana',
  'Ethereum': 'ethereum',
  'Story Protocol': 'story-2',
  'Movement': 'movement',
  'Sui Network': 'sui',
  'Initia': 'initia',
  'Tron': 'tron',
  'Polygon': 'matic-network',
  'Ton': 'the-open-network',
  // Application tokens that do have CoinGecko listings
  'Moonshot': 'moonshot-2',
  'Tether': 'tether',
  'Circle': 'usd-coin',  // Circle's USDC token
  'Pump.fun': 'pump-fun', 
  'Phantom': 'phantom-token-2',
  // Projects without tokens: pvp.trade, Axiom, Okto, Defi App, Dexari (these are apps/services, not tokens)
};

// Removed CoinGeckoPrice interfaces since we now use detailed endpoint directly

// Fetch FDV and price data from CoinGecko using detailed endpoint for accurate FDV
async function fetchMarketData(projects: CryptoProject[]): Promise<{ fdv: Record<string, number>, prices: Record<string, number> }> {
  const fdvData: Record<string, number> = {};
  const priceData: Record<string, number> = {};
  
  // Get tokens that have CoinGecko mapping
  const tokensToFetch = projects
    .map(project => ({ project: project.name, tokenId: COINGECKO_TOKEN_MAP[project.name] }))
    .filter(item => item.tokenId);

  if (tokensToFetch.length === 0) {
    return { fdv: fdvData, prices: priceData };
  }

  console.log(`🪙 Fetching market data for ${tokensToFetch.length} tokens from CoinGecko...`);

  try {
    // Use detailed endpoint for each token to get accurate FDV data
    // This requires individual API calls but provides complete market data
    const promises = tokensToFetch.map(async ({ project, tokenId }) => {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`CoinGecko API error for ${project}: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract current price
        const currentPrice = data.market_data?.current_price?.usd;
        if (currentPrice) {
          priceData[project] = currentPrice;
          console.log(`💰 ${project}: $${currentPrice} current price`);
        }
        
        // Get FDV (preferred) or market cap as fallback
        const fdvValue = data.market_data?.fully_diluted_valuation?.usd;
        const marketCapValue = data.market_data?.market_cap?.usd;
        
        if (fdvValue) {
          fdvData[project] = fdvValue;
          console.log(`💎 ${project}: $${fdvValue.toLocaleString()} FDV`);
        } else if (marketCapValue) {
          fdvData[project] = marketCapValue;
          console.log(`💎 ${project}: $${marketCapValue.toLocaleString()} Market Cap (FDV not available)`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error fetching market data for ${project}:`, error);
      }
    });

    await Promise.all(promises);

    console.log(`✅ Successfully fetched market data for ${Object.keys(fdvData).length} projects`);
    return { fdv: fdvData, prices: priceData };

  } catch (error) {
    console.error('❌ Error in market data fetching process:', error);
    return { fdv: fdvData, prices: priceData };
  }
}

// Calculate returns based on current market data vs funding/TGE
function calculateReturns(project: CryptoProject, currentFDV?: number, currentPrice?: number): CryptoProject {
  const updatedProject = { ...project };
  
  // Calculate return vs. most recent funding round
  if (currentFDV && project.lastFundingRoundValuation) {
    const returnPercent = ((currentFDV - project.lastFundingRoundValuation) / project.lastFundingRoundValuation) * 100;
    updatedProject.returnVsFunding = Math.round(returnPercent * 100) / 100; // Round to 2 decimal places
    console.log(`📈 ${project.name}: ${returnPercent > 0 ? '+' : ''}${returnPercent.toFixed(1)}% vs funding round ($${project.lastFundingRoundValuation.toLocaleString()} → $${currentFDV.toLocaleString()})`);
  }
  
  // Calculate return since TGE
  if (currentPrice && project.tgePrice) {
    const returnPercent = ((currentPrice - project.tgePrice) / project.tgePrice) * 100;
    updatedProject.returnSinceTGE = Math.round(returnPercent * 100) / 100; // Round to 2 decimal places
    console.log(`🚀 ${project.name}: ${returnPercent > 0 ? '+' : ''}${returnPercent.toFixed(1)}% since TGE ($${project.tgePrice} → $${currentPrice})`);
  }
  
  // Store current price for reference
  if (currentPrice) {
    updatedProject.currentPrice = currentPrice;
  }
  
  return updatedProject;
}

export async function enrichAllProjects(baseProjects: CryptoProject[]): Promise<CryptoProject[]> {
  console.log('🔄 Enriching projects with revenue data...');
  
  // Fetch market data for all projects in parallel with revenue data
  const [enrichedProjects, marketData] = await Promise.all([
    Promise.all(
      baseProjects.map(async (project, index) => {
        console.log(`📊 Processing ${project.name} (${project.category})...`);
        
        if (project.useDefillama) {
          // Use DeFiLlama APIs for infrastructure projects and some apps
          if (project.category === 'L1' || project.category === 'L2') {
            // Infrastructure projects - use chain data
            const chainSlug = CHAIN_MAPPINGS[project.name];
            
            if (!chainSlug) {
              console.log(`❌ No DeFiLlama chain mapping found for project: ${project.name}`);
              return {
                ...project,
                ecosystemRevenue: 0,
                appFees: 0,
                annualizedRevenue: 0,
                annualizedAppFees: 0
              };
            }
            
            // Special handling for Hyperliquid - needs both chain AND protocol revenue
            if (project.name === 'Hyperliquid') {
              console.log(`🚀 Special handling for Hyperliquid - fetching both protocol and ecosystem revenue`);
              
              let protocolRevenue = 0;
              let ecosystemRevenue = 0;
              
              try {
                const protocolResponse = await fetch(`https://api.llama.fi/summary/fees/hyperliquid`);
                if (protocolResponse.ok) {
                  const protocolData = await protocolResponse.json();
                  
                  // Calculate ecosystem revenue from the breakdown (Hyperliquid L1 apps)
                  if (protocolData.totalDataChartBreakdown && protocolData.totalDataChartBreakdown.length > 0) {
                    // Get last 30 days of ecosystem data
                    const last30Days = protocolData.totalDataChartBreakdown.slice(-30);
                    let ecosystemTotal30d = 0;
                    
                    for (const [timestamp, breakdown] of last30Days) {
                      if (breakdown && breakdown['Hyperliquid L1']) {
                        // Sum all apps on Hyperliquid L1
                        const l1Apps = breakdown['Hyperliquid L1'];
                        for (const appRevenue of Object.values(l1Apps)) {
                          ecosystemTotal30d += Number(appRevenue) || 0;
                        }
                      }
                    }
                    
                    // Annualize the ecosystem revenue
                    ecosystemRevenue = ecosystemTotal30d * 12;
                    console.log(`✅ Hyperliquid ecosystem (L1 apps): $${ecosystemRevenue.toLocaleString()} annual revenue (30d total × 12)`);
                  }
                  
                  // Protocol revenue is the total minus ecosystem revenue
                  if (protocolData.total30d) {
                    const total30d = protocolData.total30d;
                    // Get protocol-only revenue by subtracting ecosystem from total
                    const protocolOnly30d = total30d - (ecosystemRevenue / 12); // Convert back to 30d
                    protocolRevenue = protocolOnly30d * 12;
                    console.log(`✅ Hyperliquid protocol: $${protocolRevenue.toLocaleString()} annual revenue (30d total × 12)`);
                  } else if (protocolData.total7d) {
                    // Fallback to 7d data
                    const total7d = protocolData.total7d;
                    protocolRevenue = total7d * 52;
                    console.log(`✅ Hyperliquid protocol: $${protocolRevenue.toLocaleString()} annual revenue (7d total × 52)`);
                  } else if (protocolData.total24h) {
                    // Fallback to 24h data
                    const total24h = protocolData.total24h;
                    protocolRevenue = total24h * 365;
                    console.log(`✅ Hyperliquid protocol: $${protocolRevenue.toLocaleString()} annual revenue (24h × 365)`);
                  }
                } else {
                  console.log(`❌ Failed to fetch Hyperliquid protocol revenue: ${protocolResponse.status}`);
                }
              } catch (error) {
                console.error(`❌ Error fetching Hyperliquid revenue:`, error);
              }
              
              const totalAnnualizedRevenue = ecosystemRevenue + protocolRevenue;
              
              console.log(`💎 Hyperliquid breakdown:`);
              console.log(`   - Ecosystem (L1 apps) revenue: $${ecosystemRevenue.toLocaleString()}`);
              console.log(`   - Protocol revenue: $${protocolRevenue.toLocaleString()}`);
              console.log(`   - Total annualized revenue: $${totalAnnualizedRevenue.toLocaleString()}`);
              
              return {
                ...project,
                ecosystemRevenue: ecosystemRevenue,
                appFees: protocolRevenue,  // Store protocol revenue as appFees for display
                annualizedRevenue: totalAnnualizedRevenue,
                annualizedAppFees: protocolRevenue
              };
            }
            
            // Regular handling for other L1/L2 projects
            // Fetch both chain revenue and app fees (now returns annualized values)
            const [annualizedRevenue, annualizedAppFees] = await Promise.all([
              fetchChainRevenue(chainSlug),
              fetchAppFees(project)
            ]);
            
            const finalAnnualizedRevenue = annualizedRevenue || 0;
            const finalAnnualizedAppFees = annualizedAppFees || 0;
            
            return {
              ...project,
              ecosystemRevenue: finalAnnualizedRevenue,  // For compatibility with existing code
              appFees: finalAnnualizedAppFees,  // For compatibility with existing code  
              annualizedRevenue: finalAnnualizedRevenue,
              annualizedAppFees: finalAnnualizedAppFees
            };
          } else {
            // Application projects using DeFiLlama protocol data
            const appSlug = APP_MAPPINGS[project.name];
            
            if (!appSlug) {
              console.log(`❌ No DeFiLlama app mapping found for project: ${project.name}`);
              return {
                ...project,
                ecosystemRevenue: 0,
                appFees: 0,
                annualizedRevenue: 0,
                annualizedAppFees: 0
              };
            }
            
            const annualizedRevenue = await fetchAppProtocolRevenue(project.name);
            const finalAnnualizedRevenue = annualizedRevenue || 0;
            
            return {
              ...project,
              ecosystemRevenue: finalAnnualizedRevenue,
              appFees: 0,  // Apps don't have separate app fees
              annualizedRevenue: finalAnnualizedRevenue,
              annualizedAppFees: 0
            };
          }
        } else {
          // Use Hyperliquid APIs for apps that don't use DeFiLlama
          if (!project.hyperliquidBuilder) {
            console.log(`❌ No Hyperliquid builder address found for project: ${project.name}`);
            return {
              ...project,
              ecosystemRevenue: 0,
              appFees: 0,
              annualizedRevenue: 0,
              annualizedAppFees: 0
            };
          }
          
          const annualizedRevenue = await fetchHyperliquidBuilderRevenue(project.hyperliquidBuilder);
          
          console.log(`🎯 ${project.name}: Final annualized revenue = $${annualizedRevenue.toLocaleString()}`);
          
          return {
            ...project,
            ecosystemRevenue: annualizedRevenue,
            appFees: 0,  // Builder revenue is the main metric for these apps
            annualizedRevenue: annualizedRevenue,
            annualizedAppFees: 0
          };
        }
      })
    ),
    fetchMarketData(baseProjects)
  ]);
  
  // Merge market data and calculate returns for enriched projects
  const finalEnrichedProjects = enrichedProjects.map((project: CryptoProject) => {
    const currentFDV = marketData.fdv[project.name];
    const currentPrice = marketData.prices[project.name];
    
    // Calculate returns and merge all data
    const projectWithReturns = calculateReturns(project, currentFDV, currentPrice);
    
    return {
      ...projectWithReturns,
      fdv: currentFDV || undefined
    };
  });
  
  console.log('✅ Finished enriching projects');
  return finalEnrichedProjects;
} 