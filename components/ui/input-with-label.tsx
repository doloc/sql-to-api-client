"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode; // Add icon prop
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, id, error, className, icon, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </span>
        )}
        <Input
          id={inputId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
});

InputWithLabel.displayName = "InputWithLabel";

export { InputWithLabel };