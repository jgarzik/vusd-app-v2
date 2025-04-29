/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Simple in-memory cache for CoinGecko responses to avoid hitting rate limits
type CacheEntry = {
  data: any;
  timestamp: number;
};

const apiCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the backend
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Expose environment variables needed by the frontend
  app.get('/api/config', (req, res) => {
    res.json({
      walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || ''
    });
  });
  
  // API endpoint to fetch VUSD price data from CoinGecko
  app.get('/api/market/vusd', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'vusd-price-data';
      const now = Date.now();
      
      // Check cache first
      if (apiCache[cacheKey] && now - apiCache[cacheKey].timestamp < CACHE_TTL) {
        return res.json(apiCache[cacheKey].data);
      }
      
      // Fetch fresh data from CoinGecko
      const coinId = 'vesper-vdollar';
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract and format the needed fields
      const priceData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image?.small,
        current_price: data.market_data?.current_price?.usd,
        market_cap: data.market_data?.market_cap?.usd,
        price_change_24h: data.market_data?.price_change_percentage_24h,
        volume_24h: data.market_data?.total_volume?.usd,
        last_updated: data.last_updated,
        contract_address: data.platforms?.ethereum
      };
      
      // Cache the response
      apiCache[cacheKey] = {
        data: priceData,
        timestamp: now
      };
      
      res.json(priceData);
    } catch (error) {
      console.error('Error fetching VUSD price data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch price data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Set up HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
