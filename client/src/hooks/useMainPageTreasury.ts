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

import { useEffect, useRef } from 'react';
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
  // Get the base treasury functionality
  const treasury = useTreasury();
  
  // Store the timer reference for cleanup
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up auto-refresh every 2 minutes
  useEffect(() => {
    // Initial load happens via useTreasury
    
    // Set up periodic refresh timer
    refreshTimerRef.current = setInterval(() => {
      // Pass true to force refresh (bypass cache)
      treasury.refreshTreasuryData(true);
    }, 2 * 60 * 1000); // 2 minutes
    
    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [treasury.refreshTreasuryData]);
  
  /**
   * Force refreshes treasury data after a successful swap.
   * 
   * @returns {Promise<void>}
   * 
   * @remarks
   * This function should be called after a successful swap to ensure
   * treasury data reflects the latest state including the user's transaction.
   */
  const refreshAfterSwap = async () => {
    // Pass true to force refresh (bypass cache)
    await treasury.refreshTreasuryData(true);
  };
  
  // Return the same interface as useTreasury plus the refreshAfterSwap method
  return {
    ...treasury,
    refreshAfterSwap
  };
};