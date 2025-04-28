import SwapInterface from "@/components/swap/SwapInterface";
import TreasuryCard from "@/components/analytics/TreasuryCard";
import ExternalLinksCard from "@/components/usevusd/ExternalLinksCard";

const Swap = () => {
  return (
    <div>
      {/* Swap Interface */}
      <div className="max-w-lg mx-auto">
        <SwapInterface />
      </div>
      
      {/* Additional Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
        <TreasuryCard previewMode={true} />
        <ExternalLinksCard previewMode={true} />
      </div>
    </div>
  );
};

export default Swap;
