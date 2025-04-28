/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * TokenSelector.tsx - Token selection modal component
 * 
 * This component provides a modal dialog for users to select tokens during swap operations.
 * Key features:
 * - Displays a filterable list of supported tokens
 * - Shows live token balances for the connected wallet
 * - Allows searching by token name or symbol
 * - Highlights the most commonly used tokens
 * - Supports excluding the currently selected token from the opposite swap field
 * 
 * The component is used in the SwapInterface to allow users to select input and output tokens.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Token, SUPPORTED_TOKENS } from "@/constants/tokens";
import { formatAmount } from "@/lib/utils";
import { useWeb3 } from "@/hooks/useWeb3";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  balances: Record<string, number>;
  excludeToken?: string;
}

/**
 * Modal component for selecting tokens during swap operations.
 * 
 * @param {TokenSelectorProps} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Function to call when closing the modal
 * @param {(token: Token) => void} props.onSelectToken - Callback for when a token is selected
 * @param {Record<string, number>} props.balances - Current token balances for the connected wallet
 * @param {string} [props.excludeToken] - Token symbol to exclude from the selection list
 * @returns {JSX.Element} The TokenSelector modal
 * 
 * @remarks
 * This component provides a searchable dialog for selecting tokens during swap operations.
 * It shows each token's balance for the connected wallet, allows filtering by name or
 * symbol, and prevents selecting the token that's already chosen on the other side of the
 * swap interface.
 * 
 * The component uses the Dialog component from shadcn/ui for accessibility and responsive behavior.
 */
const TokenSelector = ({
  isOpen,
  onClose,
  onSelectToken,
  balances,
  excludeToken
}: TokenSelectorProps) => {
  const { isConnected } = useWeb3();
  const [searchTerm, setSearchTerm] = useState("");
  
  /**
   * Filters tokens based on search term and excluded token.
   * 
   * This filtering:
   * 1. Removes any token that matches the excludeToken prop
   * 2. Includes tokens whose symbol or name match the search term (case insensitive)
   */
  const filteredTokens = SUPPORTED_TOKENS.filter(token => 
    token.symbol !== excludeToken && 
    (token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
     token.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  /**
   * Returns the appropriate CSS class for token icons based on token symbol.
   * 
   * @param {string} symbol - The token symbol (e.g., "USDC", "VUSD")
   * @returns {string} CSS class string for styling the token icon
   */
  const getTokenIconClass = (symbol: string) => {
    switch(symbol) {
      case 'USDC': return 'token-icon-usdc';
      case 'USDT': return 'token-icon-usdt';
      case 'DAI': return 'token-icon-dai';
      case 'VUSD': return 'token-icon-vusd';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-background-card rounded-2xl max-w-md w-full overflow-hidden border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-heading font-semibold text-lg">Select a token</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose the token you want to swap
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <Input
            type="text"
            placeholder="Search token name or symbol"
            className="w-full bg-background-light rounded-xl px-4 py-3 text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto pr-1 mt-2">
          <div className="space-y-2">
            {filteredTokens.map(token => (
              <button
                key={token.symbol}
                className="w-full flex items-center justify-between p-3 hover:bg-background-light rounded-xl transition-colors"
                onClick={() => onSelectToken(token)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full overflow-hidden ${getTokenIconClass(token.symbol)} mr-3 flex items-center justify-center`}>
                    <span className="font-bold text-white">
                      {token.symbol === "VUSD" ? "V" : "$"}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  Balance: {isConnected ? formatAmount(balances[token.symbol] || 0) : "-"}
                </div>
              </button>
            ))}
            
            {filteredTokens.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                No tokens found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
