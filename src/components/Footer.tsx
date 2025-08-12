import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span>Your data is processed securely and used only to improve chatbot responses</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
          <a
            href="/privacy"
            className="flex items-center gap-1 hover:text-gray-900 transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}