'use client';

import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ImageUpload from './components/ImageUpload';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with improved design */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 p-4 bg-white dark:bg-zinc-800 rounded-full shadow-lg">
            <span className="text-5xl">🏥</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Medical Assistant AI
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium">
            Your intelligent health companion powered by advanced AI
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>GPT-5 Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Secure & Private</span>
            </div>
          </div>
        </header>

        {/* Enhanced Tab Navigation */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative flex gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`relative flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">💬</span>
                <span className="text-lg">Disease Chat</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`relative flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">📄</span>
                <span className="text-lg">Report Analysis</span>
              </span>
            </button>
          </div>
        </div>

        {/* Content Area with animation */}
        <div className="max-w-5xl mx-auto">
          <div className="animate-slide-up">
            {activeTab === 'chat' ? <ChatInterface /> : <ImageUpload />}
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-yellow-500">⚠️</span>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Medical Disclaimer</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This tool provides information for educational purposes only and is NOT a substitute 
              for professional medical advice, diagnosis, or treatment. Always consult with qualified 
              healthcare professionals for medical decisions.
            </p>
          </div>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            © 2025 Medical Assistant AI. Powered by OpenAI GPT-4
          </p>
        </footer>
      </div>
    </div>
  );
}
