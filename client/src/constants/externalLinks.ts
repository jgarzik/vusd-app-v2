/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * externalLinks.ts - External DeFi platform links
 * 
 * This module defines all external platforms where VUSD can be utilized.
 * It provides structured data for each opportunity including:
 * - Title: Name of the platform or opportunity
 * - Description: Short explanation of what users can do
 * - URL: Direct link to the relevant page on the external platform
 * - Icon styling: Visual representation for the opportunity cards
 * 
 * These links are used in the OpportunityCard and OpportunitiesRow components
 * to show users where they can use their VUSD tokens in the DeFi ecosystem.
 */

export interface ExternalLink {
  title: string;
  description: string;
  url: string;
  iconText: string;
  iconBgClass: string;
}

export const externalLinks: ExternalLink[] = [
  {
    title: 'VUSD-ETH Liquidity Pool',
    description: 'Provide liquidity on SushiSwap',
    url: 'https://www.sushi.com/ethereum/pool/v2/0xb90047676cc13e68632c55cb5b7cbd8a4c5a0a8e/add',
    iconText: 'S',
    iconBgClass: 'bg-pink-600'
  },
  {
    title: 'crvUSD/VUSD Liquidity Pool',
    description: 'Provide liquidity on Curve Finance',
    url: 'https://curve.fi/dex/ethereum/pools/factory-stable-ng-212/deposit/',
    iconText: 'C',
    iconBgClass: 'bg-green-600'
  },
  {
    title: 'VUSD/USDC Lending Pool',
    description: 'Borrow or earn on Ajna',
    url: 'https://ajnafi.com/ethereum/pools/0xfb4e0f492d9cf14599bf5f3bebffafbc6dd14013/',
    iconText: 'A',
    iconBgClass: 'bg-purple-600'
  }
];
