'use client';

import React from 'react';
import { Agent } from '@/types/agent';
import { AgentItem } from './AgentItem';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  agents: Agent[];
  title?: string;
}

export function Sidebar({ agents, title = 'Active Agents' }: SidebarProps) {
  const { isDarkMode } = useTheme();

  return (
    <aside
      className="hidden md:flex flex-shrink-0 flex-col w-80"
      style={{ backgroundColor: isDarkMode ? '#0f0f0f' : '#fafafa' }}
    >
      <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-yellow-400">⚡</span>
          {title}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{agents.length} agents deployed</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No agents active</p>
            <p className="text-gray-500 text-xs mt-2">Submit a task to deploy agents</p>
          </div>
        ) : (
          agents.map(agent => <AgentItem key={agent.id} agent={agent} />)
        )}
      </div>

      <div className="p-4 border-t text-xs text-gray-400" style={{ borderColor: isDarkMode ? '#333' : '#e0e0e0' }}>
        <p>Agent Task Dispatcher v1.0</p>
      </div>
    </aside>
  );
}
