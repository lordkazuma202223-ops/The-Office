'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { storage } from '@/lib/storage';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

  useEffect(() => {
    // Load agents from localStorage or initialize with default agents
    const loaded = storage.getAgents();
    if (loaded.length === 0) {
      const defaultAgents: Agent[] = [
        {
          id: 'agent-main',
          name: 'Main Agent',
          status: 'idle',
          progress: 0,
        },
        {
          id: 'agent-sub-1',
          name: 'Sub Agent 1',
          status: 'idle',
          progress: 0,
        },
        {
          id: 'agent-sub-2',
          name: 'Sub Agent 2',
          status: 'idle',
          progress: 0,
        },
      ];
      storage.setAgents(defaultAgents);
      setAgents(defaultAgents);
    } else {
      setAgents(loaded);
    }
  }, []);

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    storage.updateAgent(id, updates);
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent))
    );
  };

  const addAgent = (name: string) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name,
      status: 'idle',
      progress: 0,
    };
    const updated = [...agents, newAgent];
    storage.setAgents(updated);
    setAgents(updated);
    return newAgent;
  };

  return {
    agents,
    selectedAgentId,
    setSelectedAgentId,
    updateAgent,
    addAgent,
  };
}
