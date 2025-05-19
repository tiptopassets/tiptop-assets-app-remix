
import React from 'react';
import { X } from 'lucide-react';

interface ClearSearchButtonProps {
  onClear: () => void;
}

const ClearSearchButton = ({ onClear }: ClearSearchButtonProps) => {
  return (
    <button
      onClick={onClear}
      className="flex items-center justify-center h-10 w-10 rounded-full text-white/70 hover:text-white transition-colors"
      title="Clear search"
      type="button"
    >
      <X className="h-5 w-5" />
    </button>
  );
};

export default ClearSearchButton;
