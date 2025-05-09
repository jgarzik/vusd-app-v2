/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * web3Store.ts - Global Web3 state management
 * 
 * This module manages the global state for Web3 connections in the VUSD application.
 * It uses Zustand for state management to provide:
 * - Connection state (connected, connecting, disconnected)
 * - User wallet address and chain information
 * - Error handling for connection issues
 * - Methods to update the connection state
 * 
 * The store centralizes all Web3 state to avoid duplicating wallet connection logic
 * across components and ensures consistency throughout the application.
 */

import { create } from 'zustand';
import { ethers } from 'ethers';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  reset: () => void;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  provider: null,
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  
  setProvider: (provider) => set({ provider }),
  setAddress: (address) => set({ address }),
  setChainId: (chainId) => set({ chainId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  
  connect: async () => {
    try {
      set({ isConnecting: true, error: null });
      
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      const { chainId } = await provider.getNetwork();
      
      set({
        provider,
        address,
        chainId: chainId,
        isConnected: true,
        isConnecting: false
      });
    } catch (error) {
      console.error('Connection error:', error);
      set({
        error: (error as Error).message || 'Failed to connect',
        isConnecting: false
      });
    }
  },
  
  disconnect: () => {
    get().reset();
  },
  
  reset: () => {
    set({
      provider: null,
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  }
}));
