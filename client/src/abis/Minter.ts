export const MINTER_ABI = [
  // Basic ERC20 functions
  "function name() view returns (string)",
  "function version() view returns (string)",

  // Minter specific functions
  "function vusd() view returns (address)",
  "function mintingFee() view returns (uint256)",
  "function maxMintLimit() view returns (uint256)",
  "function priceTolerance() view returns (uint256)",
  "function cTokens(address) view returns (address)",
  "function oracles(address) view returns (address)",
  "function governor() view returns (address)",
  "function treasury() view returns (address)",
  "function isWhitelistedToken(address) view returns (bool)",
  "function whitelistedTokens() view returns (address[])",
  "function availableMintage() view returns (uint256)",

  // Minting functions
  "function mint(address token, uint256 amountIn) external",
  "function mint(address token, uint256 amountIn, address receiver) external",
  "function calculateMintage(address token, uint256 amountIn) external view returns (uint256)"
];
