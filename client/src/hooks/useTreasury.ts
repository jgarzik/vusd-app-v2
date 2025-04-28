import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useEthersContracts } from './useEthersContracts';
import { useToast } from './use-toast';
import { SUPPORTED_TOKENS } from '@/constants/tokens';

interface TreasuryAsset {
  symbol: string;
  name: string;
  value: number;
  balance: number;
  address: string;
}

interface TreasuryData {
  totalValue: number;
  t1Value: number; // Whitelisted stablecoins (USDC, USDT, DAI)
  t2Value: number; // Non-whitelisted assets (stETH, LP tokens, etc)
  circulatingSupply: number;
  collateralizationRatio: number;
  excessValue: number; // Value in treasury in excess of VUSD supply
  t1Assets: TreasuryAsset[]; // Tranche 1 assets (whitelisted stablecoins)
  t2Assets: TreasuryAsset[]; // Tranche 2 assets (other assets in treasury)
}

export const useTreasury = () => {
  const { toast } = useToast();
  const { contracts } = useEthersContracts();
  
  const [loading, setLoading] = useState(true);
  const [treasuryData, setTreasuryData] = useState<TreasuryData>({
    totalValue: 4721834,
    t1Value: 4521834,
    t2Value: 200000,
    circulatingSupply: 4500000,
    collateralizationRatio: 1.049,
    excessValue: 221834,
    t1Assets: [
      { symbol: 'USDC', name: 'USD Coin', value: 2105322, balance: 2105322, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      { symbol: 'DAI', name: 'Dai Stablecoin', value: 1826409, balance: 1826409, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { symbol: 'USDT', name: 'Tether USD', value: 590103, balance: 590103, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
    ],
    t2Assets: [
      { symbol: 'stETH', name: 'Lido Staked ETH', value: 125000, balance: 125000, address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' },
      { symbol: 'VUSD/ETH LP', name: 'SushiSwap VUSD/ETH LP', value: 75000, balance: 75000, address: '0xb90047676cC13e68632c55cB5b7cBd8A4C5A0A8E' }
    ]
  });
  
  // T2 assets that we know are in the treasury but not in the whitelisted tokens list
  const T2_ASSETS = [
    {
      address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      symbol: 'stETH',
      name: 'Lido Staked ETH',
      decimals: 18,
      estimated_value: 125000 // Placeholder value in USD
    },
    {
      address: '0xb90047676cC13e68632c55cB5b7cBd8A4C5A0A8E',
      symbol: 'VUSD/ETH LP',
      name: 'SushiSwap VUSD/ETH LP',
      decimals: 18,
      estimated_value: 75000 // Placeholder value in USD
    }
  ];

  const fetchTreasuryData = useCallback(async () => {
    if (!contracts.treasury || !contracts.vusd) {
      return;
    }
    
    try {
      setLoading(true);
      
      const t1Assets: TreasuryAsset[] = [];
      const t2Assets: TreasuryAsset[] = [];
      
      let t1Value = 0;
      let t2Value = 0;
      
      // Get VUSD circulating supply
      const circulatingSupply = parseFloat(
        ethers.formatUnits(await contracts.vusd.totalSupply(), 18)
      );
      
      // Get T1 Treasury assets (whitelisted stablecoins)
      const whitelistedTokens = await contracts.treasury.whitelistedTokens();
      
      for (const tokenAddress of whitelistedTokens) {
        const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
        
        if (token) {
          const withdrawable = await contracts.treasury.withdrawable(tokenAddress);
          const balance = parseFloat(ethers.formatUnits(withdrawable, token.decimals));
          
          // For whitelisted stablecoins, we assume 1:1 value with USD
          const value = balance;
          
          t1Assets.push({
            symbol: token.symbol,
            name: token.name,
            value,
            balance,
            address: tokenAddress
          });
          
          t1Value += value;
        }
      }
      
      // Add T2 assets (non-whitelisted assets)
      // In production, we would query the blockchain for these token balances
      for (const t2Asset of T2_ASSETS) {
        try {
          // Create an ERC20 contract instance for the token
          const tokenContract = new ethers.Contract(
            t2Asset.address,
            [
              'function balanceOf(address owner) view returns (uint256)',
              'function decimals() view returns (uint8)'
            ],
            new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
          );
          
          // For demonstration purposes, we're still using the hardcoded values
          // In production, we would uncomment this code:
          /*
          // Get the token balance of the treasury
          const balance = await tokenContract.balanceOf(contracts.treasury.target);
          
          // Get the token decimals if not known
          const decimals = t2Asset.decimals || await tokenContract.decimals();
          
          // Convert to a readable format
          const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
          
          // For non-stablecoin assets, we would need a price oracle to get the USD value
          // For this example, we're assuming a fixed price
          const pricePerToken = t2Asset.symbol === 'stETH' ? 3500 : 1; // Example price
          const value = formattedBalance * pricePerToken;
          */
          
          // Using hardcoded values for now
          const value = t2Asset.estimated_value;
          const balance = value; // Assuming 1:1 for simplicity
          
          t2Assets.push({
            symbol: t2Asset.symbol,
            name: t2Asset.name,
            value,
            balance,
            address: t2Asset.address
          });
          
          t2Value += value;
        } catch (error) {
          console.error(`Error fetching T2 asset ${t2Asset.symbol}:`, error);
        }
      }
      
      // Calculate total value and collateralization ratio
      const totalValue = t1Value + t2Value;
      const collateralizationRatio = circulatingSupply > 0 ? totalValue / circulatingSupply : 0;
      const excessValue = totalValue - circulatingSupply;
      
      setTreasuryData({
        totalValue,
        t1Value,
        t2Value,
        circulatingSupply,
        collateralizationRatio,
        excessValue,
        t1Assets,
        t2Assets
      });
    } catch (error) {
      console.error('Error fetching treasury data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch treasury data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [contracts.treasury, contracts.vusd, toast]);
  
  useEffect(() => {
    // Initial data is already set in useState
    setLoading(false);
    
    // Fetch real data if needed
    fetchTreasuryData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchTreasuryData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [fetchTreasuryData]);
  
  return {
    treasuryData,
    loading,
    refreshTreasuryData: fetchTreasuryData
  };
};
