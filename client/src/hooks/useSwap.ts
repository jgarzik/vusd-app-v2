/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useSwap.ts - VUSD swap functionality hook
 * 
 * This module handles the token swapping interface between VUSD and other stablecoins.
 * It manages two distinct operations presented as a unified "swap" interface:
 * - "To VUSD": Uses the Minter contract with 0.01% fee
 * - "From VUSD": Uses the Redeemer contract with 0.1% fee
 * 
 * Key features:
 * - Real-time balance updates for the connected wallet
 * - Token approval management for ERC20 allowances
 * - Slippage-free swap execution with fixed fees
 * - Transaction status tracking and error handling
 * 
 * Only whitelisted stablecoins (USDC, USDT, DAI) can be swapped with VUSD.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { useEthersContracts } from './useEthersContracts';
import { useToast } from './use-toast';
import { SUPPORTED_TOKENS } from '@/constants/tokens';
import { parseUnits } from 'ethers/lib/utils';

type TokenBalances = Record<string, number>;
type SwapDirection = 'toVUSD' | 'fromVUSD';

/**
 * Custom hook providing token swap functionality between VUSD and stablecoins.
 * 
 * @returns {Object} Swap state and functions
 * @property {Object} balances - Current token balances for the connected wallet
 * @property {string} inputToken - Selected input token symbol
 * @property {string} outputToken - Selected output token symbol
 * @property {number} inputAmount - Amount to swap in human-readable format
 * @property {number} outputAmount - Expected output amount in human-readable format
 * @property {number} fee - Current fee percentage for the selected swap
 * @property {boolean} loading - Whether a swap operation is in progress
 * @property {Function} setInputToken - Function to change the input token
 * @property {Function} setOutputToken - Function to change the output token
 * @property {Function} setInputAmount - Function to update the input amount
 * @property {Function} setOutputAmount - Function to update the output amount
 * @property {Function} swapTokens - Function to reverse the swap direction
 * @property {Function} executeSwap - Function to perform the swap transaction
 * @property {Function} estimateSwap - Function to calculate expected output amount
 * @property {Function} refreshBalances - Function to refresh token balances
 */
