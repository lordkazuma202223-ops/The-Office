'use client';

import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';
import { CommandInput } from '@/components/CommandInput';
import { TaskResults } from '@/components/TaskResults';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TaskHistory } from '@/components/TaskHistory';
import { Task } from '@/types/agent';

export default function Home() {
  const { currentTask, submitTask, isRunning, clearHistory, taskHistory } = useTask();
  const { isDarkMode } = useTheme();

  const handleSelectHistoryTask = (task: Task) => {
    // For now, just log it - in production, you'd load it into currentTask
    console.log('Selected task:', task);
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}
    >
      {/* Mobile Header */}
      <div className="md:hidden h-14 border-b flex items-center justify-between px-4"
        style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0f0f0f' : '#fafafa' }}
      >
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span className="text-yellow-400">⚡</span>
          <span className="truncate" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            The Office
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <TaskHistory
            tasks={taskHistory}
            onSelectTask={handleSelectHistoryTask}
            onClearHistory={clearHistory}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Content */}
      <main className="flex-1 flex flex-col md:hidden">
        <div className="p-4">
          <CommandInput onSubmit={submitTask} isRunning={isRunning} />
        </div>
        <TaskResults task={currentTask} />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden h-16 border-t flex items-center justify-around px-4"
        style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0f0f0f' : '#fafafa' }}
      >
        <button
          onClick={() => console.log('Agents')}
          className="flex flex-col items-center gap-1 p-2 rounded-lg touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM6 3a3 3 0 11-6 0 3 3 0 016 0zm7-6a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
            Agents
          </span>
        </button>
        <button
          className="flex flex-col items-center gap-1 p-2 rounded-lg touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002 2v2M7 7h10" />
          </svg>
          <span className="text-xs" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
            Tasks
          </span>
        </button>
      </div>

      {/* Desktop Layout */}
      <Sidebar agents={currentTask?.agents || []} />
      <main className="hidden md:flex flex-1 flex flex-col">
        <header
          className="h-16 border-b flex items-center justify-between px-6"
          style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0f0f0f' : '#fafafa' }}
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-yellow-400">⚡</span>
            <span>The Office by Lofi</span>
          </h1>
          <div className="flex items-center gap-3">
            <TaskHistory
              tasks={taskHistory}
              onSelectTask={handleSelectHistoryTask}
              onClearHistory={clearHistory}
            />
            <ThemeToggle />
          </div>
        </header>

        <CommandInput onSubmit={submitTask} isRunning={isRunning} />
        <TaskResults task={currentTask} />
      </main>
    </div>
  );
}
