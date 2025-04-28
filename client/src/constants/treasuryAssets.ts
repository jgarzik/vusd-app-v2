// Types of assets in the treasury
export enum AssetType {
  STAKED_ETH,
  LP_TOKEN,
  GENERIC_ERC20
}

// Interface for T2 assets in the treasury
export interface T2Asset {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  assetType: AssetType;
  extraAbi: string[];
}

// T2 assets that we know are in the treasury but not in the whitelisted tokens list
export const T2_ASSETS: T2Asset[] = [
  {
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    symbol: 'stETH',
    name: 'Lido Staked ETH',
    decimals: 18,
    assetType: AssetType.STAKED_ETH,
    // ABI for stETH specific functions
    extraAbi: [
      // Lido's exchange rate function
      'function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256)'
    ]
  },
  {
    address: '0xb90047676cC13e68632c55cB5b7cBd8A4C5A0A8E',
    symbol: 'VUSD/ETH LP',
    name: 'SushiSwap VUSD/ETH LP',
    decimals: 18,
    assetType: AssetType.LP_TOKEN,
    // ABI for SushiSwap LP specific functions
    extraAbi: [
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
      'function token0() external view returns (address)',
      'function token1() external view returns (address)',
      'function totalSupply() external view returns (uint256)'
    ]
  },
  {
    address: '0xBf97b59b0DFA5F6A27BfD861e661d6E22E6544de',
    symbol: 'VUSD/USDC LP',
    name: 'SushiSwap VUSD/USDC LP',
    decimals: 18,
    assetType: AssetType.LP_TOKEN,
    // ABI for SushiSwap LP specific functions (same as other LP tokens)
    extraAbi: [
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
      'function token0() external view returns (address)',
      'function token1() external view returns (address)',
      'function totalSupply() external view returns (uint256)'
    ]
  }
];

// Helper functions to easily look up assets
export const getAssetByAddress = (address: string): T2Asset | undefined => {
  return T2_ASSETS.find(asset => 
    asset.address.toLowerCase() === address.toLowerCase()
  );
};

export const getAssetBySymbol = (symbol: string): T2Asset | undefined => {
  return T2_ASSETS.find(asset => asset.symbol === symbol);
};

// Common token addresses
export const STABLECOIN_ADDRESSES = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
};