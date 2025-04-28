/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];
