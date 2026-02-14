'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent, Task } from '@/types/agent';
import {
  spawnAgents,
  executeAgentTask,
  saveTaskToHistory,
  getTaskHistory,
  clearTaskHistory,
} from '@/lib/agentDispatcher';

interface TaskContextType {
  currentTask: Task | null;
  taskHistory: Task[];
  isRunning: boolean;
  submitTask: (command: string) => Promise<void>;
  clearHistory: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Load task history on mount
  useEffect(() => {
    const history = getTaskHistory();
    setTaskHistory(history.tasks);
  }, []);

  const submitTask = async (command: string) => {
    if (isRunning) return;

    setIsRunning(true);

    // Create new task
    const task: Task = {
      id: `task-${Date.now()}`,
      command,
      type: command.toLowerCase().includes('website') ? 'website' :
            command.toLowerCase().includes('data') ? 'data-analysis' :
            command.toLowerCase().includes('research') ? 'research' : 'general',
      agents: spawnAgents(command),
      createdAt: new Date(),
    };

    setCurrentTask(task);

    // Execute all agents in parallel
    const agentPromises = task.agents.map(agent =>
      executeAgentTask(
        agent.id,
        command,
        (agentId, progress, output) => {
          setCurrentTask(prev => {
            if (!prev) return null;
            return {
              ...prev,
              agents: prev.agents.map(a =>
                a.id === agentId
                  ? { ...a, progress, output: output || a.output }
                  : a
              ),
            };
          });
        },
        (agentId, status, output) => {
          setCurrentTask(prev => {
            if (!prev) return null;
            return {
              ...prev,
              agents: prev.agents.map(a =>
                a.id === agentId
                  ? { ...a, status, output: output || a.output, completedAt: new Date() }
                  : a
              ),
            };
          });
        }
      )
    );

    await Promise.all(agentPromises);

    // Mark task as completed
    task.completedAt = new Date();
    setCurrentTask({ ...task });

    // Save to history
    saveTaskToHistory(task);
    setTaskHistory(prev => [task, ...prev]);

    setIsRunning(false);
  };

  const clearHistory = () => {
    clearTaskHistory();
    setTaskHistory([]);
  };

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        taskHistory,
        isRunning,
        submitTask,
        clearHistory,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
