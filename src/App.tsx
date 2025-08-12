import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainLayout } from './components/MainLayout';
import { PageHeader } from './components/PageHeader';
import { StatusBar } from './components/StatusBar';
import { KnowledgeDashboard } from './components/KnowledgeDashboard';
import { VisualizationDashboard } from './components/VisualizationDashboard';
import { AddSourcesView } from './components/AddSourcesView';
import { Footer } from './components/Footer';
import { NavigationGuide } from './components/NavigationGuide';
import { getKnowledgeItems } from './services/knowledgeService';
import { KnowledgeItem } from './types';
import { Database, Plus, Brain } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-sources' | 'visualization'>('dashboard');
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadKnowledgeItems();
  }, []);

  const loadKnowledgeItems = async () => {
    try {
      const items = await getKnowledgeItems();
      setKnowledgeItems(items);
    } catch (error) {
      console.error('Failed to load knowledge items:', error);
    }
  };

  const handleSourcesAdded = () => {
    setCurrentView('dashboard');
    loadKnowledgeItems();
  };

  const viewConfig = {
    dashboard: {
      title: 'Knowledge Base',
      subtitle: 'Manage and explore your home improvement knowledge sources',
      icon: Database
    },
    'add-sources': {
      title: 'Add Knowledge Sources',
      subtitle: 'Upload files, add web links, or provide context to expand your knowledge base',
      icon: Plus
    },
    visualization: {
      title: 'AI Processing Visualization',
      subtitle: 'Explore how AI processes and organizes your knowledge for intelligent responses',
      icon: Brain
    }
  };

  const currentConfig = viewConfig[currentView];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      
      switch (e.key) {
        case '1':
          setCurrentView('dashboard');
          break;
        case '2':
          setCurrentView('add-sources');
          break;
        case '3':
          setCurrentView('visualization');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        knowledgeItemsCount={knowledgeItems.length}
      />
      
      <MainLayout sidebarCollapsed={sidebarCollapsed}>
        <StatusBar />
        
        <PageHeader
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          icon={currentConfig.icon}
          showBackButton={currentView !== 'dashboard'}
          onBack={() => setCurrentView('dashboard')}
        />
        
        {currentView === 'dashboard' ? (
          <KnowledgeDashboard onAddSources={() => setCurrentView('add-sources')} />
        ) : currentView === 'visualization' ? (
          <VisualizationDashboard knowledgeItems={knowledgeItems} />
        ) : (
          <AddSourcesView onSuccess={handleSourcesAdded} />
        )}
        
        <Footer />
      </MainLayout>

      <NavigationGuide currentView={currentView} />
    </div>
  );
}

export default App;