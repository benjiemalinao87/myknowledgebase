import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ContextTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 2000;

export function ContextTextarea({ value, onChange, disabled }: ContextTextareaProps) {
  const charCount = value.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="context-textarea" className="block text-sm font-medium text-gray-700">
          Additional Context
        </label>
        <span className="text-xs text-gray-500">Optional</span>
      </div>

      <div className="relative">
        <div className="absolute top-4 left-4 pointer-events-none">
          <MessageSquare className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <textarea
          id="context-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your project details, room dimensions, budget, style preferences, or specific questions..."
          disabled={disabled}
          maxLength={MAX_CHARS}
          rows={5}
          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none font-medium bg-white/80 backdrop-blur-sm ${
            isOverLimit
              ? 'border-red-300/60 bg-red-50/80'
              : 'border-gray-300/60 hover:border-gray-400 hover:shadow-md'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-describedby="context-char-count"
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-600 font-medium">
          💡 Examples: "15x12 kitchen, $10k budget, modern farmhouse style"
        </p>
        <div
          id="context-char-count"
          className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${
            isOverLimit
              ? 'text-red-600 bg-red-100'
              : isNearLimit
              ? 'text-orange-600 bg-orange-100'
              : 'text-gray-600 bg-gray-100'
          }`}
          aria-live="polite"
        >
          {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
        </div>
      </div>
    </div>
  );
}