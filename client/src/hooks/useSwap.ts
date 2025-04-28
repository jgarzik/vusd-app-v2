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
  
  const [inputToken, setInputToken] = useState<string>('USDC');
  const [outputToken, setOutputToken] = useState<string>('VUSD');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0.003); // Default 0.3% fee
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get token decimal places
  const getTokenDecimals = useCallback((symbol: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    return token?.decimals || 18;
  }, []);
  
  // Get token address
  const getTokenAddress = useCallback((symbol: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.symbol === symbol);
    return token?.address || '';
  }, []);
  
  // Get swap direction
  const getSwapDirection = useCallback((): SwapDirection => {
    return outputToken === 'VUSD' ? 'toVUSD' : 'fromVUSD';
  }, [outputToken]);
  
  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address) return;
    
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
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [address, isConnected, contracts, balances]);
  
  // Estimate swap output
  const estimateSwap = useCallback(async (amount: number, fromToken: string, toToken: string) => {
    if (!amount || amount <= 0) {
      setOutputAmount(0);
      return;
    }
    
    try {
      setLoading(true);
      
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
      setLoading(false);
    }
  }, [contracts, getTokenAddress, getTokenDecimals, toast]);
  
  // Execute swap
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
        
        // Refresh balances
        await fetchBalances();
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
        
        // Refresh balances
        await fetchBalances();
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
  
  // Load initial data
  useEffect(() => {
    if (isConnected) {
      fetchBalances();
    }
  }, [isConnected, fetchBalances]);
  
  // Swap tokens positions
  const swapTokens = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  }, [inputToken, outputToken, inputAmount, outputAmount]);
  
  return {
    balances,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    fee,
    loading,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setOutputAmount,
    swapTokens,
    executeSwap,
    estimateSwap,
    refreshBalances: fetchBalances,
  };
};
