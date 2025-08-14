import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainLayout } from './components/MainLayout';
import { PageHeader } from './components/PageHeader';
import { StatusBar } from './components/StatusBar';
import { KnowledgeDashboard } from './components/KnowledgeDashboard';
import { VisualizationDashboard } from './components/VisualizationDashboard';
import { AddSourcesView } from './components/AddSourcesView';
import { Settings } from './components/Settings';
import { Footer } from './components/Footer';
import { NavigationGuide } from './components/NavigationGuide';
import { getKnowledgeItems } from './services/knowledgeService';
import { KnowledgeItem } from './types';
import { Database, Plus, Brain, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-sources' | 'visualization' | 'settings'>('dashboard');
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
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure personas, AI settings, and API configuration',
      icon: SettingsIcon
    }
  };

  const currentConfig = viewConfig[currentView];

  // Keyboard navigation removed to avoid conflicts with input fields

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
        ) : currentView === 'settings' ? (
          <Settings />
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