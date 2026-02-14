'use client';

import { TaskCommand } from '@/types/agent';

interface ResultsDisplayProps {
  commands: TaskCommand[];
}

export default function ResultsDisplay({ commands }: ResultsDisplayProps) {
  const getStatusColor = (status: TaskCommand['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-yellow-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: TaskCommand['status']) => {
    switch (status) {
      case 'completed':
        return '✓ Completed';
      case 'error':
        return '✗ Error';
      case 'running':
        return '⟳ Running';
      default:
        return '○ Pending';
    }
  };

  return (
    <div className="space-y-4">
      {commands.length === 0 ? (
        <div className="text-center py-16 opacity-50">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">No commands yet</p>
          <p className="text-sm mt-2">Enter a command above to get started</p>
        </div>
      ) : (
        commands.map((cmd) => (
          <div
            key={cmd.id}
            className="p-4 border-2 border-current rounded-lg hover:border-yellow-400/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <code className="text-sm font-mono bg-current/10 px-2 py-1 rounded">
                {cmd.command}
              </code>
              <span className={`text-sm ${getStatusColor(cmd.status)}`}>
                {getStatusLabel(cmd.status)}
              </span>
            </div>
            <p className="text-xs opacity-50 mb-2">
              {new Date(cmd.timestamp).toLocaleString()}
            </p>
            {cmd.result && (
              <div className="bg-current/5 p-3 rounded text-sm whitespace-pre-wrap">
                {cmd.result}
              </div>
            )}
            {cmd.error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-red-400">
                {cmd.error}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
