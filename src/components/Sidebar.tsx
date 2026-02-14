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
          <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{title}</span>
        </h2>
        <p className="text-sm mt-1" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
          {agents.length} agents deployed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: isDarkMode ? '#d4d4d4' : '#666666' }}>
              No agents active
            </p>
            <p className="text-xs mt-2" style={{ color: isDarkMode ? '#999999' : '#888888' }}>
              Submit a task to deploy agents
            </p>
          </div>
        ) : (
          agents.map(agent => <AgentItem key={agent.id} agent={agent} />)
        )}
      </div>

      <div className="p-4 border-t text-xs" 
           style={{ 
             borderColor: isDarkMode ? '#333' : '#e0e0e0',
             color: isDarkMode ? '#999999' : '#888888'
           }}>
        <p>Agent Task Dispatcher v1.0</p>
      </div>
    </aside>
  );
}
