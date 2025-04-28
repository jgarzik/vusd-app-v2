/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useTreasury } from "@/hooks/useTreasury";
import { formatCurrency } from "@/lib/utils";
import { Shield, Coins, ArrowUpCircle } from "lucide-react";

interface TreasuryCardProps {
  previewMode?: boolean;
}

const TreasuryCard = ({ previewMode = false }: TreasuryCardProps) => {
  const { treasuryData, loading } = useTreasury();
  
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
        {previewMode && (
          <Link href="/analytics">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View More</a>
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-6">
          {/* Treasury Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-background-light p-4 rounded-lg">
              <div className="flex items-center mb-1">
                <ArrowUpCircle className="w-4 h-4 text-green-500 mr-2" />
                <div className="text-gray-400 text-sm">Excess Value</div>
              </div>
              <div className="text-xl font-medium">
                {loading ? "Loading..." : formatCurrency(treasuryData.excessValue)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Treasury value in excess of VUSD supply
              </div>
            </div>
          </div>
          
          {/* Collateralization Ratio */}
          <div className="bg-background-light p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <Shield className="w-4 h-4 text-primary mr-2" />
              <div className="text-gray-400 text-sm">Collateralization Ratio</div>
            </div>
            <div className="flex items-end">
              <div className="text-xl font-medium">
                {loading ? "Loading..." : `${(treasuryData.collateralizationRatio * 100).toFixed(2)}%`}
              </div>
            </div>
            
            {!loading && (
              <div className="w-full bg-background h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    treasuryData.collateralizationRatio >= 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(treasuryData.collateralizationRatio * 100, 100)}%` }}
                ></div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <div className="text-xs text-gray-400">Treasury Value</div>
                <div className="text-sm font-medium">
                  {loading ? "Loading..." : formatCurrency(treasuryData.totalValue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">VUSD Supply</div>
                <div className="text-sm font-medium">
                  {loading ? "Loading..." : formatCurrency(treasuryData.circulatingSupply)}
                </div>
              </div>
            </div>
          </div>
          
          {/* T1 Assets - Whitelisted Stablecoins */}
          <div>
            <div className="flex items-center mb-2">
              <Coins className="w-4 h-4 text-blue-400 mr-2" />
              <div className="text-gray-300 text-sm font-medium">T1: Stablecoins</div>
              <div className="ml-auto text-sm">{loading ? "..." : formatCurrency(treasuryData.t1Value)}</div>
            </div>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading...</div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {treasuryData.t1Assets.map((asset) => (
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
              </div>
            )}
          </div>
          
          {/* T2 Assets - Other Assets */}
          <div>
            <div className="flex items-center mb-2">
              <Coins className="w-4 h-4 text-purple-400 mr-2" />
              <div className="text-gray-300 text-sm font-medium">T2: Other Assets</div>
              <div className="ml-auto text-sm">{loading ? "..." : formatCurrency(treasuryData.t2Value)}</div>
            </div>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading...</div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {treasuryData.t2Assets.map((asset) => (
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
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryCard;
