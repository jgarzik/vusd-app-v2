/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * OpportunitiesRow.tsx - VUSD opportunity cards container
 * 
 * This component displays a horizontal row of opportunity cards that
 * showcase different ways to use VUSD in the DeFi ecosystem:
 * - Trading platforms
 * - Yield farming opportunities
 * - Lending markets
 * - Liquidity pools
 * 
 * Features:
 * - Responsive grid layout that adjusts based on screen size
 * - Optional "View All" link to the UseVUSD page
 * - Configurable maximum number of cards to display
 * - Consistent styling across all opportunity cards
 */

import { Link } from "wouter";
import { externalLinks } from "@/constants/externalLinks";
import OpportunityCard from "./OpportunityCard";

interface OpportunitiesRowProps {
  maxCards?: number;
  showViewAll?: boolean;
}

const OpportunitiesRow = ({ 
  maxCards = externalLinks.length,
  showViewAll = false
}: OpportunitiesRowProps) => {
  // Display only the specified max number of cards
  const displayLinks = externalLinks.slice(0, maxCards);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-heading font-semibold">Use Your VUSD</h2>
        {showViewAll && (
          <Link href="/use-vusd">
            <a className="text-primary hover:text-primary-light text-sm font-medium">
              View All
            </a>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayLinks.map((link, index) => (
          <OpportunityCard key={index} link={link} />
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesRow;