'use client';

import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export interface SubmissionFile {
  id?: string;
  name: string;
  size: number;
  url: string;
}

interface SubmissionUploaderProps {
  assignmentId: string;
  studentId: string;
  onUploadComplete: (files: SubmissionFile[]) => void;
  onUploadError: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export default function SubmissionUploader({
  assignmentId,
  studentId,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxFileSize = 10
}: SubmissionUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<SubmissionFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (files.length + selectedFiles.length > maxFiles) {
      onUploadError(`Maximum ${maxFiles} files allowed. You have selected ${selectedFiles.length} files, but can only add ${maxFiles - files.length} more.`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of selectedFiles) {
      // More robust PDF type checking
      const isValidPDF = file.type === 'application/pdf' || 
                        file.type === 'application/x-pdf' || 
                        file.name.toLowerCase().endsWith('.pdf');
      
      if (!isValidPDF) {
        errors.push(`"${file.name}" is not a PDF file`);
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxFileSize}MB`);
        continue;
      }

      // Check for duplicate files
      const isDuplicate = files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (isDuplicate) {
        errors.push(`"${file.name}" is already selected`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      onUploadError(`Some files could not be added:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }

    // Clear the input value to allow re-selecting the same files after fixing issues
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      onUploadError('Please select at least one file');
      return;
    }

    if (!assignmentId || !studentId) {
      onUploadError('Missing assignment or student information');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: SubmissionFile[] = [];
      const failedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('assignmentId', assignmentId);
          formData.append('studentId', studentId);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              // If we can't parse the error response, use the status text
              errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const result: { file: SubmissionFile; success: boolean } = await response.json();
          if (result.success && result.file) {
            uploadedFiles.push(result.file);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          failedFiles.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      if (uploadedFiles.length > 0) {
        setUploadedFiles(uploadedFiles);
        onUploadComplete(uploadedFiles);
        
        // Only clear files that were successfully uploaded
        setFiles(prev => prev.filter(file => 
          !uploadedFiles.some(uploaded => uploaded.name === file.name)
        ));
      }

      if (failedFiles.length > 0) {
        onUploadError(`Some files failed to upload:\n${failedFiles.join('\n')}`);
      }

      // Reset progress after a delay to show completion
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Submission</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to select PDF files or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files, {maxFileSize}MB each
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {`Successfully uploaded ${uploadedFiles.length} file(s)`}
            </AlertDescription>
          </Alert>
        )}

        {files.length > 0 && !uploading && (
          <Button onClick={uploadFiles} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload {files.length} file(s)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
