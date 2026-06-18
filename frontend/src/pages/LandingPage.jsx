import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Upload,
  MessageSquare,
  FileText,
  Globe,
  Volume2,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Search,
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Smart Upload',
    desc: 'Upload PDFs, images, and text files with automatic OCR processing',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Search,
    title: 'RAG Pipeline',
    desc: 'Retrieval-Augmented Generation for accurate, contextual answers',
    color: 'from-primary-500 to-primary-400',
  },
  {
    icon: FileText,
    title: 'AI Summaries',
    desc: 'Generate concise summaries, key points, and document insights',
    color: 'from-emerald-500 to-green-400',
  },
  {
    icon: MessageSquare,
    title: 'Intelligent Q&A',
    desc: 'Ask questions and get answers with source citations',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Globe,
    title: 'Multilingual',
    desc: 'Translate responses to Hindi, Kannada, French, Spanish & more',
    color: 'from-orange-500 to-amber-400',
  },
  {
    icon: Volume2,
    title: 'Text to Speech',
    desc: 'Listen to AI responses with natural-sounding audio output',
    color: 'from-pink-500 to-rose-400',
  },
];

const stats = [
  { value: '10+', label: 'File Formats' },
  { value: '5+', label: 'Languages' },
  { value: 'RAG', label: 'Powered' },
  { value: 'LLM', label: 'Enhanced' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-primary w-[600px] h-[600px] -top-64 -left-64 opacity-15" />
        <div className="orb orb-accent w-[500px] h-[500px] top-1/3 -right-48 opacity-10" />
        <div className="orb orb-primary w-[400px] h-[400px] -bottom-32 left-1/4 opacity-10" />
        <div className="bg-grid-pattern absolute inset-0" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-surface-900 dark:text-white">
            AI Knowledge<span className="text-primary-500">.</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-primary-500 to-accent-500 text-white
            shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
            transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Launch App
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-16 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full
              bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/20"
          >
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Powered by LLMs & RAG Architecture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl lg:text-7xl font-extrabold leading-tight mb-6
              text-surface-900 dark:text-white"
          >
            Extract Knowledge
            <br />
            <span className="gradient-text">From Any Document</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg lg:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Upload PDFs, scanned documents, and images. Our AI extracts, analyzes, and lets you
            query your documents with intelligent, source-cited responses powered by
            Retrieval-Augmented Generation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold
                bg-gradient-to-r from-primary-500 to-accent-500 text-white
                shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30
                transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold
                glass dark:glass border border-surface-200 dark:border-white/10
                text-surface-700 dark:text-surface-200
                hover:bg-surface-100 dark:hover:bg-white/10
                transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex items-center justify-center gap-8 lg:gap-16 mt-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-surface-600 dark:text-surface-300 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Powerful AI Capabilities
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
              Everything you need to extract, analyze, and interact with your documents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group p-6 rounded-2xl card-hover cursor-default
                  bg-white/60 dark:bg-white/5 backdrop-blur-sm
                  border border-surface-200 dark:border-white/10
                  hover:border-primary-300 dark:hover:border-primary-500/30"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                    bg-gradient-to-br ${feature.color} shadow-lg`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-16 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl
            bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500
            shadow-2xl shadow-primary-500/25"
        >
          <Zap className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Extract Knowledge?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Start uploading your documents and experience the power of AI-driven knowledge extraction.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl
              bg-white text-primary-600 font-semibold text-base
              shadow-lg hover:shadow-xl transform hover:-translate-y-1
              transition-all duration-300"
          >
            Start Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-16 py-8 border-t border-surface-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
              AI Knowledge Extractor
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
            <Shield className="w-4 h-4" />
            <span>Built with LangChain, ChromaDB & Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
