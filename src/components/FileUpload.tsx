import React, { useRef, useState } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { FileItem } from '../types';
import { validateFile, validateFiles, formatFileSize, generateId } from '../utils/validation';

interface FileUploadProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  disabled?: boolean;
}

export function FileUpload({ files, onFilesChange, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [globalError, setGlobalError] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    setGlobalError('');

    // Validate total file count
    const totalFiles = files.length + newFiles.length;
    const filesValidation = validateFiles(Array.from({ length: totalFiles }));
    
    if (!filesValidation.valid) {
      setGlobalError(filesValidation.error!);
      return;
    }

    // Process each file
    const processedFiles: FileItem[] = newFiles.map((file) => {
      const validation = validateFile(file);
      return {
        id: generateId(),
        file,
        size: file.size,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error,
      };
    });

    onFilesChange([...files, ...processedFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((file) => file.id !== id));
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          File Upload
        </label>
        <span className="text-xs text-gray-500">
          Max 20 files, 25MB each
        </span>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-50/80 scale-[1.02] shadow-lg'
            : files.length > 0
            ? 'border-green-300 bg-green-50/80'
            : 'border-gray-300 bg-gray-50/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:bg-gray-100/60 hover:shadow-md'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            openFileDialog();
          }
        }}
        aria-label="Upload files by clicking or dragging and dropping"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
          aria-describedby="file-upload-description"
        />
        
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
          <Upload className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p id="file-upload-description" className="text-xs text-gray-500">
          PDF, DOCX, TXT, MD, CSV, PNG, JPG • Max 25MB each
        </p>
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl shadow-sm">
          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          <span className="text-sm text-red-700 font-medium">{globalError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  fileItem.status === 'error'
                    ? 'border-red-200/60 bg-red-50/80'
                    : 'border-gray-200/60 bg-white hover:border-gray-300/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <File className="h-4 w-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 font-medium">
                        {formatFileSize(fileItem.size)}
                      </p>
                      {fileItem.error && (
                        <p className="text-xs text-red-600 font-medium">{fileItem.error}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Remove ${fileItem.file.name}`}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}