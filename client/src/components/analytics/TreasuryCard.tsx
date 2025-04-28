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
        <div className="flex flex-col space-y-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">Treasury Value</div>
            <div className="text-xl font-medium">
              {loading ? "Loading..." : formatCurrency(treasuryData.totalValue)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Asset Distribution</div>
            <div className="grid grid-cols-3 gap-2">
              {loading ? (
                <div className="col-span-3 text-center py-4 text-gray-400">Loading treasury data...</div>
              ) : (
                treasuryData.assets.map((asset) => (
                  <div key={asset.symbol} className="bg-background-light p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <div className={`w-4 h-4 rounded-full overflow-hidden ${getTokenIconClass(asset.symbol)} mr-2`}></div>
                      <span className="text-sm font-medium">{asset.symbol}</span>
                    </div>
                    <div className="text-sm">{formatCurrency(asset.value)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryCard;
