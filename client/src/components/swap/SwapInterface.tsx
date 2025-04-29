/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * SwapInterface.tsx - Main token swap UI component
 * 
 * This component provides the primary user interface for swapping between VUSD and other stablecoins.
 * It integrates with the useSwap hook to provide:
 * - Token selection (input/output) with balance display
 * - Amount input with real-time price quotes
 * - Token swap direction toggle
 * - Exchange rate and fee display
 * - Swap execution button with appropriate error handling
 * - Transaction status modal showing pending/success/error states
 * 
 * The interface abstracts the underlying mint/redeem contract operations to present a unified "swap" experience.
 */

import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import TokenSelector from "./TokenSelector";
import TransactionStatus from "./TransactionStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSwap } from "@/hooks/useSwap";
import { useWeb3 } from "@/hooks/useWeb3";
import { useToast } from "@/hooks/use-toast";
import { formatAmount, calculateExchangeRate, parseInputAmount } from "@/lib/utils";
import { SUPPORTED_TOKENS, Token } from "@/constants/tokens";

/**
 * Main token swap interface component for exchanging between VUSD and stablecoins.
 * 
 * @returns {JSX.Element} The Swap interface component
 * 
 * @remarks
 * This component provides the complete UI for VUSD token swapping:
 * - Bidirectional swapping between VUSD and whitelisted stablecoins (USDC, USDT, DAI)
 * - Real-time price quotes and fee information
 * - Balance display for connected wallets
 * - Transaction status display and error handling
 * - Token selection interface
 * 
 * Under the hood, swapping to VUSD uses the Minter contract with a 0.01% fee,
 * while swapping from VUSD uses the Redeemer contract with a 0.1% fee.
 * This implementation detail is abstracted to provide a consistent swap experience.
 */
