import React from 'react';
import { Input } from './input';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="w-8 h-8 rounded-full border"
        style={{ backgroundColor: value }}
      />
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10"
      />
    </div>
  );
} 