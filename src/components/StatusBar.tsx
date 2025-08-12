import React from 'react';
import { Wifi, Clock, CheckCircle } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">System Online</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Response: &lt;500ms</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Accuracy: 94.2%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
}