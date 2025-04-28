/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useEthersContracts } from './useEthersContracts';
import { useToast } from './use-toast';
import { SUPPORTED_TOKENS } from '@/constants/tokens';
import { VUSD_ADDRESS } from '@/constants/contracts';
import { T2_ASSETS, AssetType, STABLECOIN_ADDRESSES } from '@/constants/treasuryAssets';

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
  
  // Using T2_ASSETS and AssetType imported from constants/treasuryAssets.ts
  
  // Function to fetch price of ETH in USD using CoinGecko API
  const fetchEthPrice = async (): Promise<number> => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      // Fallback price if API call fails
      return 3500;
    }
  };
  
  // Specialized function to value stETH assets
  const valueStakedEthAsset = async (
    tokenContract: ethers.Contract,
    tokenBalance: bigint,
    ethPrice: number,
    decimals: number
  ): Promise<{ value: number, balance: number }> => {
    let balance = parseFloat(ethers.formatUnits(tokenBalance, decimals));
    let ethEquivalent = balance; // Default 1:1
    
    // If Lido's specific conversion method is available, use it
    if (tokenContract.getPooledEthByShares) {
      try {
        const result = await tokenContract.getPooledEthByShares(tokenBalance);
        ethEquivalent = parseFloat(ethers.formatUnits(result, 18));
      } catch (error) {
        console.error('Error getting stETH exchange rate:', error);
      }
    }
    
    // Calculate USD value by multiplying ETH equivalent by ETH price
    const value = ethEquivalent * ethPrice;
    
    return { value, balance };
  };
  
  // Specialized function to value LP tokens
  const valueLpTokenAsset = async (
    tokenContract: ethers.Contract,
    tokenBalance: bigint,
    ethPrice: number,
    decimals: number
  ): Promise<{ value: number, balance: number }> => {
    const balance = parseFloat(ethers.formatUnits(tokenBalance, decimals));
    let value = balance * ethPrice / 2; // Default assumption (half ETH, half something else)
    
    // If SushiSwap LP token functions are available
    if (tokenContract.getReserves && tokenContract.totalSupply && 
        tokenContract.token0 && tokenContract.token1) {
      try {
        // Get total supply and calculate ownership percentage
        const totalSupply = await tokenContract.totalSupply();
        
        // Calculate ownership ratio as a floating point number (0.0-1.0)
        const ownershipRatio = Number(tokenBalance) / Number(totalSupply);
        
        // Get reserves and token addresses
        const [reserve0, reserve1] = await tokenContract.getReserves();
        const token0Address = await tokenContract.token0();
        const token1Address = await tokenContract.token1();
        
        // Get the addresses in lowercase for comparison
        const token0AddressLower = token0Address.toLowerCase();
        const token1AddressLower = token1Address.toLowerCase();
        const vusdAddressLower = VUSD_ADDRESS.toLowerCase();
        
        // Get stablecoin addresses from constants for comparison
        const usdcAddressLower = STABLECOIN_ADDRESSES.USDC.toLowerCase();
        const usdtAddressLower = STABLECOIN_ADDRESSES.USDT.toLowerCase();
        const daiAddressLower = STABLECOIN_ADDRESSES.DAI.toLowerCase();
        
        // Determine token types and values based on the pair
        if (token0AddressLower === vusdAddressLower || token1AddressLower === vusdAddressLower) {
          // This is a VUSD pair
          const vusdReserve = token0AddressLower === vusdAddressLower ? reserve0 : reserve1;
          const otherTokenReserve = token0AddressLower === vusdAddressLower ? reserve1 : reserve0;
          const otherTokenAddress = token0AddressLower === vusdAddressLower ? token1AddressLower : token0AddressLower;
          
          // Calculate owned VUSD (always 1:1 with USD)
          const ownedVusd = parseFloat(ethers.formatUnits(vusdReserve, 18)) * ownershipRatio;
          
          let ownedOtherValue = 0;
          
          if (otherTokenAddress === usdcAddressLower) {
            // USDC pair - stablecoin is 1:1 with USD, but has 6 decimals
            ownedOtherValue = parseFloat(ethers.formatUnits(otherTokenReserve, 6)) * ownershipRatio;
          } else if (otherTokenAddress === usdtAddressLower) {
            // USDT pair - stablecoin is 1:1 with USD, but has 6 decimals
            ownedOtherValue = parseFloat(ethers.formatUnits(otherTokenReserve, 6)) * ownershipRatio;
          } else if (otherTokenAddress === daiAddressLower) {
            // DAI pair - stablecoin is 1:1 with USD, has 18 decimals
            ownedOtherValue = parseFloat(ethers.formatUnits(otherTokenReserve, 18)) * ownershipRatio;
          } else {
            // Assume it's ETH or an ETH-like token
            ownedOtherValue = parseFloat(ethers.formatUnits(otherTokenReserve, 18)) * ownershipRatio * ethPrice;
          }
          
          // Total value is the sum of both sides
          value = ownedVusd + ownedOtherValue;
        } else {
          // Not a VUSD pair, use default valuation
          // This is a simplified approach and should be expanded with more token prices
          const reserve0Value = parseFloat(ethers.formatUnits(reserve0, 18)) * ownershipRatio;
          const reserve1Value = parseFloat(ethers.formatUnits(reserve1, 18)) * ownershipRatio;
          value = (reserve0Value + reserve1Value) * ethPrice / 2;
        }
      } catch (error) {
        console.error('Error calculating LP token value:', error);
      }
    }
    
    return { value, balance };
  };
  
  // Generic function for other ERC20 tokens
  const valueGenericErc20Asset = async (
    tokenContract: ethers.Contract,
    tokenBalance: bigint,
    decimals: number
  ): Promise<{ value: number, balance: number }> => {
    const balance = parseFloat(ethers.formatUnits(tokenBalance, decimals));
    
    // In a production environment, we would integrate with a price oracle here
    // For demonstration, we'll use a simple approximation
    // This should be replaced with a proper oracle in production
    const value = balance * 10; // Placeholder, replace with price oracle
    
    return { value, balance };
  };

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
      // Fetch the current ETH price in USD once to avoid multiple API calls
      const ethPrice = await fetchEthPrice();
      
      for (const t2Asset of T2_ASSETS) {
        try {
          // Get the provider from the connected contract
          const provider = await contracts.treasury.runner?.provider;
          if (!provider) {
            throw new Error("Provider not available");
          }
          
          // Basic ERC20 ABI functions + any asset-specific functions
          const combinedAbi = [
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            ...(t2Asset.extraAbi || [])
          ];
          
          // Create contract instance for the token
          const tokenContract = new ethers.Contract(
            t2Asset.address,
            combinedAbi,
            provider
          );
          
          // Get necessary data from blockchain
          const treasuryAddress = await contracts.treasury.getAddress();
          const tokenBalance = await tokenContract.balanceOf(treasuryAddress);
          
          // Use the appropriate valuation function based on asset type
          let result: { value: number, balance: number };
          
          switch (t2Asset.assetType) {
            case AssetType.STAKED_ETH:
              result = await valueStakedEthAsset(
                tokenContract,
                tokenBalance,
                ethPrice,
                t2Asset.decimals
              );
              break;
              
            case AssetType.LP_TOKEN:
              result = await valueLpTokenAsset(
                tokenContract,
                tokenBalance,
                ethPrice, 
                t2Asset.decimals
              );
              break;
              
            case AssetType.GENERIC_ERC20:
            default:
              result = await valueGenericErc20Asset(
                tokenContract,
                tokenBalance,
                t2Asset.decimals
              );
              break;
          }
          
          const { value, balance: formattedBalance } = result;
          
          t2Assets.push({
            symbol: t2Asset.symbol,
            name: t2Asset.name,
            value,
            balance: formattedBalance,
            address: t2Asset.address
          });
          
          t2Value += value;
          
        } catch (error) {
          console.error(`Error fetching T2 asset ${t2Asset.symbol}:`, error);
          
          // For testing and development, add placeholder data when errors occur
          if (process.env.NODE_ENV === 'development') {
            const placeholderValue = t2Asset.symbol === 'stETH' ? 125000 : 75000;
            t2Assets.push({
              symbol: t2Asset.symbol,
              name: t2Asset.name,
              value: placeholderValue,
              balance: placeholderValue / 3500, // Assuming ETH price of 3500
              address: t2Asset.address
            });
            t2Value += placeholderValue;
          }
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
    
    // Fetch real data only once when the component mounts
    fetchTreasuryData();
    
    // No interval refresh - users can manually refresh by reloading the page
  }, [fetchTreasuryData]);
  
  return {
    treasuryData,
    loading,
    refreshTreasuryData: fetchTreasuryData
  };
};
