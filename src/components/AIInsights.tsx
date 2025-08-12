import React from 'react';
import { VisualizationData } from '../types/visualization';
import { Brain, Zap, Target, TrendingUp, Database, Cpu } from 'lucide-react';

interface AIInsightsProps {
  data: VisualizationData;
}

export function AIInsights({ data }: AIInsightsProps) {
  const insights = [
    {
      icon: Database,
      title: 'Knowledge Coverage',
      value: `${data.stats.totalVectors} vectors`,
      description: 'Total semantic representations in the knowledge base',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      title: 'Semantic Similarity',
      value: `${(data.stats.avgSimilarity * 100).toFixed(1)}%`,
      description: 'Average similarity between related content pieces',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Brain,
      title: 'Topic Clusters',
      value: data.stats.clusterCount.toString(),
      description: 'Distinct knowledge domains identified',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Zap,
      title: 'Processing Efficiency',
      value: `${(data.stats.processingEfficiency * 100).toFixed(1)}%`,
      description: 'AI processing optimization score',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const topEntities = data.metadata
    .flatMap(m => m.extractedEntities)
    .reduce((acc, entity) => {
      acc[entity] = (acc[entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedEntities = Object.entries(topEntities)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Cpu className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">🤖 AI Processing Insights</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className={`p-6 rounded-xl ${insight.bgColor} border border-white/60 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center gap-2 mb-2">
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
                <span className="text-sm font-semibold text-gray-900">{insight.title}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{insight.value}</div>
              <div className="text-xs text-gray-700 font-medium leading-relaxed">{insight.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
        <h4 className="font-bold text-gray-900 mb-6 text-lg tracking-tight">📊 Most Frequent Entities</h4>
        <div className="space-y-3">
          {sortedEntities.map(([entity, count], index) => (
            <div key={entity} className="flex items-center justify-between p-3 bg-gray-50/60 rounded-xl hover:bg-gray-100/60 transition-colors duration-200">
              <span className="text-sm text-gray-800 capitalize font-semibold">{entity}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${(count / Math.max(...Object.values(topEntities))) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-700 w-8 text-right font-bold bg-white px-2 py-1 rounded-lg shadow-sm">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/60 p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <h4 className="font-bold text-gray-900 text-lg tracking-tight">💡 AI Recommendations</h4>
        </div>
        <div className="space-y-3 text-sm text-gray-800 font-medium">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Your knowledge base has strong coverage in kitchen and bathroom topics
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Consider adding more electrical safety documentation for better coverage
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            High semantic similarity indicates well-organized content structure
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Processing efficiency is optimal for current knowledge base size
          </p>
        </div>
      </div>
    </div>
  );
}