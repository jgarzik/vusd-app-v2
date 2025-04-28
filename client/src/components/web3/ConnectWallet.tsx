import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWeb3 } from '@/hooks/useWeb3';
import { shortenAddress } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, ChevronDown, LogOut, ExternalLink, Wallet, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConnectWallet = () => {
  const { toast } = useToast();
  const { isConnected, address, connect, disconnect, connectors } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const handleConnect = async (connectorId: string) => {
    try {
      await connect(connectorId);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: (error as Error).message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };
  
  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnect Failed',
        description: (error as Error).message || 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleViewOnEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-accent hover:bg-accent-dark text-white font-medium py-2 pl-4 pr-2 rounded-lg flex items-center transition-colors">
            <Wallet className="h-4 w-4 mr-2" />
            {shortenAddress(address)}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewOnEtherscan}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button 
        className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
        onClick={() => setIsWalletModalOpen(true)}
      >
        <Wallet className="h-5 w-5 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet provider to connect to the app
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="justify-start border-gray-700 hover:bg-gray-800"
                onClick={() => handleConnect(connector.id)}
              >
                {/* Wallet-specific icons */}
                {connector.id === 'injected' || connector.name === 'MetaMask' ? (
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32.9583 1L19.8242 10.7183L22.2283 5.09497L32.9583 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.70764 1L15.7458 10.809L13.4376 5.09497L2.70764 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M28.2021 23.6562L24.7496 28.9908L32.2685 31.0148L34.4333 23.7467L28.2021 23.6562Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.23291 23.7467L3.38773 31.0148L10.8972 28.9908L7.45409 23.6562L1.23291 23.7467Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.5013 14.6691L8.44328 17.7629L15.8812 18.1105L15.6277 10.1097L10.5013 14.6691Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M25.1562 14.6691L19.9439 10.0192L19.7812 18.1105L27.2192 17.7629L25.1562 14.6691Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.8972 28.9908L15.4477 26.8302L11.504 23.7918L10.8972 28.9908Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.2148 26.8302L24.7496 28.9908L24.1535 23.7918L20.2148 26.8302Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : connector.id === 'walletConnect' || connector.name === 'WalletConnect' ? (
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M169.209 184.069C224.163 130.238 312.683 130.238 367.636 184.069L375.981 192.227C378.308 194.501 378.308 198.232 375.981 200.506L345.187 230.544C343.972 231.734 341.986 231.734 340.771 230.544L329.211 219.223C292.268 183.076 244.526 183.076 207.583 219.223L195.222 231.361C194.006 232.551 192.021 232.551 190.805 231.361L160.011 201.324C157.685 199.05 157.685 195.318 160.011 193.044L169.209 184.069Z" fill="#3396FF"/>
                    <path d="M400.334 216.088L427.987 243.241C430.314 245.515 430.314 249.247 427.987 251.521L315.505 362.057C313.074 364.436 309.119 364.436 306.688 362.057L229.582 286.461C229.027 285.919 228.086 285.919 227.531 286.461L150.478 362.057C148.046 364.436 144.091 364.436 141.66 362.057L29.1252 251.521C26.7988 249.247 26.7988 245.515 29.1252 243.241L56.7783 216.088C59.1046 213.814 63.0596 213.814 65.3859 216.088L142.491 291.737C143.046 292.279 143.987 292.279 144.542 291.737L221.596 216.088C224.028 213.709 227.983 213.709 230.414 216.088L307.52 291.737C308.075 292.279 309.015 292.279 309.57 291.737L386.673 216.088C389.052 213.814 393.007 213.814 395.333 216.088H400.334Z" fill="#3396FF"/>
                  </svg>
                ) : (
                  <QrCode className="h-5 w-5 mr-2" />
                )}
                {connector.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectWallet;
