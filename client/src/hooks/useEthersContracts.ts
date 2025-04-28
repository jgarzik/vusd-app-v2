import { useMemo } from 'react';
import { Contract, ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { useToast } from './use-toast';
import { 
  MINTER_ABI, 
  REDEEMER_ABI, 
  TREASURY_ABI, 
  VUSD_ABI, 
  ERC20_ABI 
} from '@/abis';
import { 
  MINTER_ADDRESS, 
  REDEEMER_ADDRESS, 
  TREASURY_ADDRESS, 
  VUSD_ADDRESS 
} from '@/constants/contracts';

// Get checksummed address
const getChecksumAddress = (address: string) => {
  try {
    return ethers.getAddress(address);
  } catch (error) {
    console.error(`Invalid address: ${address}`);
    return address;
  }
};

export const useEthersContracts = () => {
  const { toast } = useToast();
  const { isConnected } = useWeb3();
  
  // Get Ethereum provider
  const getProvider = useMemo(() => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to a public RPC provider
    return new ethers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io');
  }, []);
  
  // Get contract instances
  const contracts = useMemo(() => {
    try {
      // Read-only contracts
      const vusdReadOnly = new Contract(getChecksumAddress(VUSD_ADDRESS), VUSD_ABI, getProvider);
      const minterReadOnly = new Contract(getChecksumAddress(MINTER_ADDRESS), MINTER_ABI, getProvider);
      const redeemerReadOnly = new Contract(getChecksumAddress(REDEEMER_ADDRESS), REDEEMER_ABI, getProvider);
      const treasuryReadOnly = new Contract(getChecksumAddress(TREASURY_ADDRESS), TREASURY_ABI, getProvider);
      
      return {
        vusd: vusdReadOnly,
        minter: minterReadOnly,
        redeemer: redeemerReadOnly,
        treasury: treasuryReadOnly,
        getERC20Contract: (address: string) => new Contract(getChecksumAddress(address), ERC20_ABI, getProvider),
      };
    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast({
        title: 'Contract Initialization Error',
        description: 'Failed to initialize smart contracts',
        variant: 'destructive',
      });
      
      return {
        vusd: null,
        minter: null,
        redeemer: null,
        treasury: null,
        getERC20Contract: () => null,
      };
    }
  }, [getProvider, toast]);
  
  // Get signer and connected contracts
  const getConnectedContracts = async () => {
    if (!isConnected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      return {
        vusd: new Contract(getChecksumAddress(VUSD_ADDRESS), VUSD_ABI, signer),
        minter: new Contract(getChecksumAddress(MINTER_ADDRESS), MINTER_ABI, signer),
        redeemer: new Contract(getChecksumAddress(REDEEMER_ADDRESS), REDEEMER_ABI, signer),
        treasury: new Contract(getChecksumAddress(TREASURY_ADDRESS), TREASURY_ABI, signer),
        getERC20Contract: (address: string) => new Contract(getChecksumAddress(address), ERC20_ABI, signer),
      };
    } catch (error) {
      console.error('Error getting connected contracts:', error);
      throw new Error('Failed to get connected contracts');
    }
  };
  
  return {
    contracts,
    getConnectedContracts,
  };
};
