#!/bin/bash

# Output file
output_file="note_editor_relevant_files.md"

# Create or clear the output file
echo "# Note Editor Relevant Files" > "$output_file"

# Generate tree structure of src folder
echo -e "\n## Project Structure\n" >> "$output_file"
echo '```' >> "$output_file"
tree src -L 3 >> "$output_file"
echo '```' >> "$output_file"

# Function to append file content to the output
append_file_content() {
    local file=$1
    echo -e "\n### $file\n" >> "$output_file"
    echo '```'${file##*.} >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
}

# List of relevant files
relevant_files=(
    "src/features/notes/components/NoteEditor.tsx"
    "src/features/notes/components/Notes.tsx"
    "src/features/notes/hooks/useNotes.ts"
    "src/features/notes/context/notesContext.tsx"
    "src/main/fileSystem.ts"
    "src/main/embeddings.ts"
    "src/shared/types/index.ts"
    "src/preload.ts"
)

# Append content of relevant files
for file in "${relevant_files[@]}"; do
    if [ -f "$file" ]; then
        append_file_content "$file"
    else
        echo "File not found: $file" >> "$output_file"
    fi
done

echo "Output saved to $output_file"