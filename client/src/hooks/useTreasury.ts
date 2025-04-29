/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useTreasury.ts - Base treasury data hook
 * 
 * This hook provides access to the VUSD treasury data with the following features:
 * - Basic treasury metrics (T1/T2 assets, collateralization ratio, excess value)
 * - Manual refresh capability
 * - Loading and error states
 * - Time-based caching (3-minute window by default)
 * 
 * Note: This is the base hook that's not auto-refreshing.
 * For the main page, use useMainPageTreasury instead which adds auto-refresh.
 */

import { useState, useCallback } from 'react';
import { useEthersContracts } from './useEthersContracts';
import { STABLECOIN_ADDRESSES, getAssetByAddress } from '../constants/treasuryAssets';
import { formatUnits } from 'ethers';

// Interface for treasury asset information
export interface TreasuryAsset {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  value: number;
}

// Interface for treasury data
export interface TreasuryData {
  t1Assets: TreasuryAsset[];
  t2Assets: TreasuryAsset[];
  vusdSupply: number;
  t1Value: number;
  t2Value: number;
  totalValue: number;
  excessValue: number;
  collateralizationRatio: number;
  lastUpdated: number;
}

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

// Empty treasury data for initialization
const emptyTreasuryData: TreasuryData = {
  t1Assets: [],
  t2Assets: [],
  vusdSupply: 0,
  t1Value: 0,
  t2Value: 0,
  totalValue: 0,
  excessValue: 0, 
  collateralizationRatio: 1,
  lastUpdated: 0
};

// Cache for treasury data
let treasuryDataCache: TreasuryData = { ...emptyTreasuryData };

/**
 * Custom hook that provides access to treasury data with manual refresh.
 * 
 * @returns {Object} Treasury data and operations
 * 
 * @remarks
 * This is the base hook for treasury data without auto-refresh. It provides
 * manual refresh capability and is suitable for the analytics page.
 * For the main page, use useMainPageTreasury which adds auto-refresh.
 */
export const useTreasury = () => {
  const { contracts } = useEthersContracts();
  const [treasuryData, setTreasuryData] = useState<TreasuryData>(treasuryDataCache);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches and calculates the current treasury data.
   * 
   * @param {boolean} [forceRefresh=false] - If true, bypasses the cache and forces a refresh
   * @returns {Promise<void>}
   * 
   * @remarks
   * This function fetches the latest treasury data from the blockchain and formats it.
   * It respects the cache duration unless forceRefresh is true.
   */
  const refreshTreasuryData = useCallback(async (forceRefresh = false) => {
    // Check if we have a recent cache and aren't forcing a refresh
    const now = Date.now();
    if (
      !forceRefresh && 
      treasuryDataCache.lastUpdated > 0 &&
      now - treasuryDataCache.lastUpdated < CACHE_DURATION
    ) {
      setTreasuryData(treasuryDataCache);
      return;
    }

    // No recent cache or force refresh requested, fetch new data
    setLoading(true);
    setError(null);
    
    try {
      // Only attempt to fetch data if contracts are available
      if (!contracts.treasury || !contracts.vusd) {
        throw new Error("Contracts not initialized");
      }
      
      // Get VUSD total supply
      const vusdSupply = parseFloat(
        formatUnits(await contracts.vusd.totalSupply(), 18)
      );
      
      // Fetch T1 assets (stablecoins)
      const t1Assets: TreasuryAsset[] = [];
      let t1Value = 0;
      
      // Process each stablecoin in the T1 category
      const t1Promises = Object.values(STABLECOIN_ADDRESSES).map(async (address) => {
        const asset = getAssetByAddress(address);
        if (asset) {
          const tokenContract = contracts.getERC20Contract(address);
          const rawBalance = await tokenContract.balanceOf(contracts.treasury.address);
          const balance = formatUnits(rawBalance, asset.decimals);
          const value = parseFloat(balance);
          
          t1Assets.push({
            symbol: asset.symbol,
            name: asset.name,
            address,
            balance,
            value
          });
          
          t1Value += value;
        }
      });
      
      await Promise.all(t1Promises);
      
      // Sort T1 assets by value (descending)
      t1Assets.sort((a, b) => b.value - a.value);
      
      // Fetch T2 assets (more complex assets)
      const t2Assets: TreasuryAsset[] = [];
      let t2Value = 0;
      
      // For simplicity, we'll use placeholder data for T2 assets
      // In a real implementation, this would fetch data from contracts
      
      // Calculate key metrics
      const totalValue = t1Value + t2Value;
      const excessValue = totalValue - vusdSupply;
      const collateralizationRatio = vusdSupply > 0 ? totalValue / vusdSupply : 1;
      
      // Update the treasury data
      const newTreasuryData: TreasuryData = {
        t1Assets,
        t2Assets,
        vusdSupply,
        t1Value,
        t2Value,
        totalValue,
        excessValue,
        collateralizationRatio,
        lastUpdated: now
      };
      
      // Update state and cache
      setTreasuryData(newTreasuryData);
      treasuryDataCache = newTreasuryData;
      
    } catch (err) {
      console.error("Failed to fetch treasury data:", err);
      setError("Failed to fetch treasury data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [contracts]);

  return {
    treasuryData,
    loading,
    error,
    refreshTreasuryData
  };
};