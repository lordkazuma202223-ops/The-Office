'use client';

import React from 'react';
import { Task } from '@/types/agent';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskResultsProps {
  task: Task | null;
}

const statusColors = {
  idle: 'text-gray-400',
  spawning: 'text-blue-400',
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
          <h3 className="text-xl font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            No Active Task
          </h3>
          <p className="text-sm" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
            Submit a task to see agent results here
          </p>
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
        <h2 className="text-lg font-bold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Task Results</h2>
        <div className="flex gap-4 text-sm">
          <div>
            <span style={{ color: isDarkMode ? '#999999' : '#666666' }}>Type:</span>{' '}
            <span className="font-semibold text-yellow-400">{task.type}</span>
          </div>
          <div>
            <span style={{ color: isDarkMode ? '#999999' : '#666666' }}>Progress:</span>{' '}
            <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
              {completedCount + errorCount} / {task.agents.length}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
          Created: {new Date(task.createdAt).toLocaleTimeString()}
        </div>
      </div>

      {/* Agent Messages Section */}
      {task.agentMessages && task.agentMessages.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            <span>💬</span>
            <span>Agent Messages ({task.agentMessages.length})</span>
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {task.agentMessages.map((msg, idx) => (
              <div
                key={idx}
                className="text-xs p-3 rounded border"
                style={{
                  borderColor: isDarkMode ? '#333' : '#e0e0e0',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                }}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className="font-semibold" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                    {msg.fromName}
                  </span>
                  <span style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                    → {msg.toName}
                  </span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded ${
                      msg.type === 'info' ? 'text-blue-400' :
                      msg.type === 'data' ? 'text-green-400' :
                      msg.type === 'request' ? 'text-yellow-400' :
                      'text-purple-400'
                    }`}
                  >
                    {msg.type}
                  </span>
                </div>
                <div className="mb-1" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                  {msg.message}
                </div>
                {msg.data && (
                  <div
                    className="p-2 rounded text-xs font-mono"
                    style={{
                      backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                      color: isDarkMode ? '#d4d4d4' : '#666666',
                    }}
                  >
                    {typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data, null, 2)}
                  </div>
                )}
                <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <p className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>{agent.role}</p>
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
                <div className="mt-2 text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                  Completed: {new Date(agent.completedAt).toLocaleTimeString()}
                </div>
              )}

              {agent.sharedContext && (
                <div
                  className="mt-2 p-2 rounded border"
                  style={{
                    backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
                    borderColor: isDarkMode ? '#333' : '#e0e0e0',
                  }}
                >
                  <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                    <span>📊</span>
                    <span>Shared Context Updates</span>
                  </div>
                  {Object.keys(agent.sharedContext).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(agent.sharedContext).map(([key, value]) => (
                        <div key={key} className="text-xs" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                          <span className="font-medium">{key}:</span>{' '}
                          <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                      No shared context updates
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Shared Context Section */}
      {task.sharedContext && (
        <div className="p-6 border-t" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            <span>🤝</span>
            <span>Global Shared Context</span>
          </h3>
          <div className="space-y-3">
            {task.sharedContext.website && Object.keys(task.sharedContext.website).length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                  Website Data
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(task.sharedContext.website).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 rounded text-xs border"
                      style={{
                        borderColor: isDarkMode ? '#333' : '#e0e0e0',
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                      }}
                    >
                      <div className="font-medium mb-1" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {key}
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                        {Array.isArray(value) ? `${value.length} items` : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.sharedContext.research && Object.keys(task.sharedContext.research).length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                  Research Data
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(task.sharedContext.research).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 rounded text-xs border"
                      style={{
                        borderColor: isDarkMode ? '#333' : '#e0e0e0',
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                      }}
                    >
                      <div className="font-medium mb-1" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {key}
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                        {Array.isArray(value) ? `${value.length} items` : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.sharedContext.data && Object.keys(task.sharedContext.data).length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                  Data Analysis
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(task.sharedContext.data).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 rounded text-xs border"
                      style={{
                        borderColor: isDarkMode ? '#333' : '#e0e0e0',
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                      }}
                    >
                      <div className="font-medium mb-1" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {key}
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                        {Array.isArray(value) ? `${value.length} items` : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.sharedContext.general && Object.keys(task.sharedContext.general).length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
                  General Task Data
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(task.sharedContext.general).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 rounded text-xs border"
                      style={{
                        borderColor: isDarkMode ? '#333' : '#e0e0e0',
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                      }}
                    >
                      <div className="font-medium mb-1" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {key}
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
                        {Array.isArray(value) ? `${value.length} items` : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
