/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useMainPageTreasury.ts - Treasury data hook with auto-refresh for main page
 * 
 * This hook extends the base useTreasury hook with additional functionality
 * specifically designed for the main page:
 * - Periodic auto-refresh with a 2-minute interval
 * - Public method to force refresh after successful swaps
 * 
 * This implementation follows the requirement that treasury data on the main page
 * should periodically refresh and also refresh after each successful swap.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTreasury } from './useTreasury';

/**
 * Custom hook that wraps useTreasury with auto-refresh functionality for the main page.
 * 
 * @returns {Object} The same interface as useTreasury plus refreshAfterSwap method
 * 
 * @remarks
 * This hook is specifically for use on the main page where treasury data should
 * auto-refresh periodically (every 2 minutes) and after successful swaps.
 * It's not meant to be used on the analytics page where manual refresh is required.
 */
export const useMainPageTreasury = () => {
  const { 
    treasuryData,
    loading,
    error,
    refreshTreasuryData
  } = useTreasury();

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(true);
  
  // Setup periodic refresh on mount (every 2 minutes)
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      // Initial load on mount
      refreshTreasuryData();
      
      // Set up timer for periodic refresh
      refreshTimerRef.current = setInterval(() => {
        refreshTreasuryData();
      }, 2 * 60 * 1000); // 2 minutes
    }
    
    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isAutoRefreshEnabled, refreshTreasuryData]);
  
  /**
   * Force refreshes treasury data after a successful swap.
   * 
   * @returns {Promise<void>}
   * 
   * @remarks
   * This function should be called after a successful swap to ensure
   * treasury data reflects the latest state including the user's transaction.
   */
  const refreshAfterSwap = useCallback(async () => {
    // Force refresh by passing true to bypass cache
    await refreshTreasuryData(true);
  }, [refreshTreasuryData]);
  
  // Disable auto-refresh functionality when there's an error
  useEffect(() => {
    if (error) {
      setIsAutoRefreshEnabled(false);
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
  }, [error]);
  
  return {
    treasuryData,
    loading,
    error,
    refreshTreasuryData,
    refreshAfterSwap,
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled
  };
};