import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  FileText,
  Copy,
  Check,
  Trash2,
  Volume2,
  Globe,
  ChevronDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { queryDocuments, translateText, textToSpeech } from '../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

export default function QueryPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSources, setShowSources] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await queryDocuments(question);

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.answer,
        sources: result.sources || [],
        processingTime: result.processing_time,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to get response';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: `Error: ${errorMsg}`, isError: true },
      ]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTranslate = async (text, lang) => {
    try {
      const result = await translateText(text, lang);
      toast.success(`Translated to ${result.language_name}`);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: `**Translation (${result.language_name}):**\n\n${result.translated_text}`,
          isTranslation: true,
        },
      ]);
    } catch (err) {
      toast.error('Translation failed');
    }
  };

  const handleTTS = async (text) => {
    try {
      toast.loading('Generating audio...', { id: 'tts' });
      const result = await textToSpeech(text);
      toast.dismiss('tts');

      // Play audio
      const audio = new Audio(result.audio_url);
      audio.play();
      toast.success('Playing audio');
    } catch (err) {
      toast.dismiss('tts');
      toast.error('Text-to-speech failed');
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const toggleSources = (id) => {
    setShowSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-surface-900 dark:text-white"
          >
            Query Assistant
          </motion.h1>
          <p className="text-surface-600 dark:text-surface-300 mt-1">
            Ask questions about your uploaded documents
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              text-surface-500 hover:text-red-500 hover:bg-red-500/10
              transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-2xl bg-primary-500/10 mb-4">
              <Sparkles className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-2">
              Ask anything about your documents
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 max-w-md">
              Upload documents first, then ask questions. The AI will find relevant
              information and provide answers with source citations.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 max-w-lg justify-center">
              {[
                'What is this document about?',
                'Summarize the key findings',
                'What are the main conclusions?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl text-sm
                    bg-white/60 dark:bg-white/5 border border-surface-200 dark:border-white/10
                    text-surface-600 dark:text-surface-300
                    hover:border-primary-300 dark:hover:border-primary-500/30
                    hover:text-primary-600 dark:hover:text-primary-400
                    transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[75%] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md px-5 py-3'
                    : `rounded-2xl rounded-bl-md px-5 py-4 ${
                        msg.isError
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-white/70 dark:bg-white/5 border border-surface-200 dark:border-white/10'
                      }`
                }`}
              >
                <div
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'text-white'
                      : msg.isError
                      ? 'text-red-500'
                      : 'text-surface-800 dark:text-surface-200'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Actions for assistant messages */}
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-surface-200 dark:border-white/10">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleTTS(msg.content)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Language dropdown */}
                    <div className="relative group">
                      <button
                        className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                        title="Translate"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
                        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-white/10 py-1 min-w-[120px]">
                          {LANGUAGES.filter((l) => l.code !== 'en').map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleTranslate(msg.content, lang.code)}
                              className="w-full text-left px-3 py-1.5 text-sm
                                text-surface-700 dark:text-surface-200
                                hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400
                                transition-colors"
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sources toggle */}
                    {msg.sources && msg.sources.length > 0 && (
                      <button
                        onClick={() => toggleSources(msg.id)}
                        className="flex items-center gap-1 ml-auto px-2 py-1 rounded-lg text-xs
                          text-surface-500 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                      >
                        <FileText className="w-3 h-3" />
                        {msg.sources.length} sources
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            showSources[msg.id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}

                    {msg.processingTime && (
                      <span className="text-[10px] text-surface-400 dark:text-surface-500 ml-2">
                        {msg.processingTime}s
                      </span>
                    )}
                  </div>
                )}

                {/* Source Citations */}
                {showSources[msg.id] && msg.sources && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 space-y-2"
                  >
                    {msg.sources.map((src, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3 h-3 text-primary-500" />
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {src.filename}
                          </span>
                          {src.page_number && (
                            <span className="text-[10px] text-surface-400 dark:text-surface-500">
                              Page {src.page_number}
                            </span>
                          )}
                          <span className="text-[10px] text-surface-400 dark:text-surface-500 ml-auto">
                            {(src.relevance_score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-3">
                          {src.content}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-surface-600 dark:text-surface-200" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white/70 dark:bg-white/5 border border-surface-200 dark:border-white/10">
              <div className="ai-thinking">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-surface-200 dark:border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={loading}
            className="flex-1 px-5 py-3.5 rounded-2xl text-sm
              bg-white/70 dark:bg-white/5 backdrop-blur-sm
              border border-surface-200 dark:border-white/10
              text-surface-900 dark:text-white
              placeholder-surface-400 dark:placeholder-surface-500
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
              disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3.5 rounded-2xl
              bg-gradient-to-r from-primary-500 to-accent-500 text-white
              shadow-lg shadow-primary-500/25
              disabled:opacity-50 disabled:shadow-none
              hover:shadow-xl hover:-translate-y-0.5
              transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
