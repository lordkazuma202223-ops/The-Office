'use client';

import React, { useState, FormEvent } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CommandInputProps {
  onSubmit: (command: string) => Promise<void>;
  isRunning: boolean;
}

export function CommandInput({ onSubmit, isRunning }: CommandInputProps) {
  const [command, setCommand] = useState('');
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isRunning) {
      await onSubmit(command.trim());
      setCommand('');
    }
  };

  return (
    <div className="p-6 border-b" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="text-yellow-400">✦</span>
          Task Command
        </label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter your task (e.g., 'Create a website for a coffee shop')"
          className={`w-full p-4 rounded-lg resize-none text-sm transition-all duration-200 ${isDarkMode ? 'focus:ring-yellow-400' : 'focus:ring-yellow-500'}`}
          style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
            color: isDarkMode ? '#ffffff' : '#000000',
            minHeight: '120px',
          }}
          disabled={isRunning}
        />
        <button
          type="submit"
          disabled={isRunning || !command.trim()}
          className="mt-3 px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isDarkMode ? '#facc15' : '#eab308',
            color: '#000000',
          }}
        >
          {isRunning ? 'Processing...' : 'Deploy Agents'}
        </button>
      </form>
    </div>
  );
}
