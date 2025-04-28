import { useState } from "react";
import { Link, useLocation } from "wouter";
import ConnectWallet from "@/components/web3/ConnectWallet";

const Header = () => {
  const [location] = useLocation();
  
  return (
    <header className="border-b border-gray-800 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <span className="font-heading font-bold text-white">V</span>
              </div>
              <span className="ml-2 font-heading font-bold text-xl">VUSD</span>
            </a>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <a className={`font-medium py-1 ${location === "/" ? "text-white border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}>
                Swap
              </a>
            </Link>
            <Link href="/analytics">
              <a className={`font-medium py-1 ${location === "/analytics" ? "text-white border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}>
                Analytics
              </a>
            </Link>
            <Link href="/use-vusd">
              <a className={`font-medium py-1 ${location === "/use-vusd" ? "text-white border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}>
                Use VUSD
              </a>
            </Link>
          </nav>
        </div>
        
        <ConnectWallet />
      </div>
    </header>
  );
};

export default Header;
