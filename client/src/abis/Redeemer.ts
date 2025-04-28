/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

export const REDEEMER_ABI = [
  // Basic information
  "function NAME() view returns (string)",
  "function VERSION() view returns (string)",
  
  // Core variables
  "function vusd() view returns (address)",
  "function redeemFee() view returns (uint256)",
  "function priceTolerance() view returns (uint256)",
  
  // Getters
  "function governor() view returns (address)",
  "function treasury() view returns (address)",
  
  // Core functionality
  "function redeem(address token, uint256 vusdAmount) external",
  "function redeem(address token, uint256 vusdAmount, address tokenReceiver) external",
  "function redeemable(address token, uint256 vusdAmount) external view returns (uint256)",
  "function redeemable(address token) public view returns (uint256)"
];
