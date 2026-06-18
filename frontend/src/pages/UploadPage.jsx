import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle,
  XCircle,
  Loader2,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { uploadDocument } from '../services/api';
import toast from 'react-hot-toast';

const fileTypeIcons = {
  '.pdf': FileText,
  '.txt': File,
  '.png': Image,
  '.jpg': Image,
  '.jpeg': Image,
};

export default function UploadPage() {
  const [uploads, setUploads] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const id = `${file.name}-${Date.now()}`;
      setUploads((prev) => [
        ...prev,
        { id, file, progress: 0, status: 'uploading', result: null, error: null },
      ]);
      processUpload(id, file);
    });
  }, []);

  const processUpload = async (id, file) => {
    try {
      const result = await uploadDocument(file, (progress) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress } : u))
        );
      });

      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 'success', progress: 100, result } : u
        )
      );
      toast.success(`${file.name} processed successfully!`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Upload failed';
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 'error', error: errorMsg } : u
        )
      );
      toast.error(errorMsg);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-surface-900 dark:text-white"
        >
          Upload Documents
        </motion.h1>
        <p className="text-surface-600 dark:text-surface-300 mt-1">
          Upload PDFs, text files, or images for AI processing
        </p>
      </div>

      {/* Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          {...getRootProps()}
          className={`relative p-12 rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-300 text-center group
            ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/5 scale-[1.02]'
                : 'border-surface-300 dark:border-white/15 bg-white/50 dark:bg-white/5 hover:border-primary-400 dark:hover:border-primary-500/30'
            }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`p-4 rounded-2xl transition-all duration-300
              ${
                isDragActive
                  ? 'bg-primary-500/20 scale-110'
                  : 'bg-surface-100 dark:bg-white/10 group-hover:bg-primary-500/10'
              }`}
            >
              <UploadCloud
                className={`w-10 h-10 transition-colors ${
                  isDragActive
                    ? 'text-primary-500'
                    : 'text-surface-400 group-hover:text-primary-500'
                }`}
              />
            </div>

            {isDragActive ? (
              <div>
                <p className="text-lg font-semibold text-primary-500">Drop files here</p>
                <p className="text-sm text-primary-400 mt-1">Release to start processing</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-surface-700 dark:text-surface-200">
                  Drag & drop your documents here
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">
                  or <span className="text-primary-500 font-medium">browse files</span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              {['.PDF', '.TXT', '.PNG', '.JPG'].map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-lg text-xs font-medium
                    bg-surface-100 dark:bg-white/10
                    text-surface-600 dark:text-surface-300"
                >
                  {type}
                </span>
              ))}
              <span className="text-xs text-surface-500 dark:text-surface-400">Max 50MB</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Uploads
            </h2>
            <button
              onClick={clearCompleted}
              className="text-sm text-surface-500 hover:text-primary-500 transition-colors"
            >
              Clear completed
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {uploads.map((upload) => {
                const ext = '.' + upload.file.name.split('.').pop().toLowerCase();
                const Icon = fileTypeIcons[ext] || File;

                return (
                  <motion.div
                    key={upload.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
                      border border-surface-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-primary-500/10">
                        <Icon className="w-5 h-5 text-primary-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white truncate">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {upload.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                          <span className="text-sm font-medium text-primary-500">
                            {upload.progress}%
                          </span>
                        </div>
                      )}
                      {upload.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                      {upload.status === 'error' && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="mt-3 w-full bg-surface-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}

                    {/* Result info */}
                    {upload.result && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary-500" />
                          {upload.result.num_chunks} chunks created
                        </span>
                        {upload.result.num_pages && (
                          <span>{upload.result.num_pages} pages</span>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {upload.error && (
                      <p className="mt-2 text-xs text-red-500">{upload.error}</p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
