import React from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  showBackButton, 
  onBack, 
  actions,
  breadcrumbs 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}
      
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            
            {Icon && (
              <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
                <Icon className="h-8 w-8 text-blue-600" />
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-gray-600 font-medium mt-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}