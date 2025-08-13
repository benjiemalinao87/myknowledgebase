import React, { useState } from 'react';
import { Database, Plus, Brain, Home, Menu, X, ChevronRight, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'add-sources' | 'visualization' | 'settings';
  onViewChange: (view: 'dashboard' | 'add-sources' | 'visualization' | 'settings') => void;
  knowledgeItemsCount: number;
}

export function Sidebar({ currentView, onViewChange, knowledgeItemsCount }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      icon: Database,
      label: 'Knowledge Base',
      description: 'View & manage sources',
      badge: knowledgeItemsCount > 0 ? knowledgeItemsCount.toString() : undefined,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'add-sources',
      icon: Plus,
      label: 'Add Sources',
      description: 'Upload new content',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'visualization',
      icon: Brain,
      label: 'AI Visualization',
      description: 'Explore AI insights',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-gray-600',
      hoverColor: 'hover:bg-gray-100'
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      color: 'text-gray-600',
      hoverColor: 'hover:bg-gray-100'
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-blue-600">
            <Home className="h-6 w-6" />
            <Brain className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Assistant</h2>
              <p className="text-xs text-gray-600 font-medium">Knowledge Base</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id as any);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? `${item.bgColor} ${item.color} shadow-md ring-2 ring-blue-200`
                  : `text-gray-700 hover:text-gray-900 ${item.hoverColor} hover:shadow-sm`
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/60 shadow-sm' 
                  : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-gray-600'}`} />
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.label}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive ? 'bg-white/80 text-blue-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{item.description}</p>
                  </div>
                  
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200/60 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'settings') {
                  onViewChange('settings');
                  setIsMobileOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${item.hoverColor} hover:shadow-sm ${
                currentView === item.id ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group"
        >
          <Menu className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && (
            <span className="ml-3 font-medium text-sm">Collapse</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-200"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/60 shadow-xl z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}