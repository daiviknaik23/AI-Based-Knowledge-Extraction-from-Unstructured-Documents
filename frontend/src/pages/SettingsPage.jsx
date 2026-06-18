import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Server,
  Key,
  Database,
  Cpu,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Globe,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { healthCheck, getLanguages } from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const [health, setHealth] = useState(null);
  const [languages, setLanguages] = useState({});
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setChecking(true);
    try {
      const [healthData, langData] = await Promise.all([
        healthCheck(),
        getLanguages().catch(() => ({ languages: {} })),
      ]);
      setHealth(healthData);
      setLanguages(langData.languages || {});
    } catch {
      setHealth(null);
    } finally {
      setChecking(false);
    }
  };

  const configItems = health
    ? [
        { label: 'LLM Provider', value: health.llm_provider?.toUpperCase(), icon: Cpu },
        { label: 'Embedding Model', value: health.embedding_model, icon: Database },
        { label: 'Chunk Size', value: `${health.chunk_size} chars`, icon: Server },
        { label: 'Top-K Results', value: health.top_k, icon: Key },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-surface-900 dark:text-white"
        >
          Settings
        </motion.h1>
        <p className="text-surface-600 dark:text-surface-300 mt-1">
          Configure application preferences and view system status
        </p>
      </div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
          border border-surface-200 dark:border-white/10"
      >
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary-500" />
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-surface-800 dark:text-surface-200">Theme</p>
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Switch between dark and light mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              darkMode ? 'bg-primary-500' : 'bg-surface-300'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
              animate={{ left: darkMode ? '1.75rem' : '0.125rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {darkMode ? (
                <Moon className="w-3.5 h-3.5 text-primary-500" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </motion.div>
          </button>
        </div>
      </motion.div>

      {/* Backend Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
          border border-surface-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-500" />
            Backend Status
          </h2>
          <button
            onClick={checkBackend}
            disabled={checking}
            className="text-sm text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {checking ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            <span className="text-surface-600 dark:text-surface-300">Checking backend connection...</span>
          </div>
        ) : health ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Backend is connected and healthy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {configItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl
                    bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/5"
                >
                  <item.icon className="w-4 h-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-surface-600 dark:text-surface-300">{item.label}</p>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Backend is not reachable
              </span>
              <p className="text-xs text-red-500/70 mt-0.5">
                Make sure the FastAPI server is running on port 8000
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Supported Languages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
          border border-surface-200 dark:border-white/10"
      >
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          Supported Languages
        </h2>

        <div className="flex flex-wrap gap-2">
          {Object.entries(languages).length > 0
            ? Object.entries(languages).map(([code, name]) => (
                <span
                  key={code}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-primary-500/10 text-primary-600 dark:text-primary-400
                    border border-primary-500/20"
                >
                  {name}
                </span>
              ))
            : ['English', 'Hindi', 'Kannada', 'French', 'Spanish'].map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-surface-100 dark:bg-white/5 text-surface-600 dark:text-surface-300
                    border border-surface-200 dark:border-white/10"
                >
                  {lang}
                </span>
              ))}
        </div>
      </motion.div>

      {/* Setup Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
          border border-surface-200 dark:border-white/10"
      >
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-500" />
          Setup Guide
        </h2>

        <div className="space-y-3 text-sm text-surface-600 dark:text-surface-300">
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-white/5">
            <p className="font-medium text-surface-800 dark:text-surface-200 mb-1">
              1. Configure Environment
            </p>
            <p>
              Copy <code className="text-primary-500 font-mono text-xs">.env.example</code> to{' '}
              <code className="text-primary-500 font-mono text-xs">.env</code> and add your API keys.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-white/5">
            <p className="font-medium text-surface-800 dark:text-surface-200 mb-1">
              2. Install Tesseract OCR
            </p>
            <p>
              Required for image/scanned PDF processing. Download from the{' '}
              <a
                href="https://github.com/tesseract-ocr/tesseract"
                target="_blank"
                rel="noreferrer"
                className="text-primary-500 underline"
              >
                Tesseract GitHub
              </a>
              .
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-white/5">
            <p className="font-medium text-surface-800 dark:text-surface-200 mb-1">
              3. Start Backend
            </p>
            <code className="text-xs font-mono text-primary-500 block mt-1">
              cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
            </code>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-white/5">
            <p className="font-medium text-surface-800 dark:text-surface-200 mb-1">
              4. Start Frontend
            </p>
            <code className="text-xs font-mono text-primary-500 block mt-1">
              cd frontend && npm install && npm run dev
            </code>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
