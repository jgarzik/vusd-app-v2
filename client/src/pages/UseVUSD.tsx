/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * UseVUSD.tsx - VUSD usage opportunities page
 * 
 * This page showcases various ways users can utilize their VUSD tokens in the DeFi ecosystem.
 * Key features:
 * - Opportunity cards showcasing external protocols and platforms
 * - Educational information about stablecoin yield strategies
 * - Benefits of VUSD compared to other stablecoins
 * - Risk considerations for different DeFi strategies
 * 
 * The layout places opportunity cards at the top for immediate visibility
 * with educational content placed below in card format.
 */

import OpportunitiesRow from "@/components/usevusd/OpportunitiesRow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const UseVUSD = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Use Your VUSD</h1>
      
      {/* VUSD Opportunities - Now at the top */}
      <div className="mb-8">
        <OpportunitiesRow />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>What is VUSD?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              VUSD is a fully-collateralized stablecoin pegged to the US Dollar, backed by interest-generating collateral.
              It maintains its peg through a set of smart contracts that manage the treasury, minting, and redemption processes.
            </p>
            <p className="mb-4">
              Unlike some other stablecoins, VUSD is backed by a diversified portfolio of other stablecoins
              (USDC, DAI, USDT) held in its treasury. These reserves generate yield through protocols like Compound,
              creating sustainable value for VUSD holders.
            </p>
            <p>
              <a 
                href="https://docs.vdollar.finance/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-light font-medium"
              >
                Read the documentation →
              </a>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with VUSD</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>
                <span className="font-medium">Connect your wallet</span> - Use MetaMask or WalletConnect to interact with the VUSD application
              </li>
              <li>
                <span className="font-medium">Swap to VUSD</span> - Exchange your USDC, DAI, or USDT for VUSD using the swap interface
              </li>
              <li>
                <span className="font-medium">Use VUSD</span> - Provide liquidity, earn yield, or use VUSD in various DeFi applications
              </li>
              <li>
                <span className="font-medium">Swap from VUSD</span> - When needed, swap back from VUSD to USDC, DAI, or USDT
              </li>
            </ol>
            <p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/";
                }}
                className="text-primary hover:text-primary-light font-medium"
              >
                Go to swap interface →
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Benefits of VUSD</CardTitle>
          <CardDescription>Why choose VUSD for your stablecoin needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-light p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Fully Collateralized</h3>
              <p className="text-gray-400">
                VUSD is backed 1:1 by a diversified portfolio of stablecoins, making it extremely stable and resistant to market volatility.
              </p>
            </div>
            
            <div className="bg-background-light p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Yield-Generating</h3>
              <p className="text-gray-400">
                The VUSD treasury generates yield through Compound, creating sustainable value for all token holders.
              </p>
            </div>
            
            <div className="bg-background-light p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Transparent</h3>
              <p className="text-gray-400">
                All operations and treasury holdings are transparent and verifiable on-chain. You can view the analytics at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UseVUSD;