const SwapInterface = () => {
  const { toast } = useToast();
  const { 
    address, 
    isConnected, 
    connect, 
    connectors,
    isMainnet
  } = useWeb3();
  const {
    balances,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    fee,
    swapTokens,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setOutputAmount,
    executeSwap,
    approveTokens,
    loading,
    checkingApproval,
    needsApproval,
    estimateSwap
  } = useSwap();

  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"input" | "output">("input");
  const [txStatus, setTxStatus] = useState<"none" | "pending" | "success" | "error">("none");
  const [txHash, setTxHash] = useState("");
  
  /**
   * Automatically updates the expected output amount when swap parameters change.
   * 
   * This effect triggers a new swap estimation whenever the input amount or
   * either token selection changes, keeping the output value in sync.
   */
  // Use a separate useEffect for estimating swap amounts with debounce to prevent rapid re-renders
  useEffect(() => {
    // Create a debounced function to avoid too many calls
    const debouncedEstimate = setTimeout(() => {
      if (inputAmount && inputAmount > 0 && inputToken && outputToken) {
        console.log(`Estimating swap: ${inputAmount} ${inputToken} to ${outputToken}`);
        estimateSwap(inputAmount, inputToken, outputToken);
      } else {
        setOutputAmount(0);
      }
    }, 300); // 300ms debounce
    
    // Clear timeout on cleanup
    return () => clearTimeout(debouncedEstimate);
  }, [inputAmount, inputToken, outputToken, estimateSwap, setOutputAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAmount(parseInputAmount(value));
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOutputAmount(parseInputAmount(value));
    // In a real implementation, we would estimate the input based on the output
  };

  /**
   * Determines the appropriate button action and text based on current state.
   * 
   * @returns {Object} Button action and text information
   * @property {Function} action - The function to call when the button is clicked
   * @property {string} text - The text to display on the button
   * @property {boolean} disabled - Whether the button should be disabled
   * 
   * @remarks
   * This follows a cascading flow of actions:
   * 1. Connect wallet if not connected
   * 2. Switch to Ethereum if on a different network
   * 3. Approve token spending if needed
   * 4. Execute the swap if all requirements are met
   */
  // Determine button state outside of render cycle
  // This avoids the constant recalculation that's happening
  const [buttonState, setButtonState] = useState({
    text: "Connect Wallet",
    disabled: false
  });
  
  // Update button state directly instead of using a function
  useEffect(() => {
    // Only update when we're not in a loading state
    if (loading || checkingApproval) return; 
    
    console.log('Updating button state directly');
    
    // Step 1: Check if wallet is connected
    if (!isConnected) {
      setButtonState({
        text: "Connect Wallet",
        disabled: false
      });
      return;
    }
    
    // Step 2: Check if on Ethereum mainnet (chain ID 1)
    if (!isMainnet) {
      setButtonState({
        text: "Switch to Ethereum",
        disabled: false
      });
      return;
    }
    
    // Validate input amount
    if (!inputAmount || inputAmount <= 0) {
      setButtonState({
        text: "Enter an amount",
        disabled: true
      });
      return;
    }
    
    // Check token balance
    const balance = balances[inputToken];
    if (balance < inputAmount) {
      setButtonState({
        text: `Insufficient ${inputToken} balance`,
        disabled: true
      });
      return;
    }
    
    // Step 3: Check if token approval is needed
    if (needsApproval) {
      setButtonState({
        text: `Approve ${inputToken}`,
        disabled: false
      });
      return;
    }
    
    // Step 4: Execute the swap
    console.log(`Setting button text with: inputToken=${inputToken}, outputToken=${outputToken}`);
    const buttonText = outputToken === 'VUSD' 
      ? `Swap ${inputToken} for VUSD` 
      : `Swap VUSD for ${outputToken}`;
    console.log(`Generated button text: ${buttonText}`);
    
    setButtonState({
      text: buttonText,
      disabled: false
    });
  }, [
    isConnected,
    isMainnet,
    inputAmount,
    inputToken,
    outputToken,
    balances,
    needsApproval,
    loading,
    checkingApproval
  ]);
  
  // Define button actions based on current state
  const handleButtonClick = async () => {
    // Don't do anything if button is disabled or we're in loading state
    if (buttonState.disabled || loading) {
      return;
    }
    
    // Step 1: Connect wallet if not connected
    if (!isConnected) {
      if (connectors && connectors.length > 0) {
        connect(connectors[0].id);
      }
      return;
    }
    
    // Step 2: Show toast for wrong network
    if (!isMainnet) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Ethereum Mainnet in your wallet",
        variant: "destructive"
      });
      return;
    }
    
    // Step 3: Approve tokens if needed
    if (needsApproval) {
      try {
        setTxStatus("pending");
        const tx = await approveTokens();
        setTxHash(tx.hash);
        toast({
          title: "Approval Successful",
          description: "You can now proceed with the swap",
        });
      } catch (error) {
        console.error("Approval error:", error);
        toast({
          title: "Approval Failed",
          description: (error as Error).message || "Failed to approve token spending",
          variant: "destructive"
        });
      } finally {
        setTxStatus("none");
      }
      return;
    }
    
    // Step 4: Execute the swap
    setTxStatus("pending");
    try {
      const tx = await executeSwap();
      setTxHash(tx.hash);
      setTxStatus("success");
    } catch (error) {
      console.error("Swap error:", error);
      setTxStatus("error");
      toast({
        title: "Transaction Failed",
        description: (error as Error).message || "An error occurred during the swap",
        variant: "destructive"
      });
    }
  };

  const switchTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
  };

  const openTokenSelector = (type: "input" | "output") => {
    setSelectingFor(type);
    setShowTokenSelector(true);
  };

  /**
   * Handles token selection from the TokenSelector modal.
   * 
   * @param {Token} token - The token selected by the user
   * @returns {void}
   * 
   * @remarks
   * This function ensures a consistent token selection experience by:
   * 1. Determining whether the selection is for input or output side
   * 2. Automatically swapping tokens if the same token is selected on both sides
   * 3. Preventing duplicate tokens in the swap interface
   * 4. Closing the token selector modal after selection
   */
  const onSelectToken = (token: Token) => {
    if (selectingFor === "input") {
      if (token.symbol === outputToken) {
        // If selecting the same token that's already on the other side, swap them
        setOutputToken(inputToken);
      }
      setInputToken(token.symbol);
    } else {
      if (token.symbol === inputToken) {
        // If selecting the same token that's already on the other side, swap them
        setInputToken(outputToken);
      }
      setOutputToken(token.symbol);
    }
    setShowTokenSelector(false);
  };

  const closeTransactionModal = () => {
    setTxStatus("none");
    setTxHash("");
  };

  // Get appropriate token colors
  const getTokenIconClass = (symbol: string) => {
    switch(symbol) {
      case 'USDC': return 'token-icon-usdc';
      case 'USDT': return 'token-icon-usdt';
      case 'DAI': return 'token-icon-dai';
      case 'VUSD': return 'token-icon-vusd';
      default: return 'bg-gray-500';
    }
  };

  // Get token display data
  const getTokenData = (symbol: string) => SUPPORTED_TOKENS.find(t => t.symbol === symbol) || SUPPORTED_TOKENS[0];
  
  // Helper function to get token decimals
  const getTokenDecimals = (symbol: string): number => {
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
    return token?.decimals || 18; // Default to 18 if not found
  };

  return (
    <>
      <div className="swap-container mb-8">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-heading font-semibold text-xl">Swap</h2>
          <p className="text-gray-400 text-sm mt-1">
            {outputToken === 'VUSD' 
              ? 'Swap stablecoins for VUSD (0.01% fee)' 
              : 'Swap VUSD for stablecoins (0.1% fee)'}
          </p>
        </div>
        
        <div className="p-6">
          {/* From Token Input */}
          <div className="bg-background-light rounded-xl p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">From</label>
              <div className="text-sm text-gray-400">
                Balance: <span>{isConnected ? formatAmount(balances[inputToken] || 0, getTokenDecimals(inputToken)) : "-"}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Input
                type="number"
                placeholder="0.0"
                className="bg-transparent text-xl font-medium w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={inputAmount || ""}
                onChange={handleInputChange}
              />
              
              <button 
                className="ml-2 bg-background px-3 py-2 rounded-xl flex items-center"
                onClick={() => openTokenSelector("input")}
              >
                <div className={`w-6 h-6 rounded-full overflow-hidden ${getTokenIconClass(inputToken)} mr-2 flex items-center justify-center`}>
                  <span className="text-xs font-bold">
                    {inputToken === "VUSD" ? "V" : "$"}
                  </span>
                </div>
                <span className="font-medium">{inputToken}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Swap Direction Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button 
              className="bg-background-light w-10 h-10 rounded-xl border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors"
              onClick={switchTokens}
            >
              <ArrowDown className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          {/* To Token Input */}
          <div className="bg-background-light rounded-xl p-4 mt-2 mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">To</label>
              <div className="text-sm text-gray-400">
                Balance: <span>{isConnected ? formatAmount(balances[outputToken] || 0, getTokenDecimals(outputToken)) : "-"}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Input
                type="number"
                placeholder="0.0"
                className="bg-transparent text-xl font-medium w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={outputAmount || ""}
                onChange={handleOutputChange}
                readOnly={true}
              />
              
              <button 
                className="ml-2 bg-background px-3 py-2 rounded-xl flex items-center"
                onClick={() => openTokenSelector("output")}
              >
                <div className={`w-6 h-6 rounded-full overflow-hidden ${getTokenIconClass(outputToken)} mr-2 flex items-center justify-center`}>
                  <span className="text-xs font-bold">
                    {outputToken === "VUSD" ? "V" : "$"}
                  </span>
                </div>
                <span className="font-medium">{outputToken}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Exchange Rate & Fee Info */}
          <div className="text-sm mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Exchange Rate</span>
              <span className="text-gray-300">
                {calculateExchangeRate(
                  inputAmount || 0,
                  outputAmount || 0,
                  inputToken,
                  outputToken,
                  Math.max(getTokenDecimals(inputToken), getTokenDecimals(outputToken))
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fee</span>
              <span className="text-gray-300">
                {outputToken === 'VUSD' 
                  ? '0.01%' // Minting fee
                  : '0.1%'   // Redeeming fee
                }
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400">Slippage</span>
              <span className="text-gray-300">0% (Zero slippage)</span>
            </div>
          </div>
          
          {/* Smart Cascading Swap Button - separate display logic from state */}
          <Button
            className="w-full font-medium rounded-xl py-6 text-base"
            onClick={handleButtonClick}
            disabled={buttonState.disabled || loading}
          >
            {/* Only show Loading when actively doing something */}
            {loading ? "Loading..." : buttonState.text}
          </Button>
          
          {/* Debug info - will remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              <div>isConnected: {isConnected ? 'Yes' : 'No'}</div>
              <div>isMainnet: {isMainnet ? 'Yes' : 'No'}</div>
              <div>needsApproval: {needsApproval ? 'Yes' : 'No'}</div>
              <div>checkingApproval: {checkingApproval ? 'Yes' : 'No'}</div>
              <div>loading: {loading ? 'Yes' : 'No'}</div>
              <div>buttonState: {buttonState.text} (disabled: {buttonState.disabled ? 'Yes' : 'No'})</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Token Selector Modal */}
      <TokenSelector
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        onSelectToken={onSelectToken}
        balances={balances}
        excludeToken={selectingFor === "input" ? outputToken : inputToken}
      />
      
      {/* Transaction Status Modal */}
      <TransactionStatus
        isOpen={txStatus !== "none"}
        status={txStatus}
        onClose={closeTransactionModal}
        txHash={txHash}
        fromToken={getTokenData(inputToken)}
        toToken={getTokenData(outputToken)}
        fromAmount={inputAmount || 0}
        toAmount={outputAmount || 0}
      />
    </>
  );
};

export default SwapInterface;