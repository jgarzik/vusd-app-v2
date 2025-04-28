/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { externalLinks } from "@/constants/externalLinks";

interface ExternalLinksCardProps {
  previewMode?: boolean;
}

const ExternalLinksCard = ({ previewMode = false }: ExternalLinksCardProps) => {
  return (
    <Card className="bg-card rounded-xl overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold">Use Your VUSD</CardTitle>
        {previewMode && (
          <Link href="/use-vusd">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View All</a>
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col divide-y divide-gray-800">
          {externalLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-3 flex items-center hover:bg-background-light hover:bg-opacity-50 transition-colors px-2 rounded-lg -mx-2"
            >
              <div className={`w-10 h-10 rounded-full overflow-hidden ${link.iconBgClass} flex items-center justify-center mr-3`}>
                <span className="font-bold text-white">{link.iconText}</span>
              </div>
              <div className="flex-grow">
                <div className="font-medium">{link.title}</div>
                <div className="text-sm text-gray-400">{link.description}</div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalLinksCard;
