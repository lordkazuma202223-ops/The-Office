'use client';

import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useTheme } from '@/contexts/ThemeContext';

export function AgentCollaboration() {
  const { currentTask, agentMessages } = useTask();
  const { isDarkMode } = useTheme();

  if (!currentTask) return null;

  const messages = agentMessages || [];

  return (
    <div className="p-4 rounded-lg border"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        borderColor: isDarkMode ? '#333' : '#e0e0e0',
      }}>
      <h2 className="text-lg font-semibold text-yellow-400 mb-4">
        Agent Collaboration
      </h2>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            No collaboration messages yet. Agents will exchange information here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={`${msg.from}-${index}`}
              className="p-3 rounded"
              style={{
                backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                borderLeftWidth: '4px',
                borderLeftColor:
                  msg.type === 'info' ? '#3b82f6' :
                  msg.type === 'data' ? '#10b981' :
                  msg.type === 'request' ? '#f59e0b' : '#8b5cf6',
              }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">
                    {msg.fromName}
                  </span>
                  <span className="text-xs text-gray-500">
                    →
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {msg.toName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="mb-2">
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor:
                      msg.type === 'info' ? '#3b82f620' :
                      msg.type === 'data' ? '#10b98120' :
                      msg.type === 'request' ? '#f59e0b20' : '#8b5cf620',
                    color:
                      msg.type === 'info' ? '#60a5fa' :
                      msg.type === 'data' ? '#34d399' :
                      msg.type === 'request' ? '#fbbf24' : '#a78bfa',
                  }}>
                  {msg.type.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {msg.message}
              </p>

              {msg.data && (
                <div className="mt-2 p-2 rounded text-xs font-mono"
                  style={{
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f0f0',
                  }}>
                  <pre className="text-gray-400 overflow-x-auto">
                    {JSON.stringify(msg.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentTask.agents.some(a => a.status === 'running') && (
        <div className="flex gap-1 mt-4 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
