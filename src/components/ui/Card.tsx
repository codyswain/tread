import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={`bg-card text-card-foreground rounded-lg shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};