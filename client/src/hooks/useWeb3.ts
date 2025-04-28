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

export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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
  
  return {
    address,
    isConnected,
    isConnecting: isPending,
    connect: (connectorId: string) => {
      const connector = connectors.find(c => c.id === connectorId);
      if (connector) {
        return connect({ connector });
      }
      throw new Error(`Connector ${connectorId} not found`);
    },
    disconnect,
    connectors: formattedConnectors,
  };
};
