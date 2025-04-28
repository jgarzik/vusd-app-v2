/**
 * Copyright 2025 Hemi Labs. All rights reserved.
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
