'use client';

import React from 'react';
import { Agent } from '@/types/agent';
import { useTheme } from '@/contexts/ThemeContext';

interface AgentItemProps {
  agent: Agent;
}

const statusColors = {
  idle: 'text-gray-400',
  running: 'text-yellow-400',
  completed: 'text-green-400',
  error: 'text-red-400',
};

const statusBgColors = {
  idle: 'bg-gray-400',
  running: 'bg-yellow-400',
  completed: 'bg-green-400',
  error: 'bg-red-400',
};

export function AgentItem({ agent }: AgentItemProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-3 mb-2 rounded-lg border transition-all duration-200"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        borderColor: isDarkMode ? '#333' : '#e0e0e0',
      }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-400 text-sm">{agent.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{agent.role}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[agent.status]}`}
          style={{ backgroundColor: isDarkMode ? `${statusBgColors[agent.status]}20` : `${statusBgColors[agent.status]}20` }}>
          {agent.status}
        </span>
      </div>

      <div className="mb-2">
        <div className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${agent.progress}%`,
              backgroundColor: agent.status === 'error' ? '#f87171' : '#facc15',
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{agent.progress}%</p>
      </div>

      {agent.output && (
        <div className="mt-2 p-2 rounded text-xs"
          style={{
            backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          }}>
          {agent.output}
        </div>
      )}

      {(agent.status === 'running' || agent.status === 'idle') && (
        <div className="flex gap-1 mt-2">
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
