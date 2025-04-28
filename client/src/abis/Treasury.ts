/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

export const TREASURY_ABI = [
  // Basic information
  "function NAME() view returns (string)",
  "function VERSION() view returns (string)",
  
  // Core variables
  "function vusd() view returns (address)",
  "function redeemer() view returns (address)",
  "function swapManager() view returns (address)",
  "function cTokens(address) view returns (address)",
  "function oracles(address) view returns (address)",
  
  // Getters
  "function governor() view returns (address)",
  "function isWhitelistedToken(address) view returns (bool)",
  "function whitelistedTokens() view returns (address[])",
  "function cTokenList() view returns (address[])",
  "function keepers() view returns (address[])",
  
  // Treasury operations
  "function withdrawable(address token) external view returns (uint256)",
  "function withdraw(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount, address tokenReceiver) external"
];
