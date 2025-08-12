import React from 'react';
import { Home, MessageCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-600 transform hover:scale-105 transition-transform duration-200">
            <Home className="h-6 w-6" aria-hidden="true" />
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Home Improvement Assistant
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Add sources for the home-improvement chatbot to provide personalized advice
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}