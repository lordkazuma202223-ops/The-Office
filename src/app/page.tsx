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
      className="min-h-screen flex"
      style={{ backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}
    >
      {/* Left Sidebar */}
      <Sidebar agents={currentTask?.agents || []} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className="h-16 border-b flex items-center justify-between px-6"
          style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0f0f0f' : '#fafafa' }}
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-yellow-400">⚡</span>
            Agent Task Dispatcher
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

        {/* Command Input */}
        <CommandInput onSubmit={submitTask} isRunning={isRunning} />

        {/* Results Display */}
        <TaskResults task={currentTask} />
      </main>
    </div>
  );
}
