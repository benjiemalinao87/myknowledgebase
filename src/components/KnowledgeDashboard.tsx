import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Database, Filter, SortAsc } from 'lucide-react';
import { KnowledgeItem, KnowledgeStats } from '../types';
import { KnowledgeStats as StatsComponent } from './KnowledgeStats';
import { KnowledgeSearch } from './KnowledgeSearch';
import { KnowledgeItem as ItemComponent } from './KnowledgeItem';
import { getKnowledgeItems, getKnowledgeStats, deleteKnowledgeItem, searchKnowledgeItems } from '../services/knowledgeService';

interface KnowledgeDashboardProps {
  onAddSources: () => void;
}

export function KnowledgeDashboard({ onAddSources }: KnowledgeDashboardProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'file' | 'link' | 'context'>('all');

  const loadData = async () => {
    try {
      const [itemsData, statsData] = await Promise.all([
        getKnowledgeItems(),
        getKnowledgeStats()
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load knowledge data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      const results = await searchKnowledgeItems(query);
      setItems(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteKnowledgeItem(id);
      if (success) {
        setItems(prev => prev.filter(item => item.id !== id));
        // Refresh stats
        const newStats = await getKnowledgeStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredAndSortedItems = items
    .filter(item => filterBy === 'all' || item.type === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return b.addedAt.getTime() - a.addedAt.getTime();
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsComponent stats={{ totalItems: 0, files: 0, links: 0, contexts: 0, totalSize: 0 }} loading={true} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && <StatsComponent stats={stats} />}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Knowledge Base</h2>
            <p className="text-sm text-gray-600 font-medium">Manage and explore your sources</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border-0 bg-transparent focus:ring-0 font-medium text-gray-700 cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
              <SortAsc className="h-4 w-4 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="text-sm border-0 bg-transparent focus:ring-0 font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="file">Files Only</option>
                <option value="link">Links Only</option>
                <option value="context">Context Only</option>
              </select>
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Refresh knowledge base"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onAddSources}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Sources</span>
            </button>
          </div>
        </div>
      </div>

      <KnowledgeSearch onSearch={handleSearch} loading={searchLoading} />

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Database className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No Knowledge Sources Found</h3>
          <p className="text-gray-600 mb-8 font-medium max-w-md mx-auto leading-relaxed">
            Start by adding files, web links, or context to build your knowledge base.
          </p>
          <button
            onClick={onAddSources}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <Plus className="h-4 w-4" />
            🎯 Add Your First Sources
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">
              Showing {filteredAndSortedItems.length} of {items.length} items
            </p>
          </div>
          
          {filteredAndSortedItems.map((item) => (
            <ItemComponent
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}