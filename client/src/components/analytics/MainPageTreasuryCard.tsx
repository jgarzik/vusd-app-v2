/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * MainPageTreasuryCard.tsx - Auto-refreshing treasury card for the main page
 * 
 * This component is a variant of TreasuryCard specifically designed for 
 * the main page, with auto-refreshing treasury data functionality.
 * It implements the requirement that treasury data on the main page should:
 * 1. Periodically refresh (handled by useMainPageTreasury)
 * 2. Refresh after successful swaps (through a direct refresh method)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useMainPageTreasury } from "@/hooks/useMainPageTreasury";
import { formatCurrency } from "@/lib/utils";
import { Shield, Coins, ArrowUpCircle, RefreshCw } from "lucide-react";

/**
 * Main page variant of TreasuryCard that auto-refreshes data.
 * It provides the same UI as TreasuryCard but with enhanced refresh functionality.
 * 
 * @returns {JSX.Element} The MainPageTreasuryCard component
 */
const MainPageTreasuryCard = () => {
  const { treasuryData, loading, refreshTreasuryData } = useMainPageTreasury();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Function to handle manual refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force refresh by passing true to bypass the cache
      await refreshTreasuryData(true);
    } finally {
      // Add slight delay for better UX before stopping the animation
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };
  
  /**
   * Returns the appropriate CSS class for token icons based on token symbol.
   * 
   * @param {string} symbol - The token symbol (e.g., "USDC", "VUSD")
   * @returns {string} CSS class string for styling the token icon
   */
  const getTokenIconClass = (symbol: string) => {
    switch(symbol) {
      case 'USDC': return 'token-icon-usdc';
      case 'USDT': return 'token-icon-usdt';
      case 'DAI': return 'token-icon-dai';
      case 'VUSD': return 'token-icon-vusd';
      case 'stETH': return 'bg-blue-500';
      case 'VUSD/ETH LP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="bg-card rounded-xl overflow-hidden h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold">VUSD Treasury</CardTitle>
        <div className="flex items-center space-x-3">
          <Link href="/analytics">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View More</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-4">
          {/* Treasury Stats - Simplified for main page */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background-light p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <ArrowUpCircle className="w-4 h-4 text-green-500 mr-2" />
                <div className="text-gray-400 text-sm">Excess Value</div>
              </div>
              <div className="text-xl font-medium">
                {loading ? "Loading..." : formatCurrency(treasuryData.excessValue)}
              </div>
            </div>
            
            <div className="bg-background-light p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <Shield className="w-4 h-4 text-primary mr-2" />
                <div className="text-gray-400 text-sm">Collateral Ratio</div>
              </div>
              <div className="text-xl font-medium">
                {loading ? "Loading..." : `${(treasuryData.collateralizationRatio * 100).toFixed(2)}%`}
              </div>
            </div>
          </div>
          
          {/* T1 Assets - Simplified version */}
          <div>
            <div className="flex items-center mb-2">
              <Coins className="w-4 h-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm font-medium">T1: Stablecoins</div>
              <div className="ml-auto text-sm">{loading ? "..." : formatCurrency(treasuryData.t1Value)}</div>
            </div>
            {loading ? (
              <div className="text-center py-2 text-gray-400">Loading...</div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {treasuryData.t1Assets.slice(0, 2).map((asset) => (
                  <div key={asset.symbol} className="bg-background-light p-2.5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full overflow-hidden ${getTokenIconClass(asset.symbol)} mr-2`}></div>
                        <span className="text-xs font-medium">{asset.symbol}</span>
                      </div>
                      <div className="text-xs font-medium">{formatCurrency(asset.value)}</div>
                    </div>
                  </div>
                ))}
                {treasuryData.t1Assets.length > 2 && (
                  <div className="text-center text-xs text-gray-400">
                    +{treasuryData.t1Assets.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainPageTreasuryCard;