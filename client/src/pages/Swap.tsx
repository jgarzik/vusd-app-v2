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
        {/* Left column - Swap Interface - reduced width on large screens */}
        <div className="w-full lg:w-5/12 xl:w-4/12">
          <div className="max-w-md mx-auto lg:mx-0">
            <SwapInterface />
          </div>
        </div>
        
        {/* Right column - Treasury Analytics */}
        <div className="w-full lg:w-7/12 xl:w-8/12">
          <div className="flex flex-col space-y-5">
            {/* Treasury card */}
            <div className="max-w-md lg:max-w-none mx-auto">
              <TreasuryCard previewMode={true} />
            </div>
            
            {/* Opportunity cards */}
            <div className="mt-3">
              <OpportunitiesRow showViewAll={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
