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

/**
 * Merges CSS class names with Tailwind's utility classes.
 * 
 * @param {...ClassValue[]} inputs - Class names to be merged
 * @returns {string} The merged class string
 * 
 * @remarks
 * This utility uses clsx and tailwind-merge to intelligently handle
 * class merging, including properly handling Tailwind CSS class conflicts.
 * It's the recommended way to apply conditional classes in components.
 * 
 * @example
 * <div className={cn(
 *   "base-class", 
 *   isActive && "active-class",
 *   variant === "primary" ? "primary-class" : "secondary-class"
 * )}>
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an Ethereum address for display by shortening it.
 * 
 * @param {string} address - The full Ethereum address
 * @returns {string} Shortened address in format "0x1234...5678"
 * 
 * @remarks
 * This function shows the first 6 characters and last 4 characters
 * of an address with ellipsis in between, making addresses more readable
 * while still recognizable to users.
 * 
 * @example
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678")
 * // Returns: "0x1234...5678"
 */
export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a number for display with appropriate decimal places.
 * 
 * @param {number|string} amount - The amount to format
 * @param {number} [decimals=2] - Maximum number of decimal places to show
 * @param {boolean} [forceMaxPrecision=false] - Whether to always show the maximum decimals 
 * @returns {string} Formatted amount string
 * 
 * @remarks
 * This function handles formatting token amounts with appropriate precision:
 * - Very small values (<0.01) are displayed as "<0.01" unless forceMaxPrecision is true
 * - Other values are formatted with appropriate decimal places using locale settings
 * - Maximum decimals is capped at 6 unless forceMaxPrecision is true
 * 
 * @example
 * formatAmount(1234.5678) // Returns: "1,234.57"
 * formatAmount(0.0012345) // Returns: "<0.01"
 * formatAmount(0.0012345, 4, true) // Returns: "0.0012"
 */
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

/**
 * Formats a number as currency with appropriate symbols and scaling.
 * 
 * @param {number|string} amount - The amount to format
 * @param {string} [currency="$"] - Currency symbol to prepend
 * @param {number} [decimals=2] - Maximum number of decimal places to show
 * @returns {string} Formatted currency string
 * 
 * @remarks
 * This function handles currency formatting with several smart features:
 * - Adds the specified currency symbol as prefix
 * - Formats very small values (<0.01) as "<0.01"
 * - Automatically scales large values (K for thousands, M for millions)
 * - Uses appropriate precision for each scale (e.g., 2 decimals for millions)
 * 
 * @example
 * formatCurrency(1234567.89) // Returns: "$1.23M"
 * formatCurrency(1234.56) // Returns: "$1.2K"
 * formatCurrency(123.45) // Returns: "$123.45"
 * formatCurrency(0.001) // Returns: "$<0.01"
 */
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

/**
 * Calculates and formats the exchange rate between two tokens.
 * 
 * @param {number} fromAmount - Amount of the source token
 * @param {number} toAmount - Equivalent amount of the destination token
 * @param {string} fromToken - Symbol of the source token
 * @param {string} toToken - Symbol of the destination token
 * @param {number} [maxDecimals=6] - Maximum decimal places to show in the rate
 * @returns {string} Formatted exchange rate string
 * 
 * @remarks
 * This function calculates the exchange rate between two tokens and formats
 * it into a human-readable string showing how much of the destination token
 * you get for 1 unit of the source token.
 * 
 * @example
 * calculateExchangeRate(1, 1.002, "USDC", "VUSD") 
 * // Returns: "1 USDC = 1.002000 VUSD"
 */
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

/**
 * Copies the provided text to the user's clipboard.
 * 
 * @param {string} text - The text to copy
 * @returns {Promise<void>} Promise that resolves when copying is complete
 * 
 * @remarks
 * This function uses the Clipboard API to copy text to the user's clipboard.
 * It's useful for allowing users to easily copy transaction hashes, addresses,
 * and other values that are difficult to select manually.
 * 
 * @example
 * await copyToClipboard("0x1234567890abcdef");
 * toast({ title: "Copied to clipboard" });
 */
export async function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Safely parses a string input as a number, handling invalid inputs.
 * 
 * @param {string} value - The string value to parse
 * @returns {number} The parsed number, or 0 if parsing fails
 * 
 * @remarks
 * This function is primarily used for handling user input in number fields.
 * It ensures that even invalid inputs (like empty strings or non-numeric text)
 * are handled gracefully by returning 0 instead of NaN.
 * 
 * @example
 * parseInputAmount("123.45") // Returns: 123.45
 * parseInputAmount("") // Returns: 0
 * parseInputAmount("abc") // Returns: 0
 */
export function parseInputAmount(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
