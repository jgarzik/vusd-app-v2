/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * TreasuryRefreshContext.tsx - Context for sharing treasury refresh capability
 * 
 * This context provides a way for the SwapInterface to trigger a treasury data refresh
 * after a successful swap, without directly importing the useMainPageTreasury hook
 * (which would cause circular dependencies).
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useMainPageTreasury } from './useMainPageTreasury';

// Define the shape of the context
interface TreasuryRefreshContextType {
  // Method to refresh treasury data after successful swap
  refreshAfterSwap: () => Promise<void>;
  // The treasury data
  treasuryData: any;
  // Loading state
  loading: boolean;
}

// Create the context with default values
const TreasuryRefreshContext = createContext<TreasuryRefreshContextType>({
  refreshAfterSwap: async () => {}, // Empty function as placeholder
  treasuryData: {},
  loading: false
});

// Hook for components to access the context
export const useTreasuryRefresh = () => useContext(TreasuryRefreshContext);

// Provider component to wrap around the app
interface TreasuryRefreshProviderProps {
  children: ReactNode;
}

export const TreasuryRefreshProvider: React.FC<TreasuryRefreshProviderProps> = ({ children }) => {
  // Get treasury data and refresh method from useMainPageTreasury
  const { refreshAfterSwap, treasuryData, loading } = useMainPageTreasury();
  
  // Provide the context value to children
  return (
    <TreasuryRefreshContext.Provider value={{ refreshAfterSwap, treasuryData, loading }}>
      {children}
    </TreasuryRefreshContext.Provider>
  );
};