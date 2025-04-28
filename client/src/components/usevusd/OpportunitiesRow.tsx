/**
 * Copyright 2025 Hemi Labs. All rights reserved.
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold">Use Your VUSD</h2>
        {showViewAll && (
          <Link href="/use-vusd">
            <a className="text-primary hover:text-primary-light text-sm font-medium">
              View All
            </a>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayLinks.map((link, index) => (
          <OpportunityCard key={index} link={link} />
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesRow;