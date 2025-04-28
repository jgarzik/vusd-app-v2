/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExternalLink as ExternalLinkType } from "@/constants/externalLinks";

interface OpportunityCardProps {
  link: ExternalLinkType;
}

const OpportunityCard = ({ link }: OpportunityCardProps) => {
  // Get appropriate action text based on the link description
  let actionText = "Add Liquidity";
  
  if (link.description.toLowerCase().includes("borrow") || link.description.toLowerCase().includes("earn")) {
    actionText = "Access Pool";
  } else if (link.description.toLowerCase().includes("provide liquidity")) {
    actionText = "Add Liquidity";
  }
  
  return (
    <Card className="bg-card rounded-lg overflow-hidden h-full border-gray-800 transition-all hover:border-gray-700 hover:shadow-md">
      <a 
        href={link.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex flex-col h-full"
      >
        <div className="p-5 flex-grow flex flex-col">
          <div className={`w-12 h-12 rounded-full ${link.iconBgClass} flex items-center justify-center mb-4 self-start`}>
            <span className="font-bold text-white text-lg">{link.iconText}</span>
          </div>
          
          <h3 className="font-medium text-lg mb-2">{link.title}</h3>
          <p className="text-sm text-gray-400 mb-4 flex-grow">{link.description}</p>
          
          <div className="flex items-center text-primary text-sm font-medium">
            <span>{actionText}</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </div>
        </div>
      </a>
    </Card>
  );
};

export default OpportunityCard;