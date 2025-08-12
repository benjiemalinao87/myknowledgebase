import React from 'react';
import { SemanticCluster } from '../types/visualization';
import { Tag, Users } from 'lucide-react';

interface SemanticClustersProps {
  clusters: SemanticCluster[];
  selectedCluster?: string;
  onClusterSelect: (id: string) => void;
}

export function SemanticClusters({ clusters, selectedCluster, onClusterSelect }: SemanticClustersProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">🎨 Semantic Clusters</h3>
        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
          {clusters.length} clusters identified
        </div>
      </div>
      
      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            onClick={() => onClusterSelect(cluster.id)}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selectedCluster === cluster.id
                ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                : 'border-gray-200/60 hover:border-gray-300/60 hover:bg-gray-50/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: cluster.color }}
                />
                <h4 className="font-semibold text-gray-900">{cluster.name}</h4>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-2 py-1 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{cluster.items.length}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-700 font-semibold">
                  Confidence: {(cluster.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-28 bg-gray-200 rounded-full h-2.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${cluster.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/40">
        <p className="text-sm text-gray-700 font-medium leading-relaxed">
          🤖 Clusters are automatically generated using semantic similarity analysis. 
          Higher confidence indicates stronger topical coherence.
        </p>
      </div>
    </div>
  );
}