import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  FileText,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Brain,
  Home,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/query', icon: MessageSquare, label: 'Query Assistant' },
  { path: '/summarize', icon: FileText, label: 'Summarize' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, toggle }) {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col
        bg-white/80 dark:bg-surface-800/90 backdrop-blur-xl
        border-r border-surface-200 dark:border-white/10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-200 dark:border-white/10">
        <div
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-xl
            bg-gradient-to-br from-primary-500 to-accent-500 cursor-pointer
            shadow-lg shadow-primary-500/25"
        >
          <Brain className="w-6 h-6 text-white" />
        </div>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-display font-bold text-base text-surface-900 dark:text-white leading-tight">
              AI Knowledge
            </h1>
            <p className="text-[11px] text-surface-500 dark:text-surface-300 font-medium">
              Extractor
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${
                isActive
                  ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-white/5 hover:text-surface-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-surface-200 dark:border-white/10 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
            text-surface-600 dark:text-surface-300
            hover:bg-surface-100 dark:hover:bg-white/5
            transition-all duration-200"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isOpen && (
            <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
            text-surface-600 dark:text-surface-300
            hover:bg-surface-100 dark:hover:bg-white/5
            transition-all duration-200"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          {isOpen && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
