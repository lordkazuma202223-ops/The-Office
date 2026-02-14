export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  task?: string;
  output?: string;
  lastActivity?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TaskCommand {
  id: string;
  command: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
  agentId?: string;
}

export interface GatewayMessage {
  type: 'command' | 'result' | 'error' | 'status';
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface Task {
  id: string;
  command: string;
  type: 'website' | 'data-analysis' | 'research' | 'general';
  agents: Agent[];
  createdAt: Date;
  completedAt?: Date;
}
