/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * utils.ts - General utility functions for the VUSD application
 * 
 * This module provides essential utility functions used throughout the application:
 * - Class name merging for conditional Tailwind CSS classes
 * - Ethereum address formatting for display purposes
 * - Number formatting utilities for currency and token amounts
 * - Exchange rate calculations for the swap interface
 * - Copy to clipboard functionality
 * - Input validation and parsing
 * 
 * These functions encapsulate common operations to ensure consistency
 * and reduce code duplication across components.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: number | string, decimals: number = 2, forceMaxPrecision: boolean = false): string {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (num < 0.01 && !forceMaxPrecision) {
    return "<0.01";
  }
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: forceMaxPrecision ? decimals : Math.min(decimals, 6)
  });
}

export function formatCurrency(amount: number | string, currency: string = "$", decimals: number = 2): string {
  if (!amount) return `${currency}0`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (num < 0.01) {
    return `${currency}<0.01`;
  }
  
  if (num >= 1000000) {
    return `${currency}${(num / 1000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}M`;
  }
  
  if (num >= 1000) {
    return `${currency}${(num / 1000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}K`;
  }
  
  return `${currency}${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals
  })}`;
}

export function calculateExchangeRate(
  fromAmount: number, 
  toAmount: number, 
  fromToken: string, 
  toToken: string,
  maxDecimals: number = 6
): string {
  if (!fromAmount || !toAmount) return `1 ${fromToken} = - ${toToken}`;
  const rate = toAmount / fromAmount;
  return `1 ${fromToken} = ${rate.toFixed(maxDecimals)} ${toToken}`;
}

export async function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function parseInputAmount(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
