'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskSharedContext } from '@/types/agent';
import {
  spawnAgents,
  executeAgentTask,
  executeAgentsInParallel,
  saveTaskToHistory,
  getTaskHistory,
  clearTaskHistory,
} from '@/lib/agentDispatcher-real';

interface TaskContextType {
  currentTask: Task | null;
  taskHistory: Task[];
  isRunning: boolean;
  // Shared context for agent collaboration
  sharedContext: TaskSharedContext;
  // Agent messages between agents
  agentMessages: {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    type: 'info' | 'data' | 'request' | 'response';
    message: string;
    data?: any;
    timestamp: Date;
  }[];
  submitTask: (command: string) => Promise<void>;
  clearHistory: () => void;
  // Function for agents to update shared context
  updateSharedContext: (agentId: string, key: string, value: any) => void;
  // Function for agents to send messages to other agents
  sendAgentMessage: (from: string, to: string, type: 'info' | 'data' | 'request' | 'response', message: string, data?: any) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [agentMessages, setAgentMessages] = useState<Task['agentMessages']>([]);

  // Initialize shared context for agent collaboration
  const initializeSharedContext = (taskType: Task['type'], command: string): TaskSharedContext => {
    const baseContext: TaskSharedContext = {
      task: command,
      type: taskType,
      updates: {},
    };

    switch (taskType) {
      case 'website':
        return {
          ...baseContext,
          website: {
            components: [],
            apiEndpoints: [],
            designColors: '',
            features: [],
          },
        };

      case 'research':
        return {
          ...baseContext,
          research: {
            sources: [],
            findings: [],
            citations: [],
            dataPoints: [],
          },
        };

      case 'data-analysis':
        return {
          ...baseContext,
          data: {
            sources: [],
            metrics: [],
            charts: [],
            insights: [],
          },
        };

      case 'general':
        return {
          ...baseContext,
          general: {
            milestones: [],
            deliverables: [],
            notes: [],
          },
        };

      default:
        return baseContext;
    }
  };

  // Function for agents to update shared context
  const updateSharedContext = (agentId: string, key: string, value: any) => {
    if (!currentTask) return;

    setCurrentTask(prev => {
      if (!prev) return null;

      // Initialize shared context if not exists
      const sharedContext = prev.sharedContext || initializeSharedContext(prev.type, prev.command);

      // Update log
      sharedContext.updates = {
        ...sharedContext.updates,
        [`${key}-${Date.now()}`]: {
          agentId,
          timestamp: new Date(),
        },
      };

      // Simple updates using any casts to bypass TypeScript strictness
      const context = sharedContext as any;
      
      if (context.website && (key === 'components' || key === 'apiEndpoints' || key === 'features')) {
        const existingArray = context.website[key] || [];
        context.website[key] = [...existingArray, ...(Array.isArray(value) ? value : [value])];
      } else if (context.website && key === 'designColors') {
        context.website.designColors = value;
      } else if (context.research && (key === 'sources' || key === 'findings' || key === 'citations')) {
        const existingArray = context.research[key] || [];
        context.research[key] = [...existingArray, ...(Array.isArray(value) ? value : [value])];
      } else if (context.research && key === 'dataPoints') {
        const existingArray = context.research.dataPoints || [];
        context.research.dataPoints = [...existingArray, ...(Array.isArray(value) ? value : [value])];
      } else if (context.data && (key === 'sources' || key === 'metrics' || key === 'charts' || key === 'insights')) {
        const existingArray = context.data[key] || [];
        context.data[key] = [...existingArray, ...(Array.isArray(value) ? value : [value])];
      } else if (context.general && (key === 'milestones' || key === 'deliverables' || key === 'notes')) {
        const existingArray = context.general[key] || [];
        context.general[key] = [...existingArray, ...(Array.isArray(value) ? value : [value])];
      }

      return {
        ...prev,
        sharedContext,
      };
    });
  };

  // Function for agents to send messages to other agents
  const sendAgentMessage = (
    from: string,
    fromName: string,
    to: string,
    toName: string,
    type: 'info' | 'data' | 'request' | 'response',
    message: string,
    data?: any
  ) => {
    const agentMessage = {
      from,
      fromName,
      to,
      toName,
      type,
      message,
      data,
      timestamp: new Date(),
    } as Task['agentMessages'][number];

    setAgentMessages(prev => [...prev, agentMessage]);

    // Update current task with message
    setCurrentTask(prev => {
      if (!prev) return null;

      const sharedContext = prev.sharedContext || initializeSharedContext(prev.type, prev.command);

      sharedContext.agentMessages = [...(sharedContext.agentMessages || []), agentMessage];

      return {
        ...prev,
        sharedContext,
        agentMessages: [...prev.agentMessages, agentMessage],
      };
    });
  };

  // Load task history on mount
  useEffect(() => {
    const history = getTaskHistory();
    setTaskHistory(history.tasks);
  }, []);

  const submitTask = async (command: string) => {
    if (isRunning) return;

    setIsRunning(true);
    setAgentMessages([]);

    // Detect task type
    const taskType: Task['type'] = command.toLowerCase().includes('website') ? 'website' :
          command.toLowerCase().includes('data') ? 'data-analysis' :
          command.toLowerCase().includes('research') ? 'research' : 'general';

    // Initialize shared context
    const sharedContext = initializeSharedContext(taskType, command);

    // Create new task with shared context
    const task: Task = {
      id: `task-${Date.now()}`,
      command,
      type: taskType,
      agents: spawnAgents(command).map(agent => ({
        ...agent,
        sharedContext: sharedContext, // Attach shared context to each agent
      })),
      createdAt: new Date(),
      sharedContext,
      agentMessages: [],
    };

    setCurrentTask(task);

    // Execute all agents in parallel
    await executeAgentsInParallel(
      task.agents,
      command,
      (agentId, progress, output) => {
        setCurrentTask(prev => {
          if (!prev) return null;
          return {
            ...prev,
            agents: prev.agents.map(a =>
              a.id === agentId
                  ? { ...a, progress, output: output || a.output, sharedContext: a.sharedContext }
                  : a
            ),
          };
        });
      },
      (agentId, status, output) => {
        setCurrentTask(prev => {
          if (!prev) return null;

          // Agent completed, can update shared context now
          return {
            ...prev,
            agents: prev.agents.map(a =>
              a.id === agentId
                  ? {
                      ...a,
                      status,
                      output: output || a.output,
                      completedAt: new Date(),
                      sharedContext: a.sharedContext
                    }
                  : a
            ),
          };
        });
      }
    );

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
        sharedContext: currentTask?.sharedContext,
        agentMessages,
        submitTask,
        clearHistory,
        updateSharedContext,
        sendAgentMessage,
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
