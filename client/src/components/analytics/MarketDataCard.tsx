/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * MarketDataCard.tsx - VUSD Market Data Card Component
 * 
 * This component displays current market data for VUSD from CoinGecko, including:
 * - Current price
 * - 24-hour price change (with colored indicator)
 * - Market capitalization
 * - 24-hour trading volume
 * - Last updated timestamp
 * 
 * The card also includes a link back to CoinGecko for more detailed information.
 */

import { useVusdMarketData } from '@/hooks/useVusdMarketData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Formats large numbers with commas and appropriate decimal places
 * 
 * @param {number} value - The number to format
 * @param {number} [decimals=2] - Number of decimal places to show
 * @returns {string} Formatted number string
 */
const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export function MarketDataCard() {
  const { data, loading, error } = useVusdMarketData();

  // Format the price change with + or - sign and color coding
  const formattedPriceChange = data?.price_change_24h 
    ? `${data.price_change_24h > 0 ? '+' : ''}${formatNumber(data.price_change_24h, 3)}%` 
    : '0.00%';
    
  const priceChangeColorClass = !data?.price_change_24h 
    ? 'text-gray-500' 
    : data.price_change_24h > 0 
      ? 'text-green-500' 
      : data.price_change_24h < 0 
        ? 'text-red-500' 
        : 'text-gray-500';

  // Format the last updated time
  const formattedLastUpdated = data?.last_updated 
    ? format(new Date(data.last_updated), 'MMM dd, yyyy HH:mm:ss') 
    : '';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">VUSD Price</CardTitle>
            <CardDescription>Market data from CoinGecko</CardDescription>
          </div>
          {data?.image && (
            <img 
              src={data.image} 
              alt="VUSD" 
              className="h-8 w-8 rounded-full" 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 py-4">
            Error loading price data: {error}
          </div>
        ) : data ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${formatNumber(data.current_price, 3)}</span>
              <span className={`text-sm font-medium ${priceChangeColorClass}`}>
                {formattedPriceChange} (24h)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-medium">${formatNumber(data.market_cap, 0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Volume (24h)</div>
                <div className="font-medium">${formatNumber(data.volume_24h, 0)}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Contract Address</div>
              <div className="font-medium text-sm truncate">{data.contract_address}</div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-4">
            No price data available
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between items-center">
        <div>
          {data && `Last updated: ${formattedLastUpdated}`}
        </div>
        <a 
          href="https://www.coingecko.com/en/coins/vesper-vdollar" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          View on CoinGecko <ExternalLink size={12} />
        </a>
      </CardFooter>
    </Card>
  );
}