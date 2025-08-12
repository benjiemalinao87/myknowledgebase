import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, Settings } from 'lucide-react';
import { VisualizationData } from '../types/visualization';
import { KnowledgeItem } from '../types';
import { VectorEmbeddingChart } from './VectorEmbeddingChart';
import { SemanticClusters } from './SemanticClusters';
import { ProcessingMetrics } from './ProcessingMetrics';
import { KnowledgeGraph } from './KnowledgeGraph';
import { AIInsights } from './AIInsights';
import { getVisualizationData } from '../services/visualizationService';

interface VisualizationDashboardProps {
  knowledgeItems: KnowledgeItem[];
}

export function VisualizationDashboard({ knowledgeItems }: VisualizationDashboardProps) {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmbedding, setSelectedEmbedding] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [activeView, setActiveView] = useState<'overview' | 'embeddings' | 'graph' | 'insights'>('overview');

  useEffect(() => {
    loadVisualizationData();
  }, [knowledgeItems]);

  const loadVisualizationData = async () => {
    setLoading(true);
    try {
      const vizData = await getVisualizationData(knowledgeItems);
      setData(vizData);
    } catch (error) {
      console.error('Failed to load visualization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-2xl border border-gray-200/60 p-12 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping"></div>
              <RefreshCw className="h-10 w-10 text-blue-600 animate-spin relative z-10" />
            </div>
            <span className="ml-4 text-xl text-gray-700 font-semibold">🧠 Analyzing knowledge base...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/60 p-12 text-center shadow-sm">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Eye className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No Visualization Data</h3>
        <p className="text-gray-600 font-medium">Add some knowledge sources to see AI processing insights.</p>
      </div>
    );
  }

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'embeddings', label: 'Embeddings', icon: Settings },
    { id: 'graph', label: 'Knowledge Graph', icon: Settings },
    { id: 'insights', label: 'AI Insights', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">🧠 AI Knowledge Base Visualization</h2>
            <p className="text-base text-gray-600 mt-2 font-medium">
              Explore how the AI processes and organizes your home improvement knowledge
            </p>
          </div>
          <button
            onClick={loadVisualizationData}
            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Refresh visualization"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100/60 rounded-xl p-1.5">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeView === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <SemanticClusters
            clusters={data.clusters}
            selectedCluster={selectedCluster}
            onClusterSelect={setSelectedCluster}
          />
          <ProcessingMetrics
            metadata={data.metadata}
            selectedSource={selectedNode}
          />
        </div>
      )}

      {activeView === 'embeddings' && (
        <VectorEmbeddingChart
          embeddings={data.embeddings}
          selectedEmbedding={selectedEmbedding}
          onEmbeddingSelect={setSelectedEmbedding}
        />
      )}

      {activeView === 'graph' && (
        <KnowledgeGraph
          graph={data.knowledgeGraph}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />
      )}

      {activeView === 'insights' && (
        <AIInsights data={data} />
      )}
    </div>
  );
}