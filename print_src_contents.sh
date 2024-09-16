#!/bin/bash

output_file="src_contents.txt"

# Print the tree structure of src folder
echo "Tree structure of src folder:" > "$output_file"
tree src >> "$output_file"

echo -e "\n\nFile contents:" >> "$output_file"

# Find all files in src, print their paths and contents
find src -type f | while read -r file; do
    echo -e "\n--- $file ---\n" >> "$output_file"
    cat "$file" >> "$output_file"
done

echo "Output saved to $output_file"