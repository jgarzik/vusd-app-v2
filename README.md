# VUSD Hub

VUSD Hub is a sophisticated web3 application for stablecoin swapping and treasury analytics, designed to simplify blockchain interactions through intelligent design and user-friendly interfaces.

## Features

### Stablecoin Swapping
- Zero slippage swapping between VUSD and other stablecoins (USDC, USDT, DAI)
- Fully collateralized system with direct redemption
- Transparent fee structure: 0.01% for swapping to VUSD, 0.1% for swapping from VUSD
- Seamless wallet integration via MetaMask and WalletConnect

### Treasury Analytics
- Real-time treasury composition visualization
- Detailed breakdown of T1 and T2 assets
- Comprehensive collateralization ratio monitoring
- Historical treasury performance metrics

### Web3 Integration
- Support for Ethereum mainnet
- Wallet connectivity with automatic network detection
- Token approval workflow with clear user interface
- Transaction status monitoring

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3 Integration**: wagmi, ethers.js
- **State Management**: Zustand
- **Routing**: wouter
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

The project follows a feature-based organization:

```
client/
├── public/              # Static assets
├── src/
│   ├── abis/            # Contract ABIs
│   ├── components/      # UI Components
│   │   ├── analytics/   # Treasury analytics components
│   │   ├── layout/      # Layout components (header, footer)
│   │   ├── swap/        # Swap interface components
│   │   ├── ui/          # Shadcn UI components
│   │   └── web3/        # Wallet connection components
│   ├── constants/       # Application constants
│   ├── hooks/           # Custom React hooks
│   │   ├── useSwap.ts         # Swap functionality
│   │   ├── useTreasury.ts     # Treasury data fetching
│   │   ├── useWeb3.ts         # Wallet connection
│   │   └── useEthersContracts.ts  # Contract interactions
│   ├── lib/             # Utility functions
│   ├── pages/           # Application pages
│   └── store/           # Global state management
server/
└── ...                  # Backend services
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- NPM or Yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hemilabs/vusd-stablecoin.git
cd vusd-stablecoin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. The application will be available at `http://localhost:5000`

## Environment Variables

The application requires the following environment variables:

- `WALLETCONNECT_PROJECT_ID`: Your WalletConnect Project ID

## Contracts

VUSD relies on three main smart contracts:

1. **VUSD Token**: The ERC-20 token contract for VUSD
2. **Minter**: Handles the minting of VUSD in exchange for stablecoins (USDC, USDT, DAI)
3. **Redeemer**: Handles the redeeming of VUSD for stablecoins

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed by Hemi Labs
- Built with [Shadcn UI](https://ui.shadcn.com/)
- Powered by [wagmi](https://wagmi.sh/) and [ethers.js](https://docs.ethers.org/)