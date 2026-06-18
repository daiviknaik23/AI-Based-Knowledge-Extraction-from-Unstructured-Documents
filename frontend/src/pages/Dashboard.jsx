import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  MessageSquare,
  Brain,
  Trash2,
  Clock,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getDocuments, deleteDocument } from '../services/api';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      // Backend may not be running yet
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;
    try {
      await deleteDocument(id);
      toast.success(`Deleted ${filename}`);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const totalChunks = documents.reduce((sum, d) => sum + (d.num_chunks || 0), 0);
  const totalSize = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);

  const quickActions = [
    {
      icon: Upload,
      title: 'Upload Document',
      desc: 'Upload PDFs, images, or text files',
      path: '/upload',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions',
      desc: 'Query your documents with AI',
      path: '/query',
      color: 'from-primary-500 to-violet-400',
    },
    {
      icon: FileText,
      title: 'Summarize',
      desc: 'Generate document summaries',
      path: '/summarize',
      color: 'from-emerald-500 to-green-400',
    },
  ];

  const statCards = [
    {
      icon: FileText,
      label: 'Documents',
      value: documents.length,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Layers,
      label: 'Total Chunks',
      value: totalChunks,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: `${(totalSize / 1024 / 1024).toFixed(1)} MB`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Brain,
      label: 'AI Ready',
      value: documents.length > 0 ? 'Yes' : 'No',
      color: 'text-accent-500',
      bg: 'bg-accent-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-surface-900 dark:text-white"
        >
          Dashboard
        </motion.h1>
        <p className="text-surface-600 dark:text-surface-300 mt-1">
          Overview of your knowledge base
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm
              border border-surface-200 dark:border-white/10 card-hover"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-surface-600 dark:text-surface-300 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.title}
              custom={i + 4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onClick={() => navigate(action.path)}
              className="group flex items-center gap-4 p-5 rounded-2xl text-left
                bg-white/70 dark:bg-white/5 backdrop-blur-sm
                border border-surface-200 dark:border-white/10
                hover:border-primary-300 dark:hover:border-primary-500/30
                card-hover"
            >
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg
                  group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-surface-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                className="w-5 h-5 text-surface-400 group-hover:text-primary-500
                  group-hover:translate-x-1 transition-all"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            Recent Documents
          </h2>
          {documents.length > 0 && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              {documents.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="ai-thinking">
              <span /><span /><span />
            </div>
            <span className="ml-3 text-surface-600 dark:text-surface-300">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl bg-white/50 dark:bg-white/5 border border-dashed border-surface-300 dark:border-white/10"
          >
            <Sparkles className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-300 mb-4">
              No documents uploaded yet
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm
                shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Your First Document
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4 p-4 rounded-xl
                  bg-white/70 dark:bg-white/5 backdrop-blur-sm
                  border border-surface-200 dark:border-white/10
                  hover:border-primary-300 dark:hover:border-primary-500/20
                  transition-all duration-200"
              >
                <div className="p-2.5 rounded-lg bg-primary-500/10">
                  <FileText className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-white truncate">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-surface-600 dark:text-surface-300">
                      {doc.file_type?.toUpperCase()}
                    </span>
                    <span className="text-xs text-surface-400 dark:text-surface-500">•</span>
                    <span className="text-xs text-surface-600 dark:text-surface-300">
                      {doc.num_chunks} chunks
                    </span>
                    <span className="text-xs text-surface-400 dark:text-surface-500">•</span>
                    <span className="text-xs text-surface-600 dark:text-surface-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-500
                    hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
