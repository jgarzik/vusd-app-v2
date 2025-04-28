/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * Swap.tsx - Main token swap page
 * 
 * This page serves as the primary entry point for users to swap between VUSD and supported stablecoins.
 * It provides a structured layout with:
 * - The main swap interface for token conversion
 * - A treasury summary card showing key metrics
 * - Opportunity cards showcasing places to use VUSD
 * 
 * The layout is responsive, shifting from a two-column layout on desktop to a single column on mobile.
 * Optimized spacing has been implemented between the swap interface and opportunity cards.
 */

import SwapInterface from "@/components/swap/SwapInterface";
import TreasuryCard from "@/components/analytics/TreasuryCard";
import OpportunitiesRow from "@/components/usevusd/OpportunitiesRow";

const Swap = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left column - Swap Interface */}
        <div className="w-full lg:w-8/12">
          <SwapInterface />
          
          {/* Bottom section with opportunity cards - reduced vertical gap */}
          <div className="mt-3">
            <OpportunitiesRow showViewAll={true} />
          </div>
        </div>
        
        {/* Right column - Treasury Analytics */}
        <div className="w-full lg:w-4/12 lg:mt-0">
          <div className="sticky top-24 max-w-xs mx-auto lg:mx-0">
            <TreasuryCard previewMode={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
