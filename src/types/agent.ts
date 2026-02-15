export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'spawning' | 'running' | 'completed' | 'error';
  progress: number;
  task?: string;
  output?: string;
  lastActivity?: string;
  startedAt?: Date;
  completedAt?: Date;
  // OpenClaw session integration
  sessionKey?: string;
  prompt?: string;
  // Shared context for collaboration (read-only reference to task's shared context)
  sharedContext?: TaskSharedContext;
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

// Shared context for agent collaboration
export interface TaskSharedContext {
  task: string;
  type: 'website' | 'data-analysis' | 'research' | 'general';
  // Website-specific shared data
  website?: {
    components: string[];
    apiEndpoints: string[];
    designColors: string;
    features: string[];
  };
  // Research-specific shared data
  research?: {
    sources: string[];
    findings: string[];
    citations: string[];
    dataPoints: Record<string, unknown>[];
  };
  // Data analysis-specific shared data
  data?: {
    sources: string[];
    metrics: string[];
    charts: string[];
    insights: string[];
  };
  // General task data
  general?: {
    milestones: string[];
    deliverables: string[];
    notes: string[];
  };
  // Update log (tracks who updated what)
  updates?: {
    [key: string]: {
      agentId: string;
      timestamp: Date;
    };
  };
  // Agent messages (for real-time collaboration)
  agentMessages?: {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    type: 'info' | 'data' | 'request' | 'response';
    message: string;
    data?: any;
    timestamp: Date;
  }[];
}

export interface Task {
  id: string;
  command: string;
  type: 'website' | 'data-analysis' | 'research' | 'general';
  agents: Agent[];
  createdAt: Date;
  completedAt?: Date;
  // Shared context for collaboration
  sharedContext: TaskSharedContext;
  // Message log between agents
  agentMessages?: {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    type: 'info' | 'data' | 'request' | 'response';
    message: string;
    data?: any;
    timestamp: Date;
  }[];
}
