/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * tokens.ts - Token definitions for the VUSD application
 * 
 * This module defines all supported tokens for the VUSD application, specifically:
 * - VUSD: The core stablecoin of the platform
 * - Whitelisted stablecoins: USDC, USDT, and DAI that can be swapped with VUSD
 * 
 * Each token includes critical metadata like:
 * - Symbol: Short identifier (e.g., "VUSD", "USDC")
 * - Name: Full name (e.g., "VUSD Stablecoin")
 * - Address: Ethereum contract address 
 * - Decimals: Token precision (typically 18 for ERC-20, 6 for USDC)
 * 
 * The module also provides helper functions to look up tokens by address or symbol.
 */

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
}

// Mainnet addresses
export const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'VUSD',
    name: 'VUSD Stablecoin',
    address: '0x677ddbd918637E5F2c79e164D402454dE7dA8619',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18
  }
];

export const TOKEN_ADDRESSES = SUPPORTED_TOKENS.reduce(
  (acc, token) => ({ ...acc, [token.symbol]: token.address }),
  {} as Record<string, string>
);
