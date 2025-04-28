import { useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Your Web3Modal Project ID from WalletConnect Cloud dashboard
const projectId = 'YOUR_PROJECT_ID';

const queryClient = new QueryClient();

// Set up the wagmi config with Ethereum mainnet
const metadata = {
  name: 'VUSD Application',
  description: 'Swap to or from the VUSD stablecoin',
  url: 'https://vusd.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

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

// Create web3modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false, // Optional analytics
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
    '--w3m-border-radius-master': '0.5rem',
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
