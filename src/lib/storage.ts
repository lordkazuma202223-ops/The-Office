import { TaskCommand, Agent } from '@/types/agent';

const STORAGE_KEYS = {
  COMMANDS: 'agent-task-dispatcher-commands',
  AGENTS: 'agent-task-dispatcher-agents',
} as const;

export const storage = {
  // Commands
  getCommands: (): TaskCommand[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.COMMANDS);
    return data ? JSON.parse(data) : [];
  },

  setCommands: (commands: TaskCommand[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
  },

  addCommand: (command: TaskCommand) => {
    const commands = storage.getCommands();
    commands.unshift(command);
    storage.setCommands(commands);
  },

  updateCommand: (id: string, updates: Partial<TaskCommand>) => {
    const commands = storage.getCommands();
    const index = commands.findIndex((c) => c.id === id);
    if (index !== -1) {
      commands[index] = { ...commands[index], ...updates };
      storage.setCommands(commands);
    }
  },

  clearCommands: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.COMMANDS);
  },

  // Agents
  getAgents: (): Agent[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
    return data ? JSON.parse(data) : [];
  },

  setAgents: (agents: Agent[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  },

  updateAgent: (id: string, updates: Partial<Agent>) => {
    const agents = storage.getAgents();
    const index = agents.findIndex((a) => a.id === id);
    if (index !== -1) {
      agents[index] = { ...agents[index], ...updates };
      storage.setAgents(agents);
    }
  },
};
