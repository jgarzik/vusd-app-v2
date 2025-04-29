/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * TransactionStatus.tsx - Transaction status modal component
 * 
 * This component displays the status of blockchain transactions during token swaps.
 * It provides visual feedback for:
 * - Pending transactions with a loading spinner
 * - Successful transactions with a confirmation message and details
 * - Failed transactions with error information
 * 
 * The modal includes:
 * - Transaction summary (from token, to token, amounts)
 * - Transaction hash with Etherscan link for verification
 * - Appropriate status icons and colors based on transaction state
 * - Close button to dismiss after completion
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Token } from "@/constants/tokens";

interface TransactionStatusProps {
  isOpen: boolean;
  status: "none" | "pending" | "success" | "error";
  onClose: () => void;
  txHash: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
}

const TransactionStatus = ({
  isOpen,
  status,
  onClose,
  txHash,
  fromToken,
  toToken,
  fromAmount,
  toAmount
}: TransactionStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return (
          <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 bg-opacity-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        );
      case "success":
        return (
          <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500 bg-opacity-10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        );
      case "error":
        return (
          <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500 bg-opacity-10">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "pending":
        return `Transaction Awaiting Confirmation`;
      case "success":
        return `Swap Transaction Successful`;
      case "error":
        return `Swap Transaction Failed`;
      default:
        return "";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "pending":
        return "Your transaction is awaiting confirmation on the Ethereum blockchain. This may take a few minutes.";
      case "success":
        return `You've successfully swapped ${formatAmount(fromAmount, fromToken.decimals, true)} ${fromToken.symbol} for ${formatAmount(toAmount, toToken.decimals, true)} ${toToken.symbol}`;
      case "error":
        return `There was an error processing your swap`;
      default:
        return "";
    }
  };

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
          <DialogTitle className="font-heading font-semibold text-lg">
            Swap Status
          </DialogTitle>
          <DialogDescription className="sr-only">
            Transaction status and details for your token swap
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 text-center">
          {getStatusIcon()}
          
          <h4 className="font-heading font-semibold text-xl mb-2">{getStatusTitle()}</h4>
          <p className="text-gray-400 mb-6">{getStatusDescription()}</p>
          
          {status !== "pending" && (
            <div className="p-3 bg-background-light rounded-xl mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                {/* From Token */}
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className={`w-8 h-8 rounded-full overflow-hidden ${getTokenIconClass(fromToken.symbol)} mr-3 flex items-center justify-center`}>
                    <span className="font-bold text-white">
                      {fromToken.symbol === "VUSD" ? "V" : "$"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{formatAmount(fromAmount, fromToken.decimals, true)} {fromToken.symbol}</div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex justify-center mx-2 mb-2 sm:mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* To Token */}
                <div className="flex items-center">
                  <div>
                    <div className="font-medium">{formatAmount(toAmount, toToken.decimals, true)} {toToken.symbol}</div>
                  </div>
                  <div className={`w-8 h-8 rounded-full overflow-hidden ${getTokenIconClass(toToken.symbol)} ml-3 flex items-center justify-center`}>
                    <span className="font-bold text-white">
                      {toToken.symbol === "VUSD" ? "V" : "$"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {txHash && (
              <a 
                href={`https://etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary-light text-sm font-medium flex items-center justify-center mb-2"
              >
                View on Etherscan
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            
            <Button onClick={onClose}>
              {status === "pending" ? "Close and wait" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionStatus;
