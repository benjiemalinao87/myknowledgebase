import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
}

export function MainLayout({ children, sidebarCollapsed }: MainLayoutProps) {
  return (
    <div className={`min-h-screen transition-all duration-300 ${
      sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
    }`}>
      <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}