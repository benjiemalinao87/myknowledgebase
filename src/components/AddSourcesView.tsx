import React, { useState, useEffect } from 'react';
import { ProgressIndicator } from './ProgressIndicator';
import { FileUpload } from './FileUpload';
import { WebLinks } from './WebLinks';
import { ContextTextarea } from './ContextTextarea';
import { SubmissionProgress } from './SubmissionProgress';
import { SubmissionResult } from './SubmissionResult';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { FormData, SubmissionStatus, SubmissionResult as SubmissionResultType } from '../types';
import { loadDraft, clearDraft } from '../utils/storage';
import { submitIngestion } from '../services/api';

interface AddSourcesViewProps {
  onSuccess: () => void;
}

export function AddSourcesView({ onSuccess }: AddSourcesViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['Upload Files', 'Add Context', 'Process'];
  
  const [formData, setFormData] = useState<FormData>({
    files: [],
    links: [],
    context: '',
  });
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResultType | null>(null);

  // Load draft data on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData((prev) => ({
        ...prev,
        ...draft,
      }));
    }
  }, []);

  // Persist form data
  useFormPersistence(formData);

  // Update current step based on form data
  useEffect(() => {
    if (formData.files.length > 0 && formData.context.trim()) {
      setCurrentStep(3);
    } else if (formData.files.length > 0) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [formData]);

  const hasValidSources = formData.files.filter(f => f.status !== 'error').length > 0;

  const isSubmitting = submissionStatus !== 'idle' && submissionStatus !== 'complete' && submissionStatus !== 'error';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasValidSources) return;

    setSubmissionStatus('uploading');
    setSubmissionResult(null);

    // Simulate different phases with delays for better UX
    setTimeout(() => setSubmissionStatus('crawling'), 1000);
    setTimeout(() => setSubmissionStatus('indexing'), 2000);

    try {
      const result = await submitIngestion(formData);
      setSubmissionResult(result);
      setSubmissionStatus(result.success ? 'complete' : 'error');
      
      if (result.success) {
        // Clear the form and draft on successful submission
        setFormData({ files: [], links: [], context: '' });
        clearDraft();
        // Notify parent component of success
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        errors: [{ type: 'general', message: 'Network error. Please try again.' }],
      });
      setSubmissionStatus('error');
    }
  };

  const handleReset = () => {
    setSubmissionStatus('idle');
    setSubmissionResult(null);
  };

  return (
    <div className="space-y-8">
      {submissionResult ? (
        <SubmissionResult result={submissionResult} onReset={handleReset} />
      ) : (
        <>
          {isSubmitting && <SubmissionProgress status={submissionStatus} />}
          
          {!isSubmitting && (
            <>
              <ProgressIndicator 
                currentStep={currentStep}
                totalSteps={steps.length}
                steps={steps}
              />
              
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
              <div className="p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    Add Knowledge Sources
                  </h2>
                  <p className="text-gray-600 text-base font-medium leading-relaxed">
                    Upload files, add web links, or provide context to help the chatbot give you better home improvement advice.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <FileUpload
                    files={formData.files}
                    onFilesChange={(files) => setFormData(prev => ({ ...prev, files }))}
                    disabled={isSubmitting}
                  />

                  <div className="border-t border-gray-200/60 pt-8">
                    <WebLinks
                      links={formData.links}
                      onLinksChange={(links) => setFormData(prev => ({ ...prev, links }))}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="border-t border-gray-200/60 pt-8">
                    <ContextTextarea
                      value={formData.context}
                      onChange={(context) => setFormData(prev => ({ ...prev, context }))}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="border-t border-gray-200/60 pt-10 flex justify-center">
                    <button
                      type="submit"
                      disabled={!hasValidSources || isSubmitting}
                      className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 focus:ring-2 focus:ring-offset-2 text-base ${
                        hasValidSources && !isSubmitting
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      aria-describedby="submit-help"
                    >
                      🚀 Process Sources
                    </button>
                  </div>
                  
                  <p id="submit-help" className="text-sm text-gray-600 text-center font-medium mt-3">
                    {!hasValidSources 
                      ? 'Add at least one file to continue'
                      : 'Click to process your sources and add them to the knowledge base'
                    }
                  </p>
                </form>
              </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}