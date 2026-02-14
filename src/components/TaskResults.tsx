'use client';

import React from 'react';
import { Task } from '@/types/agent';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskResultsProps {
  task: Task | null;
}

const statusColors = {
  idle: 'text-gray-400',
  running: 'text-yellow-400',
  completed: 'text-green-400',
  error: 'text-red-400',
};

export function TaskResults({ task }: TaskResultsProps) {
  const { isDarkMode } = useTheme();

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">No Active Task</h3>
          <p className="text-gray-400 text-sm">Submit a task to see agent results here</p>
        </div>
      </div>
    );
  }

  const completedCount = task.agents.filter(a => a.status === 'completed').length;
  const errorCount = task.agents.filter(a => a.status === 'error').length;
  const runningCount = task.agents.filter(a => a.status === 'running').length;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
        <h2 className="text-lg font-bold mb-2">Task Results</h2>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-400">Type:</span>{' '}
            <span className="font-semibold text-yellow-400">{task.type}</span>
          </div>
          <div>
            <span className="text-gray-400">Progress:</span>{' '}
            <span className="font-semibold">
              {completedCount + errorCount} / {task.agents.length}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Created: {new Date(task.createdAt).toLocaleTimeString()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            {completedCount > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${statusColors.completed}`}
                style={{ backgroundColor: '#22c55e20' }}>
                ✓ {completedCount} Completed
              </span>
            )}
            {errorCount > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${statusColors.error}`}
                style={{ backgroundColor: '#ef444420' }}>
                ✗ {errorCount} Error
              </span>
            )}
            {runningCount > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${statusColors.running}`}
                style={{ backgroundColor: '#facc1520' }}>
                ⟳ {runningCount} Running
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {task.agents.map(agent => (
            <div
              key={agent.id}
              className="p-4 rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderColor: isDarkMode ? '#333' : '#e0e0e0',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-yellow-400">{agent.name}</h4>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[agent.status]}`}>
                  {agent.status}
                </span>
              </div>

              {agent.output && (
                <div
                  className="mt-2 p-3 rounded text-sm font-mono whitespace-pre-wrap"
                  style={{
                    backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                  }}
                >
                  {agent.output}
                </div>
              )}

              {agent.completedAt && (
                <div className="mt-2 text-xs text-gray-400">
                  Completed: {new Date(agent.completedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
