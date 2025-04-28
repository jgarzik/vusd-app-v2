/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

// Contract addresses on Ethereum Mainnet
export const VUSD_ADDRESS = '0x677ddbd918637E5F2c79e164D402454dE7dA8619'; // VUSD token address
export const MINTER_ADDRESS = '0xFd22Bcf90d63748288913336Cd38BBC0e681e298'; // Minter contract address
export const REDEEMER_ADDRESS = '0xA860fe124fDABD43672EAD85183daE6f2df0421d'; // Redeemer contract address
export const TREASURY_ADDRESS = '0x239A4bF81759774bdC3D0a0244E56A667fdB81bf'; // Treasury contract address

// Network configurations
export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorer: 'https://etherscan.io'
  }
};
