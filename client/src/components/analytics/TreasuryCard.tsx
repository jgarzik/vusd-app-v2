import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useTreasury } from "@/hooks/useTreasury";
import { formatCurrency } from "@/lib/utils";

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
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="bg-card rounded-xl overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold">VUSD Analytics</CardTitle>
        {previewMode && (
          <Link href="/analytics">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View More</a>
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-6">
          {/* Treasury Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background-light p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Treasury Value</div>
              <div className="text-xl font-medium">
                {loading ? "Loading..." : formatCurrency(treasuryData.totalValue)}
              </div>
            </div>
            
            <div className="bg-background-light p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">VUSD Supply</div>
              <div className="text-xl font-medium">
                {loading ? "Loading..." : formatCurrency(treasuryData.circulatingSupply)}
              </div>
            </div>
          </div>
          
          {/* Collateralization Ratio */}
          <div className="bg-background-light p-3 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">Collateralization Ratio</div>
            <div className="flex items-end">
              <div className="text-xl font-medium">
                {loading ? "Loading..." : `${(treasuryData.collateralizationRatio * 100).toFixed(2)}%`}
              </div>
              <div className="text-sm text-gray-400 ml-2 mb-0.5">
                (target: 100%)
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
          </div>
          
          {/* Asset Distribution */}
          <div>
            <div className="text-gray-400 text-sm mb-2">Asset Distribution</div>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading treasury data...</div>
            ) : (
              <div className="flex flex-col space-y-3">
                {treasuryData.assets.map((asset) => (
                  <div key={asset.symbol} className="bg-background-light p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full overflow-hidden ${getTokenIconClass(asset.symbol)} mr-2`}></div>
                        <span className="text-sm font-medium">{asset.symbol}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(asset.value)}</div>
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
