import React from "react";

const RelatedNotes: React.FC = () => {
  // Placeholder
  const placeholderNotes = [
    "Related Note 1",
    "Related Note 2",
    "Related Note 3",
  ];

  return (
    <div className="w-64 bg-background border-l border-border p-4">
      <h3 className="text-lg font-semibold mb-4">Related Notes</h3>
      <ul className="space-y-2">
        {placeholderNotes.map((note, index) => (
          <li
            key={index}
            className="p-2 bg-card text-card-foreground border border-border rounded"
          >
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedNotes;
