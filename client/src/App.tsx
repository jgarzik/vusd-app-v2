/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Swap from "@/pages/Swap";
import Analytics from "@/pages/Analytics";
import UseVUSD from "@/pages/UseVUSD";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Swap} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/use-vusd" component={UseVUSD} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <MobileNav />
            <main className="flex-grow container mx-auto px-4 py-6">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
