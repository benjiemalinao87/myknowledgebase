import React, { useState } from 'react';
import { HelpCircle, X, ArrowRight, Database, Plus, Brain } from 'lucide-react';

interface NavigationGuideProps {
  currentView: 'dashboard' | 'add-sources' | 'visualization';
}

export function NavigationGuide({ currentView }: NavigationGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const guides = {
    dashboard: [
      {
        step: 1,
        title: 'View Your Knowledge',
        description: 'Browse all uploaded files, web links, and context information',
        icon: Database
      },
      {
        step: 2,
        title: 'Search & Filter',
        description: 'Use the search bar to quickly find specific information',
        icon: Database
      },
      {
        step: 3,
        title: 'Add More Sources',
        description: 'Click "Add Sources" to expand your knowledge base',
        icon: Plus
      },
      {
        step: 4,
        title: 'Explore AI Insights',
        description: 'Visit "AI Visualization" to see how content is processed',
        icon: Brain
      }
    ],
    'add-sources': [
      {
        step: 1,
        title: 'Upload Files',
        description: 'Drag & drop or click to upload PDF, DOCX, images, and more',
        icon: Plus
      },
      {
        step: 2,
        title: 'Add Web Links',
        description: 'Include relevant websites and online resources',
        icon: Plus
      },
      {
        step: 3,
        title: 'Provide Context',
        description: 'Add project details, budget, and specific requirements',
        icon: Plus
      },
      {
        step: 4,
        title: 'Process Sources',
        description: 'Click "Process Sources" to add them to your knowledge base',
        icon: Plus
      }
    ],
    visualization: [
      {
        step: 1,
        title: 'Overview Tab',
        description: 'See semantic clusters and processing metrics',
        icon: Brain
      },
      {
        step: 2,
        title: 'Embeddings Tab',
        description: 'Explore vector representations of your content',
        icon: Brain
      },
      {
        step: 3,
        title: 'Knowledge Graph',
        description: 'Drag nodes to explore content relationships',
        icon: Brain
      },
      {
        step: 4,
        title: 'AI Insights',
        description: 'View recommendations and processing analytics',
        icon: Brain
      }
    ]
  };

  const currentGuide = guides[currentView];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 z-50 group"
        aria-label="Open navigation guide"
      >
        <HelpCircle className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Navigation Guide</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-blue-100 mt-2 font-medium">
                Learn how to navigate this section
              </p>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {currentGuide.map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Got it! Let's go
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}