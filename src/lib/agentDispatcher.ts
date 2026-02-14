import { Agent, Task } from '@/types/agent';

// Agent templates based on task type
const AGENT_TEMPLATES = {
  website: [
    { name: 'Frontend Developer', role: 'Frontend Dev' },
    { name: 'Backend Developer', role: 'Backend Dev' },
    { name: 'UI/UX Designer', role: 'UI/UX Fine-tuner' },
    { name: 'Researcher', role: 'Researcher' },
  ],
  'data-analysis': [
    { name: 'Data Analyst', role: 'Data Specialist' },
    { name: 'Statistical Expert', role: 'Statistics' },
    { name: 'Visualizer', role: 'Data Visualization' },
    { name: 'Researcher', role: 'Researcher' },
  ],
  research: [
    { name: 'Primary Researcher', role: 'Research Lead' },
    { name: 'Analyst', role: 'Data Analysis' },
    { name: 'Fact Checker', role: 'Verification' },
    { name: 'Writer', role: 'Content Creator' },
  ],
  general: [
    { name: 'Executor', role: 'Task Executor' },
    { name: 'Reviewer', role: 'Quality Review' },
  ],
};

// Detect task type from command
export function detectTaskType(command: string): Task['type'] {
  const lowerCommand = command.toLowerCase();

  if (
    lowerCommand.includes('website') ||
    lowerCommand.includes('web app') ||
    lowerCommand.includes('create a site') ||
    lowerCommand.includes('build a site')
  ) {
    return 'website';
  }

  if (
    lowerCommand.includes('data') ||
    lowerCommand.includes('analysis') ||
    lowerCommand.includes('statistics') ||
    lowerCommand.includes('dataset')
  ) {
    return 'data-analysis';
  }

  if (
    lowerCommand.includes('research') ||
    lowerCommand.includes('find information') ||
    lowerCommand.includes('investigate') ||
    lowerCommand.includes('look up')
  ) {
    return 'research';
  }

  return 'general';
}

// Spawn agents based on task type
export function spawnAgents(command: string): Agent[] {
  const taskType = detectTaskType(command);
  const templates = AGENT_TEMPLATES[taskType];

  return templates.map((template, index) => ({
    id: `agent-${Date.now()}-${index}`,
    name: template.name,
    role: template.role,
    status: 'idle' as const,
    progress: 0,
    startedAt: undefined,
    completedAt: undefined,
  }));
}

// Simulate agent work (in production, this would integrate with OpenClaw Gateway)
export async function executeAgentTask(
  agentId: string,
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void
): Promise<void> {
  const agent = { id: agentId } as Agent;

  // Start the agent
  agent.status = 'running';
  agent.startedAt = new Date();

  // Simulate work with random progress updates
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));

    const progress = (i / steps) * 100;
    const outputs = [
      'Initializing...',
      'Analyzing requirements...',
      'Processing data...',
      'Generating output...',
      'Validating results...',
      'Finalizing...',
    ];
    const output = outputs[Math.floor(Math.random() * outputs.length)];

    updateProgress(agentId, progress, output);
  }

  // Complete the agent
  const isSuccessful = Math.random() > 0.1; // 90% success rate
  const status = isSuccessful ? 'completed' : 'error';
  agent.completedAt = new Date();

  completeAgent(agentId, status, isSuccessful ? 'Task completed successfully!' : 'Task failed. Please try again.');
}

// Store task in localStorage
export function saveTaskToHistory(task: Task): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getTaskHistory();
    history.tasks.push(task);
    localStorage.setItem('agent-task-history', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save task to history:', error);
  }
}

// Get task history from localStorage
export function getTaskHistory(): { tasks: Task[] } {
  if (typeof window === 'undefined') return { tasks: [] };

  try {
    const stored = localStorage.getItem('agent-task-history');
    return stored ? JSON.parse(stored) : { tasks: [] };
  } catch (error) {
    console.error('Failed to load task history:', error);
    return { tasks: [] };
  }
}

// Clear task history
export function clearTaskHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('agent-task-history');
  } catch (error) {
    console.error('Failed to clear task history:', error);
  }
}
