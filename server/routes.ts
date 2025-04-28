import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the backend
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Set up HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
