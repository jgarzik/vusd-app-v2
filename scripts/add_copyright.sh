#!/bin/bash

# Script to add copyright header to all TypeScript and TypeScript React files
# Copyright 2025 Hemi Labs. All rights reserved.

COPYRIGHT_HEADER="/**\n * Copyright 2025 Hemi Labs. All rights reserved.\n */\n\n"
FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v "node_modules")

for file in $FILES; do
  echo "Adding copyright header to $file"
  
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

echo "Copyright headers have been added to all TypeScript files."