import React, { useState } from 'react';
import { FileText, Link, MessageSquare, Trash2, ExternalLink, Calendar, Tag, Edit, Copy, Check } from 'lucide-react';
import { KnowledgeItem as KnowledgeItemType } from '../types';
import { formatFileSize } from '../utils/validation';

interface KnowledgeItemProps {
  item: KnowledgeItemType;
  onDelete: (id: string) => void;
  onEdit: (item: KnowledgeItemType) => void;
}

export function KnowledgeItem({ item, onDelete, onEdit }: KnowledgeItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(item.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'file':
        return FileText;
      case 'link':
        return Link;
      case 'context':
        return MessageSquare;
      default:
        return FileText;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const Icon = getIcon();

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
            <Icon className="h-4 w-4 text-gray-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {item.title}
              </h3>
              <span 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-mono cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleCopyId}
                title={`Click to copy ID: ${item.id}`}
              >
                {item.id.slice(0, 8)}...
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor()} shadow-sm`}>
                {item.status}
              </span>
            </div>

            {item.url && (
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 truncate flex items-center gap-1 transition-all duration-200 hover:underline"
                >
                  {item.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
                </a>
              </div>
            )}

            {item.content && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {item.content}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {item.addedAt.toLocaleDateString()}
              </div>
              {item.size && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  {formatFileSize(item.size)}
                </div>
              )}
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Tag className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors duration-200 cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <div className="relative">
            <button
              onClick={handleCopyId}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={`Copy ID for ${item.title}`}
              title={`Copy ID: ${item.id}`}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            {copied && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                ID Copied!
              </div>
            )}
          </div>
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Edit ${item.title}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}