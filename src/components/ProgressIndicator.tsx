import React from 'react';
import { Check, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Progress</h3>
        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                index + 1 < currentStep
                  ? 'bg-green-500 text-white shadow-lg'
                  : index + 1 === currentStep
                  ? 'bg-blue-600 text-white shadow-lg animate-pulse'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1 < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <span className={`text-xs mt-2 font-medium text-center max-w-20 ${
                index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}