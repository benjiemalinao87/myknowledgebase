import React from 'react';
import { ProcessingMetadata } from '../types/visualization';
import { Clock, Hash, Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface ProcessingMetricsProps {
  metadata: ProcessingMetadata[];
  selectedSource?: string;
}

export function ProcessingMetrics({ metadata, selectedSource }: ProcessingMetricsProps) {
  const selectedMetadata = selectedSource 
    ? metadata.find(m => m.sourceId === selectedSource)
    : null;

  const avgMetrics = {
    chunkSize: Math.round(metadata.reduce((sum, m) => sum + m.chunkSize, 0) / metadata.length),
    tokenCount: Math.round(metadata.reduce((sum, m) => sum + m.tokenCount, 0) / metadata.length),
    processingTime: Math.round(metadata.reduce((sum, m) => sum + m.processingTime, 0) / metadata.length),
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Metrics</h3>
      
      {selectedMetadata ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Selected Source Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Chunks: {selectedMetadata.chunkSize}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Tokens: {selectedMetadata.tokenCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Processed: {selectedMetadata.processingTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Overlap: {selectedMetadata.overlap}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(selectedMetadata.sentiment)}`}>
                  {selectedMetadata.sentiment} sentiment
                </span>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(selectedMetadata.complexity)}`}>
                  {selectedMetadata.complexity} complexity
                </span>
              </div>
            </div>

            {selectedMetadata.extractedEntities.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Extracted Entities</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedMetadata.extractedEntities.map((entity, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedMetadata.keywords.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Keywords</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedMetadata.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{avgMetrics.chunkSize}</div>
              <div className="text-sm text-gray-600">Avg Chunk Size</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{avgMetrics.tokenCount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Tokens</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{avgMetrics.processingTime}ms</div>
              <div className="text-sm text-gray-600">Avg Processing</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Click on any knowledge item to see detailed processing metrics
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}