import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Download,
  Volume2,
  Sparkles,
  ListOrdered,
  AlignLeft,
  Lightbulb,
  List,
} from 'lucide-react';
import { getDocuments, summarizeDocument, textToSpeech } from '../services/api';
import toast from 'react-hot-toast';

const summaryTypes = [
  { id: 'concise', label: 'Concise', icon: AlignLeft, desc: 'Brief 3-5 paragraph summary' },
  { id: 'key_points', label: 'Key Points', icon: ListOrdered, desc: 'Top 5-10 key points' },
  { id: 'bullet', label: 'Bullet Summary', icon: List, desc: 'Organized bullet points' },
  { id: 'insights', label: 'Insights', icon: Lightbulb, desc: 'Deep analysis & implications' },
];

export default function SummarizePage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedType, setSelectedType] = useState('concise');
  const [loading, setLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
      if (data.documents?.length > 0) {
        setSelectedDoc(data.documents[0].id);
      }
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedDoc) {
      toast.error('Please select a document');
      return;
    }

    setLoading(true);
    setSummary(null);

    try {
      const result = await summarizeDocument(selectedDoc, selectedType);
      setSummary(result);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${summary.filename}_${summary.summary_type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded');
  };

  const handleTTS = async () => {
    if (!summary) return;
    try {
      toast.loading('Generating audio...', { id: 'tts' });
      const result = await textToSpeech(summary.summary.slice(0, 5000));
      toast.dismiss('tts');
      const audio = new Audio(result.audio_url);
      audio.play();
      toast.success('Playing audio');
    } catch {
      toast.dismiss('tts');
      toast.error('Text-to-speech failed');
    }
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
          Document Summarization
        </motion.h1>
        <p className="text-surface-600 dark:text-surface-300 mt-1">
          Generate AI-powered summaries of your documents
        </p>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
          border border-surface-200 dark:border-white/10"
      >
        {/* Document Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
            Select Document
          </label>
          {docsLoading ? (
            <div className="flex items-center gap-2 text-surface-500 dark:text-surface-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-surface-600 dark:text-surface-300">
              No documents uploaded yet. Upload documents first.
            </p>
          ) : (
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm
                bg-surface-50 dark:bg-surface-800
                border border-surface-200 dark:border-white/10
                text-surface-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                transition-all"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-white dark:bg-surface-800 text-surface-900 dark:text-white">
                  {doc.filename} ({doc.num_chunks} chunks)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Summary Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-3">
            Summary Type
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center
                  border transition-all duration-200
                  ${
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      : 'border-surface-200 dark:border-white/10 text-surface-600 dark:text-surface-300 hover:border-primary-300 dark:hover:border-primary-500/30'
                  }`}
              >
                <type.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{type.label}</span>
                <span className="text-[11px] opacity-70">{type.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSummarize}
          disabled={loading || !selectedDoc}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
            bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold
            shadow-lg shadow-primary-500/25
            disabled:opacity-50 disabled:shadow-none
            hover:shadow-xl hover:-translate-y-0.5
            transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Summary
            </>
          )}
        </button>
      </motion.div>

      {/* Summary Result */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
            border border-surface-200 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  {summary.filename}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-300">
                  {summaryTypes.find((t) => t.id === summary.summary_type)?.label} •{' '}
                  {summary.processing_time}s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleTTS}
                className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                title="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary Content */}
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none
              text-surface-700 dark:text-surface-200 leading-relaxed whitespace-pre-wrap">
              {summary.summary}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
