import { Agent as AgentType } from '@/types/agent';

interface AgentCardProps {
  agent: AgentType;
  onClick?: () => void;
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'running':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400 dark:bg-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 border-current cursor-pointer transition-all hover:border-yellow-400/50 ${
        agent.status === 'running' ? 'border-yellow-400/30' : 'border-current'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{agent.name}</h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${
          agent.status === 'running' ? 'animate-pulse' : ''
        }`} />
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{agent.progress}%</span>
        </div>
        <div className="w-full bg-current/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>

      {agent.task && (
        <p className="text-sm opacity-70 truncate">
          {agent.task}
        </p>
      )}

      {agent.status === 'running' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-yellow-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-slow" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}
