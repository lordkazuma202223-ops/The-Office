'use client';

import { useState, useEffect } from 'react';
import { TaskCommand } from '@/types/agent';
import { storage } from '@/lib/storage';

export function useCommands() {
  const [commands, setCommands] = useState<TaskCommand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load commands from localStorage
    const loaded = storage.getCommands();
    setCommands(loaded);
    setLoading(false);
  }, []);

  const addCommand = (command: string, agentId?: string) => {
    const newCommand: TaskCommand = {
      id: `cmd-${Date.now()}`,
      command,
      timestamp: new Date().toISOString(),
      status: 'pending',
      agentId,
    };

    storage.addCommand(newCommand);
    setCommands((prev) => [newCommand, ...prev]);
    return newCommand;
  };

  const updateCommand = (id: string, updates: Partial<TaskCommand>) => {
    storage.updateCommand(id, updates);
    setCommands((prev) =>
      prev.map((cmd) => (cmd.id === id ? { ...cmd, ...updates } : cmd))
    );
  };

  const clearCommands = () => {
    storage.clearCommands();
    setCommands([]);
  };

  return {
    commands,
    loading,
    addCommand,
    updateCommand,
    clearCommands,
  };
}
