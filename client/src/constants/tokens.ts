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
