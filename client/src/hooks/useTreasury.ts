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
}

interface TreasuryData {
  totalValue: number;
  circulatingSupply: number;
  collateralizationRatio: number;
  assets: TreasuryAsset[];
}

export const useTreasury = () => {
  const { toast } = useToast();
  const { contracts } = useEthersContracts();
  
  const [loading, setLoading] = useState(true);
  const [treasuryData, setTreasuryData] = useState<TreasuryData>({
    totalValue: 0,
    circulatingSupply: 0,
    collateralizationRatio: 0,
    assets: []
  });
  
  const fetchTreasuryData = useCallback(async () => {
    if (!contracts.treasury || !contracts.vusd) {
      return;
    }
    
    try {
      setLoading(true);
      
      const assets: TreasuryAsset[] = [];
      let totalValue = 0;
      
      // Get VUSD circulating supply
      const circulatingSupply = parseFloat(
        ethers.formatUnits(await contracts.vusd.totalSupply(), 18)
      );
      
      // Get Treasury assets
      const whitelistedTokens = await contracts.treasury.whitelistedTokens();
      
      for (const tokenAddress of whitelistedTokens) {
        const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
        
        if (token) {
          const withdrawable = await contracts.treasury.withdrawable(tokenAddress);
          const balance = parseFloat(ethers.formatUnits(withdrawable, token.decimals));
          
          // For simplicity, we're assuming 1:1 value for stablecoins
          const value = balance;
          
          assets.push({
            symbol: token.symbol,
            name: token.name,
            value,
            balance
          });
          
          totalValue += value;
        }
      }
      
      // Calculate collateralization ratio
      const collateralizationRatio = circulatingSupply > 0 ? totalValue / circulatingSupply : 0;
      
      setTreasuryData({
        totalValue,
        circulatingSupply,
        collateralizationRatio,
        assets
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
    // Load dummy data initially (for fast development)
    setTreasuryData({
      totalValue: 4521834,
      circulatingSupply: 4500000,
      collateralizationRatio: 1.0048,
      assets: [
        { symbol: 'USDC', name: 'USD Coin', value: 2105322, balance: 2105322 },
        { symbol: 'DAI', name: 'Dai Stablecoin', value: 1826409, balance: 1826409 },
        { symbol: 'USDT', name: 'Tether USD', value: 590103, balance: 590103 }
      ]
    });
    setLoading(false);
    
    // Fetch real data
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
