import React from 'react';
import { VectorEmbedding } from '../types/visualization';

interface VectorEmbeddingChartProps {
  embeddings: VectorEmbedding[];
  selectedEmbedding?: string;
  onEmbeddingSelect: (id: string) => void;
}

export function VectorEmbeddingChart({ embeddings, selectedEmbedding, onEmbeddingSelect }: VectorEmbeddingChartProps) {
  // Use PCA-like projection to 2D for visualization
  const projectedPoints = embeddings.map((embedding, index) => {
    // Simulate 2D projection of high-dimensional vectors
    const angle = (index / embeddings.length) * 2 * Math.PI;
    const radius = 50 + Math.random() * 100;
    const x = 200 + radius * Math.cos(angle) + (Math.random() - 0.5) * 40;
    const y = 200 + radius * Math.sin(angle) + (Math.random() - 0.5) * 40;
    
    return { ...embedding, x, y };
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">🎯 Vector Embeddings (2D Projection)</h3>
        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
          {embeddings.length} vectors • {embeddings[0]?.dimensions || 384} dimensions
        </div>
      </div>
      
      <div className="relative">
        <svg width="500" height="400" className="border border-gray-200/60 rounded-xl shadow-inner bg-gradient-to-br from-gray-50 to-white">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="500" height="400" fill="url(#grid)" />
          
          {/* Embedding points */}
          {projectedPoints.map((point) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={selectedEmbedding === point.id ? 10 : 6}
                fill={selectedEmbedding === point.id ? '#3B82F6' : '#93C5FD'}
                stroke={selectedEmbedding === point.id ? '#1D4ED8' : '#60A5FA'}
                strokeWidth={selectedEmbedding === point.id ? 3 : 2}
                className="cursor-pointer transition-all duration-300 hover:r-8 hover:fill-blue-500"
                filter={selectedEmbedding === point.id ? "url(#glow)" : "none"}
                onClick={() => onEmbeddingSelect(point.id)}
              />
              {selectedEmbedding === point.id && (
                <text
                  x={point.x}
                  y={point.y - 16}
                  textAnchor="middle"
                  className="text-xs fill-gray-800 font-semibold"
                >
                  {point.sourceId.slice(0, 8)}...
                </text>
              )}
            </g>
          ))}
        </svg>
        
        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700 font-medium">
            <p>🎯 Each point = vector embedding</p>
            <p>📏 Distance = semantic similarity</p>
            <p>👆 Click points for details</p>
          </div>
        </div>
      </div>
    </div>
  );
}