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
