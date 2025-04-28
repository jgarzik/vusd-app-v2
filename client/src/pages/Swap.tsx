/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import SwapInterface from "@/components/swap/SwapInterface";
import TreasuryCard from "@/components/analytics/TreasuryCard";
import ExternalLinksCard from "@/components/usevusd/ExternalLinksCard";

const Swap = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left column - Swap Interface */}
        <div className="w-full lg:w-8/12">
          <SwapInterface />
          
          {/* External Links Card - Only visible on larger screens */}
          <div className="mt-6 hidden md:block">
            <ExternalLinksCard previewMode={true} />
          </div>
        </div>
        
        {/* Right column - Treasury Analytics */}
        <div className="w-full lg:w-4/12 lg:mt-0">
          <div className="sticky top-24 max-w-xs mx-auto lg:mx-0">
            <TreasuryCard previewMode={true} />
          </div>
        </div>
        
        {/* External Links Card - Only visible on mobile */}
        <div className="mt-6 md:hidden w-full">
          <ExternalLinksCard previewMode={true} />
        </div>
      </div>
    </div>
  );
};

export default Swap;
