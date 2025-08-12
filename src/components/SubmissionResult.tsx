import React from 'react';
import { CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { SubmissionResult as SubmissionResultType } from '../types';

interface SubmissionResultProps {
  result: SubmissionResultType;
  onReset: () => void;
}

export function SubmissionResult({ result, onReset }: SubmissionResultProps) {
  const [copied, setCopied] = React.useState(false);

  const copyJobId = async () => {
    if (result.jobId) {
      try {
        await navigator.clipboard.writeText(result.jobId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy job ID:', error);
      }
    }
  };

  if (result.success) {
    return (
      <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/60 rounded-2xl shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-800 mb-3 tracking-tight">
              Submission Successful!
            </h3>
            <p className="text-base text-green-700 mb-6 font-medium leading-relaxed">
              Your files and links have been successfully processed and added to the knowledge base.
              The chatbot now has access to this information.
            </p>
            
            {result.jobId && (
              <div className="bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Job ID:</p>
                    <code className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{result.jobId}</code>
                  </div>
                  <button
                    onClick={copyJobId}
                    className="p-2 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Copy job ID"
                  >
                    <Copy className="h-4 w-4 text-green-600" />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2 font-semibold">✅ Copied to clipboard!</p>
                )}
              </div>
            )}

            <button
              onClick={onReset}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              ➕ Add More Sources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-r from-red-50 to-pink-50/50 border border-red-200/60 rounded-2xl shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-800 mb-3 tracking-tight">
            Submission Failed
          </h3>
          
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-3 mb-6">
              {result.errors.map((error, index) => (
                <div key={index} className="text-base text-red-700 bg-white/60 p-3 rounded-lg border border-red-200/40">
                  <span className="font-semibold capitalize">{error.type} Error:</span> {error.message}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              🔄 Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}