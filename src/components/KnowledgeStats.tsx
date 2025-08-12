import React from 'react';
import { FileText, Link, MessageSquare, Database } from 'lucide-react';
import { KnowledgeStats as KnowledgeStatsType } from '../types';
import { formatFileSize } from '../utils/validation';

interface KnowledgeStatsProps {
  stats: KnowledgeStatsType;
  loading?: boolean;
}

export function KnowledgeStats({ stats, loading }: KnowledgeStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Database,
      label: 'Total Items',
      value: stats.totalItems.toLocaleString(),
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      label: 'Files',
      value: stats.files.toLocaleString(),
      color: 'text-green-600'
    },
    {
      icon: Link,
      label: 'Web Links',
      value: stats.links.toLocaleString(),
      color: 'text-purple-600'
    },
    {
      icon: MessageSquare,
      label: 'Context Items',
      value: stats.contexts.toLocaleString(),
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${item.color.replace('text-', 'bg-').replace('-600', '-100')} group-hover:scale-110 transition-transform duration-200`}>
              <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{item.value}</p>
              <p className="text-sm text-gray-600 font-medium">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
      
      {stats.totalSize > 0 && (
        <div className="col-span-2 lg:col-span-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total Storage Used</span>
            <span className="text-sm text-gray-900 font-mono bg-white px-3 py-1 rounded-lg shadow-sm">{formatFileSize(stats.totalSize)}</span>
          </div>
        </div>
      )}
    </div>
  );
}