export const useSwap = () => {
  const { toast } = useToast();
  const { address, isConnected } = useWeb3();
  const { contracts, getConnectedContracts } = useEthersContracts();
  
  const [balances, setBalances] = useState<TokenBalances>({
    VUSD: 0,
    USDC: 0,
    USDT: 0,
    DAI: 0,
  });
  
  // Track when balances were last updated (for caching)
  const [balanceLastUpdated, setBalanceLastUpdated] = useState<number>(0);
  // Cache window in milliseconds (60 seconds)
  const BALANCE_CACHE_DURATION = 60 * 1000;
  
  const [inputToken, setInputToken] = useState<string>('USDC');
  const [outputToken, setOutputToken] = useState<string>('VUSD');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0.003); // Default 0.3% fee
  const [loading, setLoading] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [checkingApproval, setCheckingApproval] = useState<boolean>(false);
  
  /**
   * Retrieves the number of decimal places for a given token symbol.
   * 
   * @param symbol - The token symbol to look up (e.g., "VUSD", "USDC")
   * @returns The number of decimal places for the token, defaults to 18 if not found
   * 
   * @remarks
   * This is crucial for proper numeric conversions as different tokens use
   * different decimal precisions (e.g., USDC uses 6 decimals while VUSD uses 18)
   */
  const getTokenDecimals = useCallback((symbol: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    return token?.decimals || 18;
  }, []);
  
  /**
   * Retrieves the blockchain contract address for a given token symbol.
   * 
   * @param symbol - The token symbol to look up (e.g., "VUSD", "USDC")
   * @returns The Ethereum address of the token contract, or empty string if not found
   * 
   * @example
   * const usdcAddress = getTokenAddress("USDC");
   * // Returns "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" (USDC address)
   */
  const getTokenAddress = useCallback((symbol: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    return token?.address || '';
  }, []);
  
  /**
   * Determines the swap direction based on the output token.
   * 
   * @returns SwapDirection - 'toVUSD' if outputToken is VUSD, 'fromVUSD' otherwise
   * 
   * @remarks
   * This is used to determine which contract to call:
   * - 'toVUSD' uses the Minter contract (stablecoin → VUSD)
   * - 'fromVUSD' uses the Redeemer contract (VUSD → stablecoin)
   */
  const getSwapDirection = useCallback((): SwapDirection => {
    return outputToken === 'VUSD' ? 'toVUSD' : 'fromVUSD';
  }, [outputToken]);
  
  /**
   * Fetches token balances for all supported tokens from the blockchain.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @remarks
   * This function retrieves balances for all supported tokens (VUSD, USDC, USDT, DAI)
   * using the appropriate contract calls. It handles each token's specific decimal precision
   * and updates the balances state with human-readable numeric values.
   * 
   * @throws Logs errors to console but doesn't propagate them to prevent UI disruption
   */
  const fetchBalances = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !address) return;
    
    // Check if cached balances are still fresh (within 60 seconds)
    const now = Date.now();
    if (!forceRefresh && now - balanceLastUpdated < BALANCE_CACHE_DURATION) {
      // Use cached balances if they're fresh enough
      return;
    }
    
    try {
      const newBalances: TokenBalances = { ...balances };
      
      for (const token of SUPPORTED_TOKENS) {
        if (token.symbol === 'VUSD') {
          const balance = await contracts.vusd.balanceOf(address);
          newBalances.VUSD = parseFloat(ethers.formatUnits(balance, token.decimals));
        } else {
          const erc20Contract = contracts.getERC20Contract(token.address);
          if (erc20Contract) {
            const balance = await erc20Contract.balanceOf(address);
            newBalances[token.symbol] = parseFloat(ethers.formatUnits(balance, token.decimals));
          }
        }
      }
      
      setBalances(newBalances);
      setBalanceLastUpdated(now); // Update the cache timestamp
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [address, isConnected, contracts, balances, balanceLastUpdated, BALANCE_CACHE_DURATION]);
  
  /**
   * Calculates the expected output amount for a given swap.
   * 
   * @async
   * @param amount - The input amount to swap
   * @param fromToken - The token symbol being swapped from
   * @param toToken - The token symbol being swapped to
   * @returns {Promise<void>} - Updates state with output amount and fee
   * 
   * @remarks
   * This function performs different calculations based on swap direction:
   * - For toVUSD: Calls Minter.calculateMintage with 0.01% fee
   * - For fromVUSD: Calls Redeemer.redeemable with 0.1% fee
   * 
   * The output amounts are converted to human-readable numbers with appropriate decimal
   * precision for each token. Fees are retrieved from the contracts and stored as percentages.
   * 
   * @throws Displays a toast notification to the user on errors
   */
  const estimateSwap = useCallback(async (amount: number, fromToken: string, toToken: string) => {
    if (!amount || amount <= 0) {
      setOutputAmount(0);
      return;
    }
    
    // Use a local loading variable to avoid triggering re-renders
    let isEstimating = true;
    
    try {
      // Only set the loading state if it's a user-initiated action, not an automatic calculation
      if (inputAmount === amount) {
        setLoading(true);
      }
      
      const direction: SwapDirection = toToken === 'VUSD' ? 'toVUSD' : 'fromVUSD';
      
      if (direction === 'toVUSD') {
        // Minting VUSD
        const fromTokenAddress = getTokenAddress(fromToken);
        const fromTokenDecimals = getTokenDecimals(fromToken);
        const amountIn = ethers.parseUnits(amount.toString(), fromTokenDecimals);
        
        const mintage = await contracts.minter.calculateMintage(fromTokenAddress, amountIn);
        setOutputAmount(parseFloat(ethers.formatUnits(mintage, 18)));
        
        // Get minting fee
        const mintingFee = await contracts.minter.mintingFee();
        setFee(parseFloat(ethers.formatUnits(mintingFee, 4)) / 100);
      } else {
        // Redeeming VUSD
        const toTokenAddress = getTokenAddress(toToken);
        const amountIn = ethers.parseUnits(amount.toString(), 18); // VUSD has 18 decimals
        
        // Use getFunction to disambiguate between overloaded functions
        const redeemableFunc = contracts.redeemer.getFunction("redeemable(address,uint256)");
        const redeemable = await redeemableFunc(toTokenAddress, amountIn);
        const toTokenDecimals = getTokenDecimals(toToken);
        setOutputAmount(parseFloat(ethers.formatUnits(redeemable, toTokenDecimals)));
        
        // Get redeem fee
        const redeemFee = await contracts.redeemer.redeemFee();
        setFee(parseFloat(ethers.formatUnits(redeemFee, 4)) / 100);
      }
    } catch (error) {
      console.error('Error estimating swap:', error);
      setOutputAmount(0);
      toast({
        title: 'Estimation Error',
        description: 'Failed to estimate swap amount',
        variant: 'destructive',
      });
    } finally {
      isEstimating = false;
      
      // Only reset the loading state if it's a user-initiated action
      if (inputAmount === amount) {
        setLoading(false);
      }
    }
  }, [contracts, getTokenAddress, getTokenDecimals, toast, inputAmount]);
  
  /**
   * Executes a token swap transaction, handling approvals and blockchain interactions.
   * 
   * @async
   * @returns {Promise<ethers.TransactionResponse>} The transaction response object
   * 
   * @remarks
   * This function handles the complete swap workflow:
   * 1. Validates connection state and input amount
   * 2. Determines swap direction (toVUSD or fromVUSD)
   * 3. Checks token allowance and requests approval if needed
   * 4. Executes the appropriate contract call (mint or redeem)
   * 5. Waits for transaction confirmation
   * 6. Updates token balances after successful transaction
   * 
   * For toVUSD swaps, it calls the Minter.mint function.
   * For fromVUSD swaps, it calls the Redeemer.redeem function.
   * 
   * @throws {Error} If wallet is not connected or amount is invalid
   * @throws Propagates any blockchain errors to the caller for handling
   * 
   * @example
   * try {
   *   const tx = await executeSwap();
   *   console.log("Swap successful:", tx.hash);
   * } catch (error) {
   *   console.error("Swap failed:", error);
   * }
   */
  const executeSwap = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    if (!inputAmount || inputAmount <= 0) {
      throw new Error('Invalid amount');
    }
    
    const direction = getSwapDirection();
    const inputTokenAddress = getTokenAddress(inputToken);
    const outputTokenAddress = getTokenAddress(outputToken);
    
    try {
      setLoading(true);
      const connectedContracts = await getConnectedContracts();
      
      if (direction === 'toVUSD') {
        // Minting VUSD
        const inputTokenContract = connectedContracts.getERC20Contract(inputTokenAddress);
        const inputDecimals = getTokenDecimals(inputToken);
        const amount = ethers.parseUnits(inputAmount.toString(), inputDecimals);
        
        // Check allowance
        const allowance = await inputTokenContract.allowance(address, connectedContracts.minter.target);
        
        if (allowance < amount) {
          // Approve minter to spend tokens
          const approveTx = await inputTokenContract.approve(connectedContracts.minter.target, ethers.MaxUint256);
          await approveTx.wait();
        }
        
        // Execute mint transaction
        const tx = await connectedContracts.minter.mint(inputTokenAddress, amount);
        await tx.wait();
        
        // Refresh balances immediately after transaction (force refresh to bypass cache)
        await fetchBalances(true);
        return tx;
      } else {
        // Redeeming VUSD
        const amount = ethers.parseUnits(inputAmount.toString(), 18); // VUSD has 18 decimals
        
        // Check allowance
        const allowance = await connectedContracts.vusd.allowance(address, connectedContracts.redeemer.target);
        
        if (allowance < amount) {
          // Approve redeemer to spend VUSD
          const approveTx = await connectedContracts.vusd.approve(connectedContracts.redeemer.target, ethers.MaxUint256);
          await approveTx.wait();
        }
        
        // Execute redeem transaction - use specific function signature to avoid ambiguity
        const redeemFunc = connectedContracts.redeemer.getFunction("redeem(address,uint256)");
        const tx = await redeemFunc(outputTokenAddress, amount);
        await tx.wait();
        
        // Refresh balances immediately after transaction (force refresh to bypass cache)
        await fetchBalances(true);
        return tx;
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    address, 
    inputAmount, 
    inputToken, 
    outputToken, 
    isConnected, 
    getSwapDirection, 
    getTokenAddress, 
    getTokenDecimals, 
    getConnectedContracts, 
    fetchBalances
  ]);
  
  /**
   * Automatically loads token balances when wallet connection changes.
   * 
   * This effect runs when the wallet connection state changes,
   * ensuring balances are immediately available when a user connects.
   */
  useEffect(() => {
    if (isConnected) {
      fetchBalances();
    }
  }, [isConnected, fetchBalances]);
  
  /**
   * Swaps the positions of input and output tokens and their amounts.
   * 
   * @returns {void}
   * 
   * @remarks
   * This is a convenience function allowing users to quickly reverse
   * their swap direction by flipping the input and output tokens.
   * It maintains the amounts so the user sees the inverse rate immediately.
   */
  const swapTokens = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  }, [inputToken, outputToken, inputAmount, outputAmount]);
  
  /**
   * Checks if the current swap requires token approval.
   * 
   * @async
   * @returns {Promise<boolean>} Whether approval is needed
   * 
   * @remarks
   * This function determines whether the user needs to approve token spending
   * before executing a swap. It checks the current allowance against the required
   * amount based on the swap direction:
   * - For 'toVUSD': Checks if the input token allowance to Minter is sufficient
   * - For 'fromVUSD': Checks if the VUSD allowance to Redeemer is sufficient
   */
  const checkApprovalNeeded = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !address || !inputAmount || inputAmount <= 0) {
      return false;
    }
    
    try {
      // Note: We'll manage the checkingApproval state outside this function
      const connectedContracts = await getConnectedContracts();
      const direction = getSwapDirection();
      
      if (direction === 'toVUSD') {
        // Check approval for input token -> Minter
        const inputTokenAddress = getTokenAddress(inputToken);
        const inputTokenContract = connectedContracts.getERC20Contract(inputTokenAddress);
        const inputDecimals = getTokenDecimals(inputToken);
        const amount = ethers.parseUnits(inputAmount.toString(), inputDecimals);
        
        const allowance = await inputTokenContract.allowance(address, connectedContracts.minter.target);
        return allowance < amount;
      } else {
        // Check approval for VUSD -> Redeemer
        const amount = ethers.parseUnits(inputAmount.toString(), 18); // VUSD has 18 decimals
        const allowance = await connectedContracts.vusd.allowance(address, connectedContracts.redeemer.target);
        return allowance < amount;
      }
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  }, [
    address,
    isConnected,
    inputAmount,
    inputToken,
    getSwapDirection,
    getTokenAddress,
    getTokenDecimals,
    getConnectedContracts
  ]);
  
  /**
   * Approves token spending for the current swap.
   * 
   * @async
   * @returns {Promise<ethers.TransactionResponse>} The approval transaction
   * 
   * @remarks
   * This function handles token approval for the current swap:
   * - For 'toVUSD': Approves the Minter contract to spend the input token
   * - For 'fromVUSD': Approves the Redeemer contract to spend VUSD
   * 
   * It uses MaxUint256 as the approval amount to avoid needing multiple approvals.
   * After approval completes, it automatically sets needsApproval to false without rechecking.
   */
  const approveTokens = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setLoading(true);
      const connectedContracts = await getConnectedContracts();
      const direction = getSwapDirection();
      
      if (direction === 'toVUSD') {
        // Approve input token -> Minter
        const inputTokenAddress = getTokenAddress(inputToken);
        const inputTokenContract = connectedContracts.getERC20Contract(inputTokenAddress);
        
        // Execute the approval transaction
        const tx = await inputTokenContract.approve(connectedContracts.minter.target, ethers.MaxUint256);
        await tx.wait();
        return tx;
      } else {
        // Approve VUSD -> Redeemer
        const tx = await connectedContracts.vusd.approve(connectedContracts.redeemer.target, ethers.MaxUint256);
        await tx.wait();
        return tx;
      }
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    } finally {
      setLoading(false);
      // After approval, manually set approval to false since we know it's approved now
      setNeedsApproval(false);
    }
  }, [
    address,
    isConnected,
    inputToken,
    getSwapDirection,
    getTokenAddress,
    getConnectedContracts
  ]);

  // Run approval check with significant throttling to prevent excessive blockchain calls
  useEffect(() => {
    // Prevent unnecessary checks
    if (!isConnected || !address || !inputAmount || inputAmount <= 0) {
      setNeedsApproval(false);
      setCheckingApproval(false);
      return;
    }

    // Flag to track if the effect is still active when async operations complete
    let isActive = true;
    
    // Significant throttling - check approval less frequently
    // Using a 30-second delay prevents excessive network calls
    let approvalCheckTimeout: NodeJS.Timeout | null = null;
    
    const runApprovalCheck = async () => {
      // Skip if already checking approval
      if (checkingApproval) return;
      
      try {
        // Capture current values to ensure consistency in async context
        const currentInputAmount = inputAmount;
        const currentInputToken = inputToken;
        const currentOutputToken = outputToken;
        
        // Only set checking state if still active (prevents state updates on unmounted components)
        if (isActive) setCheckingApproval(true);
        
        // Get contracts with signer 
        const connectedContracts = await getConnectedContracts();
        let isApprovalRequired = false;
        
        const direction = currentOutputToken === 'VUSD' ? 'toVUSD' : 'fromVUSD';
        
        if (direction === 'toVUSD') {
          // Check approval for input token -> Minter
          const tokenAddress = getTokenAddress(currentInputToken);
          const tokenContract = connectedContracts.getERC20Contract(tokenAddress);
          const decimals = getTokenDecimals(currentInputToken);
          const amount = ethers.parseUnits(currentInputAmount.toString(), decimals);
          
          const allowance = await tokenContract.allowance(address, connectedContracts.minter.target);
          isApprovalRequired = allowance < amount;
        } else {
          // Check approval for VUSD -> Redeemer
          const amount = ethers.parseUnits(currentInputAmount.toString(), 18);
          const allowance = await connectedContracts.vusd.allowance(address, connectedContracts.redeemer.target);
          isApprovalRequired = allowance < amount;
        }
        
        // Only update state if the component is still mounted and input values match what we checked
        if (isActive && 
            currentInputAmount === inputAmount && 
            currentInputToken === inputToken && 
            currentOutputToken === outputToken) {
          setNeedsApproval(isApprovalRequired);
        }
      } catch (error) {
        console.error('Error checking approval:', error);
      } finally {
        // Clear checking state if component is still mounted
        if (isActive) setCheckingApproval(false);
      }
    };
    
    // Heavy throttling - only check approval every 30 seconds or when critically important values change
    approvalCheckTimeout = setTimeout(runApprovalCheck, 30000); // 30 second delay
    
    // Initial check on input change after a short delay (only once per major input change)
    if (!checkingApproval) {
      const initialCheckTimeout = setTimeout(runApprovalCheck, 500);
      
      return () => {
        isActive = false;
        if (approvalCheckTimeout) clearTimeout(approvalCheckTimeout);
        if (initialCheckTimeout) clearTimeout(initialCheckTimeout);
      };
    }
    
    // Clean up
    return () => {
      isActive = false;
      if (approvalCheckTimeout) clearTimeout(approvalCheckTimeout);
    };
  }, [
    // Major value changes that require a fresh approval check
    isConnected && inputAmount > 0, // Only true when both conditions are met (reduces checks)
    inputToken, 
    outputToken,
    // Using a reference comparison trick to limit updates
    // This will only retrigger when address changes, not on every render
    address,
    // Include necessary functions
    getConnectedContracts,
    getTokenAddress,
    getTokenDecimals
  ]);
  
  return {
    balances,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    fee,
    loading,
    checkingApproval,
    needsApproval,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setOutputAmount,
    swapTokens,
    executeSwap,
    estimateSwap,
    approveTokens,
    checkApprovalNeeded,
    refreshBalances: fetchBalances,
  };
};
