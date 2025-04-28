import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const formattedConnectors = useMemo(() => {
    return connectors.map((connector) => ({
      id: connector.id,
      name: connector.id === 'injected' ? 'MetaMask' : 'WalletConnect',
    }));
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
