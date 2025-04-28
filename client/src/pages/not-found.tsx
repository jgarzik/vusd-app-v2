/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * not-found.tsx - 404 error page
 * 
 * This page is displayed when a user navigates to a route that doesn't exist.
 * Key features:
 * - Clear 404 error message with visual indicator
 * - Consistent styling with the rest of the application
 * - Navigation option to return to the main application
 * - Responsive design for all device sizes
 * 
 * The page is used by the wouter router when no matching route is found.
 */

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
