export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  task?: string;
  lastActivity?: string;
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
  payload: any;
  timestamp: string;
}
