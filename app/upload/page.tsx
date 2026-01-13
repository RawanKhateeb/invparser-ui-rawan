'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { invoiceAPI } from '@/lib/api';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle, X, File } from 'lucide-react';
import Link from 'next/link';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, { status: 'pending' | 'uploading' | 'success' | 'error'; message?: string; invoiceId?: string }>>(
    {}
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return false;
    }
    return true;
  };

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

    const newFiles = Array.from(e.dataTransfer.files).filter((file) => validateFile(file));
    const invalidFiles = Array.from(e.dataTransfer.files).filter((file) => !validateFile(file));

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) have invalid format or size`);
    }

    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
      newFiles.forEach((file) => {
        setUploadStatus((prev) => ({
          ...prev,
          [file.name]: { status: 'pending' },
        }));
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.currentTarget.files || []).filter((file) => validateFile(file));
    const invalidFiles = Array.from(e.currentTarget.files || []).filter((file) => !validateFile(file));

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) have invalid format or size`);
    }

    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
      newFiles.forEach((file) => {
        setUploadStatus((prev) => ({
          ...prev,
          [file.name]: { status: 'pending' },
        }));
      });
    }
  };

  const handleUpload = async (file: File) => {
    setUploadStatus((prev) => ({
      ...prev,
      [file.name]: { status: 'uploading' },
    }));

    try {
      const response = await invoiceAPI.uploadInvoice(file);
      setUploadStatus((prev) => ({
        ...prev,
        [file.name]: {
          status: 'success',
          message: `Invoice ${response.invoiceId || 'processed'} extracted successfully`,
          invoiceId: response.invoiceId,
        },
      }));
      toast.success(`${file.name} uploaded successfully`);
    } catch (error: any) {
      setUploadStatus((prev) => ({
        ...prev,
        [file.name]: {
          status: 'error',
          message: error.response?.data?.message || error.message || 'Upload failed',
        },
      }));
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((f) => f.name !== fileName));
    setUploadStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const uploadAllPending = async () => {
    const pendingFiles = files.filter((f) => uploadStatus[f.name]?.status === 'pending');
    for (const file of pendingFiles) {
      await handleUpload(file);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Upload Invoice</h1>
            <p className="text-slate-600">Upload invoice documents for extraction. Supported formats: PDF, JPEG, PNG, GIF, WebP</p>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed transition-all p-12 text-center cursor-pointer mb-8 ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Upload size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </h3>
              <p className="text-slate-600 mb-4">or</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Files
              </button>
              <p className="text-sm text-slate-500 mt-4">Maximum file size: 50MB</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </h2>
                {files.some((f) => uploadStatus[f.name]?.status === 'pending') && (
                  <button
                    onClick={uploadAllPending}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Upload All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {files.map((file) => {
                  const status = uploadStatus[file.name] || { status: 'pending' };
                  return (
                    <div key={file.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <File size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-sm text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {status.status === 'pending' && (
                          <button
                            onClick={() => handleUpload(file)}
                            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
                          >
                            Upload
                          </button>
                        )}

                        {status.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-blue-600 font-semibold">Uploading...</span>
                          </div>
                        )}

                        {status.status === 'success' && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <span className="text-sm text-green-600 font-semibold">Done</span>
                          </div>
                        )}

                        {status.status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <AlertCircle size={20} className="text-red-600" />
                            <span className="text-sm text-red-600 font-semibold">Failed</span>
                          </div>
                        )}

                        {status.status !== 'uploading' && (
                          <button
                            onClick={() => removeFile(file.name)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success Messages with Invoice Links */}
              {files.some((f) => uploadStatus[f.name]?.status === 'success' && uploadStatus[f.name]?.invoiceId) && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">Successful Uploads</h3>
                  <div className="space-y-2">
                    {files
                      .filter((f) => uploadStatus[f.name]?.status === 'success' && uploadStatus[f.name]?.invoiceId)
                      .map((f) => (
                        <div key={f.name}>
                          <Link
                            href={`/invoice/${uploadStatus[f.name].invoiceId}`}
                            className="text-green-700 hover:text-green-900 hover:underline text-sm font-medium"
                          >
                            View Invoice #{uploadStatus[f.name].invoiceId}
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Supported File Formats</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• PDF documents (.pdf)</li>
              <li>• JPEG images (.jpg, .jpeg)</li>
              <li>• PNG images (.png)</li>
              <li>• GIF images (.gif)</li>
              <li>• WebP images (.webp)</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
