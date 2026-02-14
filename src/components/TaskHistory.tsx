'use client';

import React, { useState } from 'react';
import { Task } from '@/types/agent';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskHistoryProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onClearHistory: () => void;
}

export function TaskHistory({ tasks, onSelectTask, onClearHistory }: TaskHistoryProps) {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all duration-200 hover:opacity-80 flex items-center gap-2"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm hidden sm:inline" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
          History ({tasks.length})
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed right-0 top-12 left-0 md:left-auto md:w-80 w-full max-h-96 overflow-y-auto rounded-lg shadow-xl z-20 p-4"
            style={{
              backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-yellow-400 text-lg">Task History</h3>
              <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:opacity-80"
                  style={{ minHeight: '36px', minWidth: '36px' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            <div className="mb-3">
              {tasks.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistory();
                  }}
                  className="text-sm px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  style={{ minHeight: '40px' }}
                >
                  Clear All
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-center" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                No tasks yet
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-lg border transition-all duration-200 hover:border-yellow-400"
                    style={{
                      borderColor: isDarkMode ? '#333' : '#e0e0e0',
                      backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5',
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                      {new Date(task.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium truncate" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      {task.command}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded text-yellow-400"
                        style={{ backgroundColor: '#facc1520' }}>
                        {task.type}
                      </span>
                      <span className="text-xs" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                        {task.agents.length} agents
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
