/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useVusdMarketData.ts - Hook for fetching VUSD market data
 * 
 * This hook provides market price information for VUSD from CoinGecko 
 * via a server-side API proxy. It includes:
 * - Current price in USD
 * - 24-hour price change percentage
 * - Market capitalization
 * - 24-hour trading volume
 * - Last updated timestamp
 * 
 * The data is fetched on component mount and can be refreshed manually.
 * Loading and error states are provided for easy handling in the UI.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// Type definition for the market data response
export interface VusdMarketData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  volume_24h: number;
  last_updated: string;
  contract_address: string;
}

/**
 * Custom hook to fetch and provide VUSD market data from CoinGecko
 * 
 * @returns {Object} The VUSD market data and status
 * @property {VusdMarketData | null} data - The market data when available
 * @property {boolean} loading - Whether data is currently being fetched
 * @property {string | null} error - Error message if fetch failed
 * @property {Function} refresh - Function to manually refresh the data
 * 
 * @example
 * const { data: vusdMarketData, loading, error, refresh } = useVusdMarketData();
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * return <PriceDisplay price={vusdMarketData.current_price} />;
 */
export function useVusdMarketData() {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<VusdMarketData>({
    queryKey: ['/api/market/vusd'],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity // Never consider data stale automatically
  });

  // Format the error message if present
  const errorMessage = error 
    ? (error instanceof Error ? error.message : 'Failed to fetch VUSD market data')
    : null;

  return {
    data: data || null,
    loading: isLoading,
    error: errorMessage,
    refresh: refetch
  };
}