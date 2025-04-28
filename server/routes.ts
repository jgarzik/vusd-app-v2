/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the backend
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Expose environment variables needed by the frontend
  app.get('/api/config', (req, res) => {
    res.json({
      walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || '',
      infuraId: process.env.INFURA_ID || ''
    });
  });

  // Set up HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
