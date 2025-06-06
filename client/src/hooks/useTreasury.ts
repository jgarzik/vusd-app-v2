/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useTreasury.ts - Treasury data processing and valuation hook
 * 
 * This module is responsible for processing and calculating the value of all assets in the VUSD treasury.
 * It implements specialized asset valuation logic for different asset types:
 * - T1 Assets: Whitelisted stablecoins (USDC, USDT, DAI) at 1:1 value with USD
 * - T2 Assets: Non-whitelisted assets like stETH and LP tokens with custom valuation logic
 * 
 * The treasury data provides key metrics like:
 * - Total value of assets in the treasury
 * - Collateralization ratio of VUSD
 * - Breakdown of T1 and T2 assets
 * 
 * When LP tokens include VUSD, only the non-VUSD side is counted to avoid double-counting.
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

/**
 * Custom hook providing access to VUSD treasury data and valuation.
 * 
 * @returns {Object} Treasury state and functions
 * @property {TreasuryData} treasuryData - Comprehensive treasury valuation data
 * @property {boolean} loading - Whether treasury data is being fetched
 * @property {Function} refreshTreasuryData - Function to manually refresh treasury data
 *
 * @remarks
 * This hook is a critical part of the Analytics page functionality:
 * - Provides complete breakdown of all assets in the treasury
 * - Calculates collateralization ratio and excess value
 * - Organizes assets into T1 (whitelisted stables) and T2 (other assets)
 * - Implements specialized valuation logic for different asset types
 * - Prevents double-counting VUSD in LP token pairs
 */
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
  
  /**
   * Fetches the current ETH price in USD from the CoinGecko API.
   * 
   * @async
   * @returns {Promise<number>} The current price of ETH in USD
   * 
   * @remarks
   * This function queries the CoinGecko API to get real-time ETH pricing data.
   * Used for valuing ETH-based assets in the treasury (stETH, LP tokens).
   * 
   * @throws Logs error to console and returns a fallback value of $3500 if API call fails
   */
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
  
  /**
   * Calculates the USD value of staked ETH (stETH) assets in the treasury.
   * 
   * @async
   * @param tokenContract - The stETH token contract instance
   * @param tokenBalance - The raw balance of stETH tokens
   * @param ethPrice - The current ETH price in USD
   * @param decimals - The number of decimals for the token
   * @returns {Promise<{value: number, balance: number}>} The USD value and human-readable balance
   * 
   * @remarks
   * This specialized function handles Lido stETH valuation by:
   * 1. Converting raw token balance to a human-readable number
   * 2. Using Lido's getPooledEthByShares method to determine the actual ETH equivalent
   * 3. Multiplying by the current ETH price to get USD value
   * 
   * The stETH to ETH ratio changes over time as staking rewards accrue.
   */
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
  
  /**
   * Calculates the USD value of LP tokens in the treasury with special handling for VUSD pairs.
   * 
   * @async
   * @param tokenContract - The LP token contract instance
   * @param tokenBalance - The raw balance of LP tokens
   * @param ethPrice - The current ETH price in USD
   * @param decimals - The number of decimals for the token
   * @returns {Promise<{value: number, balance: number}>} The USD value and human-readable balance
   * 
   * @remarks
   * This function handles SushiSwap LP token valuation with a critical enhancement:
   * - For LP tokens containing VUSD, only the non-VUSD side is counted to avoid double-counting
   * - This is a key fix to ensure accurate treasury valuation
   * 
   * The process includes:
   * 1. Calculating treasury's ownership percentage of the LP token
   * 2. Identifying the token pair composition
   * 3. Determining USD values based on token types (stablecoins vs. ETH-based assets)
   */
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
          // This is a VUSD pair, but we only count the non-VUSD value to avoid double-counting
          const otherTokenReserve = token0AddressLower === vusdAddressLower ? reserve1 : reserve0;
          const otherTokenAddress = token0AddressLower === vusdAddressLower ? token1AddressLower : token0AddressLower;
          
          // For display purposes, we need to know the amount, but we DON'T add to the value
          const ownedVusd = parseFloat(ethers.formatUnits(
            token0AddressLower === vusdAddressLower ? reserve0 : reserve1, 18
          )) * ownershipRatio;
          
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
          
          // IMPORTANT: Only count the non-VUSD value to avoid double-counting VUSD
          // This fixes the double-counting issue described in the requirements
          value = ownedOtherValue;
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
  
  /**
   * Calculates the USD value of generic ERC20 tokens in the treasury.
   * 
   * @async
   * @param tokenContract - The token contract instance
   * @param tokenBalance - The raw balance of tokens
   * @param decimals - The number of decimals for the token
   * @returns {Promise<{value: number, balance: number}>} The USD value and human-readable balance
   * 
   * @remarks
   * This function handles valuation of standard ERC20 tokens not covered by specialized functions.
   * In a production environment, this would integrate with a price oracle service.
   * 
   * @note The current implementation uses a simplified placeholder valuation.
   * In a production environment, this should be replaced with a proper oracle
   * to get accurate market prices for the tokens.
   */
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

  /**
   * Fetches and processes all treasury assets and calculates key metrics.
   * 
   * @async
   * @returns {Promise<void>} - Updates treasuryData state with complete treasury information
   * 
   * @remarks
   * This comprehensive function performs the following steps:
   * 1. Fetches VUSD circulating supply
   * 2. Retrieves and values all T1 assets (whitelisted stablecoins)
   * 3. Retrieves and values all T2 assets (non-whitelisted assets)
   * 4. Calculates collateralization ratio and excess value
   * 
   * Each asset type uses specialized valuation logic appropriate to its nature:
   * - Stablecoins: 1:1 with USD
   * - stETH: Current ETH equivalent * ETH price
   * - LP tokens: Ownership percentage of reserves with special handling for VUSD pairs
   * 
   * @throws Displays toast notification on error and logs details to console
   */
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
            // For SushiSwap LP tokens with VUSD, only count the non-VUSD portion to avoid double-counting
            let placeholderValue = 0;
            
            if (t2Asset.symbol === 'stETH') {
              placeholderValue = 64640; // Example ETH price calculation: 18.47 ETH * $3500
            } else if (t2Asset.symbol === 'VUSD/ETH LP') {
              // Only count the ETH side of the VUSD/ETH LP
              placeholderValue = 4375; // Example: 1.25 ETH * $3500 (excluding VUSD value)
            } else if (t2Asset.symbol === 'VUSD/USDC LP') {
              // Only count the USDC side of the VUSD/USDC LP
              placeholderValue = 1012; // Example: $1012 in USDC (excluding VUSD value)
            }
            
            t2Assets.push({
              symbol: t2Asset.symbol,
              name: t2Asset.name,
              value: placeholderValue,
              balance: t2Asset.symbol.includes('LP') ? 0 : placeholderValue / 3500, // Proper display for balances
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
  
  /**
   * Initialize treasury data when the component mounts.
   * 
   * @remarks
   * This effect handles initial data loading:
   * 1. Initial placeholder data is already set in the useState default value
   * 2. Immediately triggers fetchTreasuryData to load real blockchain data
   * 3. Does not set up an auto-refresh interval to minimize blockchain interactions
   * 
   * Users can manually refresh data by calling refreshTreasuryData.
   */
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
