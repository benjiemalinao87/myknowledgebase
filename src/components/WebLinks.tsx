import React, { useState } from 'react';
import { Plus, X, Link, AlertCircle, ExternalLink } from 'lucide-react';
import { WebLink } from '../types';
import { validateUrl, normalizeUrl, generateId } from '../utils/validation';

interface WebLinksProps {
  links: WebLink[];
  onLinksChange: (links: WebLink[]) => void;
  disabled?: boolean;
}

export function WebLinks({ links, onLinksChange, disabled }: WebLinksProps) {
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [inputError, setInputError] = useState('');

  const addLink = () => {
    if (!newLinkUrl.trim()) {
      setInputError('Please enter a URL');
      return;
    }

    const normalizedUrl = normalizeUrl(newLinkUrl);
    const validation = validateUrl(normalizedUrl);

    if (!validation.valid) {
      setInputError(validation.error!);
      return;
    }

    // Check for duplicates
    const isDuplicate = links.some(link => link.url === normalizedUrl);
    if (isDuplicate) {
      setInputError('This URL has already been added');
      return;
    }

    const newLink: WebLink = {
      id: generateId(),
      url: normalizedUrl,
      status: 'pending',
    };

    onLinksChange([...links, newLink]);
    setNewLinkUrl('');
    setInputError('');
  };

  const removeLink = (id: string) => {
    onLinksChange(links.filter(link => link.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLink();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="web-links-input" className="block text-sm font-medium text-gray-700">
          Web Links
        </label>
        <span className="text-xs text-gray-500">
          Add multiple URLs
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              id="web-links-input"
              type="url"
              value={newLinkUrl}
              onChange={(e) => {
                setNewLinkUrl(e.target.value);
                if (inputError) setInputError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com or example.com"
              disabled={disabled}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium ${
                inputError
                  ? 'border-red-300/60 bg-red-50/80'
                  : 'border-gray-300/60 hover:border-gray-400 hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-describedby={inputError ? 'link-error' : undefined}
            />
          </div>
          <button
            type="button"
            onClick={addLink}
            disabled={disabled || !newLinkUrl.trim()}
            className={`px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:scale-105 font-semibold ${
              disabled || !newLinkUrl.trim()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            aria-label="Add web link"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>

        {inputError && (
          <div id="link-error" className="flex items-center gap-3 p-3 bg-red-50/80 border border-red-200/60 rounded-xl">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm text-red-700 font-medium">{inputError}</span>
          </div>
        )}
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Added Links ({links.length})
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
            {links.map((link) => (
              <div
                key={link.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  link.status === 'error'
                    ? 'border-red-200/60 bg-red-50/80'
                    : 'border-gray-200/60 bg-white hover:border-gray-300/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-purple-100">
                    <Link className="h-4 w-4 text-purple-600 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 truncate font-semibold">
                        {link.url}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                        aria-label={`Open ${link.url} in new tab`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {link.error && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{link.error}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Remove ${link.url}`}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}