/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * Test Infura RPC Integration
 * 
 * This script verifies that the Infura RPC provider is properly configured
 * by fetching the latest block number and basic VUSD contract data.
 */

import { ethers } from 'ethers';
import 'dotenv/config';

// VUSD contract information
const VUSD_ADDRESS = '0x677ddbd918637E5F2c79e164D402454dE7dA8619';

// Load VUSD ABI
const VUSD_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

async function testInfuraConnection() {
  try {
    // Read INFURA_ID from environment
    const INFURA_ID = process.env.INFURA_ID;
    
    if (!INFURA_ID) {
      console.error('Error: INFURA_ID environment variable not found');
      process.exit(1);
    }
    
    console.log(`Testing Infura connection with ID: ${INFURA_ID.substring(0, 6)}...`);
    
    // Connect to Infura
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
    
    // Get network information
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`Latest block number: ${blockNumber}`);
    
    // Get gas price
    const gasPrice = await provider.getFeeData();
    console.log(`Current gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei')} gwei`);
    
    // Connect to VUSD contract
    const vusdContract = new ethers.Contract(VUSD_ADDRESS, VUSD_ABI, provider);
    
    // Get basic VUSD info
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      vusdContract.name(),
      vusdContract.symbol(),
      vusdContract.decimals(),
      vusdContract.totalSupply()
    ]);
    
    console.log('\nVUSD Contract Info:');
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
    
    console.log('\n✅ Infura connection test successful!');
  } catch (error) {
    console.error('\n❌ Infura connection test failed!');
    console.error(error);
    process.exit(1);
  }
}

testInfuraConnection();