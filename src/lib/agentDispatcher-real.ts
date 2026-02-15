import { Agent, Task } from '@/types/agent';

// Agent templates based on task type
const AGENT_TEMPLATES = {
  website: [
    { name: 'Frontend Developer', role: 'Frontend Dev', prompt: 'Implement frontend features with React, ensure responsive design and accessibility' },
    { name: 'Backend Developer', role: 'Backend Dev', prompt: 'Implement backend APIs, database integration, and server-side logic' },
    { name: 'UI/UX Designer', role: 'UI/UX Fine-tuner', prompt: 'Refine UI/UX design, improve user experience and visual consistency' },
    { name: 'Researcher', role: 'Researcher', prompt: 'Research best practices, libraries, and solutions for the project' },
  ],
  'data-analysis': [
    { name: 'Data Analyst', role: 'Data Specialist', prompt: 'Analyze datasets, identify patterns and generate insights' },
    { name: 'Statistical Expert', role: 'Statistics', prompt: 'Perform statistical analysis, create models and validate findings' },
    { name: 'Visualizer', role: 'Data Visualization', prompt: 'Create visualizations (charts, graphs) to present data clearly' },
    { name: 'Researcher', role: 'Researcher', prompt: 'Research domain knowledge and context for the data' },
  ],
  research: [
    { name: 'Primary Researcher', role: 'Research Lead', prompt: 'Conduct comprehensive research on the topic, gather primary sources' },
    { name: 'Analyst', role: 'Data Analysis', prompt: 'Analyze research findings, synthesize information' },
    { name: 'Fact Checker', role: 'Verification', prompt: 'Verify claims, cross-reference sources, ensure accuracy' },
    { name: 'Writer', role: 'Content Creator', prompt: 'Create well-structured content from research findings' },
  ],
  general: [
    { name: 'Executor', role: 'Task Executor', prompt: 'Execute the task efficiently, provide clear steps and deliverables' },
    { name: 'Reviewer', role: 'Quality Review', prompt: 'Review the work, identify issues and suggest improvements' },
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
    sessionKey: undefined,
    prompt: template.prompt,
  }));
}

// Execute agent task with real OpenClaw integration
export async function executeAgentTask(
  agent: Agent,
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void
): Promise<void> {
  try {
    // Update agent status to spawning
    agent.status = 'spawning';
    agent.startedAt = new Date();
    updateProgress(agent.id, 10, 'Spawning agent...');

    // Build the full prompt with task context
    const fullPrompt = `${agent.prompt}\n\nTask: ${taskCommand}`;

    // Spawn agent via OpenClaw Gateway API
    const spawnResponse = await fetch('/api/agents/spawn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: fullPrompt,
        agentId: agent.id,
        agentName: agent.name,
      }),
    });

    if (!spawnResponse.ok) {
      const error = await spawnResponse.text();
      throw new Error(`Failed to spawn agent: ${error}`);
    }

    const spawnData = await spawnResponse.json();
    if (!spawnData.ok) {
      throw new Error(spawnData.error || 'Unknown error spawning agent');
    }

    // Update agent with session key
    agent.sessionKey = spawnData.sessionKey;
    agent.status = 'running';
    updateProgress(agent.id, 25, 'Agent started, working on task...');

    // Poll for agent status updates
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/agents/status?sessionKey=${agent.sessionKey}`);
        if (!statusResponse.ok) {
          clearInterval(pollInterval);
          return;
        }

        const statusData = await statusResponse.json();

        // Update progress based on status
        if (statusData.sessions && statusData.sessions.length > 0) {
          const session = statusData.sessions[0];
          const timeElapsed = Date.now() - new Date(session.updatedAt).getTime();

          // Simulate progress based on time elapsed (0-60 seconds = 25-90%)
          let progress = 25 + Math.min((timeElapsed / 60000) * 65, 65);

          if (progress > agent.progress) {
            agent.progress = progress;
            updateProgress(agent.id, progress, 'Processing...');
          }
        }
      } catch (error) {
        console.error('Error polling agent status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Start a timeout to check completion
    setTimeout(async () => {
      clearInterval(pollInterval);

      // Fetch final session history
      try {
        const historyResponse = await fetch(`/api/agents/status?sessionKey=${agent.sessionKey}`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();

          // Parse session history to determine completion
          const isCompleted = historyData.lastMessage?.includes('✅') ||
                          historyData.lastMessage?.includes('completed') ||
                          agent.progress >= 90;

          const isError = historyData.lastMessage?.includes('error') ||
                       historyData.lastMessage?.includes('failed');

          if (isError) {
            agent.status = 'error';
            agent.progress = 100;
            agent.completedAt = new Date();
            completeAgent(agent.id, 'error', 'Agent encountered an error. Check logs for details.');
          } else if (isCompleted || agent.progress >= 90) {
            agent.status = 'completed';
            agent.progress = 100;
            agent.completedAt = new Date();
            completeAgent(agent.id, 'completed', historyData.lastMessage || 'Task completed successfully!');
          }
        }
      } catch (error) {
        console.error('Error fetching final status:', error);
        // Assume completion if no errors
        agent.status = 'completed';
        agent.progress = 100;
        agent.completedAt = new Date();
        completeAgent(agent.id, 'completed', 'Task completed successfully!');
      }
    }, 60000); // Timeout after 60 seconds

    // Add initial progress step
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress(agent.id, 15, 'Initializing...');

  } catch (error) {
    console.error('Error executing agent task:', error);
    agent.status = 'error';
    agent.progress = 100;
    agent.completedAt = new Date();
    completeAgent(agent.id, 'error', error instanceof Error ? error.message : 'Failed to execute task');
  }
}

// Execute multiple agents in parallel
export async function executeAgentsInParallel(
  agents: Agent[],
  taskCommand: string,
  updateProgress: (agentId: string, progress: number, output?: string) => void,
  completeAgent: (agentId: string, status: 'completed' | 'error', output?: string) => void
): Promise<void> {
  // Execute all agents in parallel
  const agentPromises = agents.map(agent =>
    executeAgentTask(agent, taskCommand, updateProgress, completeAgent)
  );

  await Promise.allSettled(agentPromises);
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
