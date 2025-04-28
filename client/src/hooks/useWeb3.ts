/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * useWeb3.ts - Web3 wallet connectivity hook
 * 
 * This hook provides a unified interface for wallet connections in the VUSD application.
 * It wraps wagmi's hooks to provide:
 * - Seamless connection to Ethereum via multiple wallet types
 * - User-friendly wallet connector names and icons for the UI
 * - Helper methods for connection/disconnection
 * - Consistent connection state management
 * 
 * The hook handles MetaMask (injected provider), WalletConnect, and other supported
 * wallet types, displaying appropriate UI for each connection option.
 */

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

/**
 * Custom hook providing wallet connectivity and state for the application.
 * 
 * @returns {Object} Wallet state and functions
 * @property {string|undefined} address - Current connected wallet address, undefined if not connected
 * @property {boolean} isConnected - Whether a wallet is currently connected
 * @property {boolean} isConnecting - Whether a connection is in progress
 * @property {Function} connect - Function to connect to a specific wallet type
 * @property {Function} disconnect - Function to disconnect the current wallet
 * @property {Array} connectors - Available wallet connection options with formatted names
 * 
 * @remarks
 * This hook abstracts away the underlying Web3 connection library (wagmi) to provide:
 * - Simple connection methods for multiple wallet types
 * - Consistent connection state management
 * - User-friendly wallet connector labels
 * 
 * @example
 * const { address, isConnected, connect, disconnect } = useWeb3();
 * 
 * // Connect to MetaMask
 * connect('injected');
 * 
 * // Disconnect current wallet
 * disconnect();
 */
export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  /**
   * Creates user-friendly wallet connector options.
   * 
   * @returns {Array} Formatted connector objects with standardized names and IDs
   * 
   * @remarks
   * This memoized function transforms the raw wallet connectors from wagmi into 
   * a more user-friendly format with consistent naming. It specifically:
   * - Renames 'injected' to 'MetaMask' for better user recognition
   * - Ensures WalletConnect has proper capitalization
   * - Preserves the original connector ID for internal connection logic
   */
  const formattedConnectors = useMemo(() => {
    return connectors.map((connector) => {
      // Properly identify each connector type
      let name = connector.name;
      
      // Override generic names with more user-friendly ones
      if (connector.id === 'injected') {
        name = 'MetaMask';
      } else if (connector.id === 'walletConnect') {
        name = 'WalletConnect';
      }

      return {
        id: connector.id,
        name,
        type: connector.type,
      };
    });
  }, [connectors]);
  
  /**
   * Return the wallet connection state and functions.
   * 
   * @returns {Object} Complete Web3 wallet interface
   */
  return {
    // User's wallet address (undefined if not connected)
    address,
    
    // Connection state flags
    isConnected,
    isConnecting: isPending,
    
    /**
     * Connect to a specific wallet type by connector ID.
     * 
     * @param {string} connectorId - The ID of the connector to use (e.g., 'injected', 'walletConnect')
     * @returns {Promise} Connection promise from the underlying connector
     * @throws {Error} If the connector ID is not found
     */
    connect: (connectorId: string) => {
      const connector = connectors.find(c => c.id === connectorId);
      if (connector) {
        return connect({ connector });
      }
      throw new Error(`Connector ${connectorId} not found`);
    },
    
    // Function to disconnect the current wallet
    disconnect,
    
    // Available wallet connection options
    connectors: formattedConnectors,
  };
};
