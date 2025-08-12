import { FormData, SubmissionResult } from '../types';

export async function submitIngestion(data: FormData): Promise<SubmissionResult> {
  try {
    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful response
    const result = {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    return {
      success: true,
      jobId: result.jobId,
    };
  } catch (error) {
    console.error('Ingestion submission failed:', error);
    return {
      success: false,
      errors: [{
        type: 'general',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }],
    };
  }
}