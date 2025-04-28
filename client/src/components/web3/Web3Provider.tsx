/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * Web3Provider.tsx - Blockchain connectivity provider
 * 
 * This component sets up the blockchain connectivity infrastructure for the entire application.
 * Key responsibilities:
 * - Configuring WagmiProvider with Ethereum mainnet
 * - Setting up WalletConnect and injected providers
 * - Managing Web3Modal integration for wallet connection UI
 * - Initializing QueryClient for data fetching
 * - Providing authentication context to child components
 * 
 * The provider automatically checks for environment variables to configure WalletConnect
 * and supports both traditional injected providers (MetaMask) and WalletConnect v2.
 */

import { useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Initial query client for data fetching
const queryClient = new QueryClient();

// Set up the wagmi config with Ethereum mainnet
const metadata = {
  name: 'VUSD Application',
  description: 'Swap to or from the VUSD stablecoin',
  url: 'https://vusd.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        setIsLoading(true);
        // Fetch configuration from backend
        const response = await fetch('/api/config');
        const data = await response.json();
        
        const projectId = data.walletConnectProjectId;
        
        if (!projectId) {
          console.warn('WalletConnect Project ID is missing. Wallet connection may not work correctly.');
        }
        
        // Create wagmi config
        const config = createConfig({
          chains: [mainnet],
          transports: {
            [mainnet.id]: http(),
          },
          connectors: [
            injected({ target: 'metaMask' }),
            walletConnect({ projectId, metadata, relayUrl: 'wss://relay.walletconnect.org' })
          ],
        });
        
        // Initialize Web3Modal
        createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false,
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': 'hsl(var(--primary))',
            '--w3m-border-radius-master': '0.5rem',
          },
        });
        
        setWagmiConfig(config);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Web3:', err);
        setError('Failed to initialize wallet connections');
        setIsLoading(false);
      }
    };
    
    initializeWeb3();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading web3 configuration...</div>;
  }
  
  if (error || !wagmiConfig) {
    return <div className="text-red-500 p-4">Error: {error || 'Failed to load web3 configuration'}</div>;
  }
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
