import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface KnowledgeSearchProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function KnowledgeSearch({ onSearch, loading }: KnowledgeSearchProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search your knowledge base..."
          disabled={loading}
          className="w-full pl-12 pr-12 py-4 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 hover:shadow-md disabled:opacity-50 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium"
          aria-label="Search knowledge base"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}