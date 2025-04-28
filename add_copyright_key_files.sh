#!/bin/bash

# Script to add copyright header to key TypeScript files
# Copyright 2025 Hemi Labs. All rights reserved.

COPYRIGHT_HEADER="/**\n * Copyright 2025 Hemi Labs. All rights reserved.\n */\n\n"

# List of key files to add copyright headers to
KEY_FILES=(
  "./client/src/pages/Analytics.tsx"
  "./client/src/pages/Swap.tsx"
  "./client/src/pages/UseVUSD.tsx"
  "./client/src/pages/not-found.tsx"
  "./client/src/hooks/useTreasury.ts"
  "./client/src/hooks/useSwap.ts"
  "./client/src/hooks/useWeb3.ts"
  "./client/src/hooks/useEthersContracts.ts"
  "./client/src/components/swap/SwapInterface.tsx"
  "./client/src/components/swap/TokenSelector.tsx"
  "./client/src/components/swap/TransactionStatus.tsx"
  "./client/src/components/analytics/TreasuryCard.tsx"
  "./client/src/components/web3/ConnectWallet.tsx"
  "./client/src/components/web3/Web3Provider.tsx"
  "./client/src/constants/contracts.ts"
  "./client/src/constants/tokens.ts"
  "./client/src/constants/treasuryAssets.ts"
  "./client/src/lib/utils.ts"
  "./client/src/lib/queryClient.ts"
  "./client/src/main.tsx"
)

for file in "${KEY_FILES[@]}"; do
  echo "Adding copyright header to $file"
  
  # Check if the file exists
  if [ ! -f "$file" ]; then
    echo "  File $file does not exist, skipping"
    continue
  fi
  
  # Check if the file already has a copyright header
  if grep -q "Copyright 2025 Hemi Labs" "$file"; then
    echo "  Header already exists in $file, skipping"
    continue
  fi
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Add copyright header and the original content
  echo -e "$COPYRIGHT_HEADER$(cat "$file")" > "$temp_file"
  
  # Replace the original file with the temporary one
  mv "$temp_file" "$file"
  
  echo "  Header added to $file"
done

echo "Copyright headers have been added to key TypeScript files."