import React from 'react';
import { Loader2, CheckCircle, XCircle, Upload, Globe, Database } from 'lucide-react';
import { SubmissionStatus } from '../types';

interface SubmissionProgressProps {
  status: SubmissionStatus;
  currentStep?: string;
}

const statusConfig = {
  idle: { icon: null, text: '', color: '' },
  uploading: { icon: Upload, text: 'Uploading files...', color: 'text-blue-600' },
  crawling: { icon: Globe, text: 'Processing web links...', color: 'text-blue-600' },
  indexing: { icon: Database, text: 'Indexing content...', color: 'text-blue-600' },
  complete: { icon: CheckCircle, text: 'Processing complete!', color: 'text-green-600' },
  error: { icon: XCircle, text: 'Processing failed', color: 'text-red-600' },
};

export function SubmissionProgress({ status, currentStep }: SubmissionProgressProps) {
  if (status === 'idle') return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center p-8 bg-gradient-to-r from-white to-blue-50/30 border border-blue-200/60 rounded-2xl shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {status === 'complete' || status === 'error' ? (
          Icon && <Icon className={`h-6 w-6 ${config.color}`} aria-hidden="true" />
        ) : (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping"></div>
            <Loader2 className={`h-6 w-6 ${config.color} animate-spin relative z-10`} aria-hidden="true" />
          </div>
        )}
        <div>
          <p className={`text-base font-semibold ${config.color}`}>
            {currentStep || config.text}
          </p>
          {status !== 'complete' && status !== 'error' && (
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Please wait while we process your submission...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}