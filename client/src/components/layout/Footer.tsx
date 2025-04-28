/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <span className="font-heading font-bold text-white">V</span>
            </div>
            <span className="ml-2 font-heading font-bold text-xl">VUSD</span>
          </div>
          <div className="flex space-x-6">
            <a 
              href="https://docs.vdollar.finance/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white"
            >
              Docs
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white"
            >
              GitHub
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white"
            >
              Twitter
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
