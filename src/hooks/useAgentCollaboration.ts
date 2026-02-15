import { useState, useEffect, useCallback } from 'react';
import { AgentMessage } from '@/types/agent';

export function useAgentCollaboration(agentId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Send a message to another agent
  const sendMessage = useCallback(async (
    toAgentId: string,
    toAgentName: string,
    type: 'info' | 'data' | 'request' | 'response',
    message: string,
    data?: any
  ) => {
    try {
      const response = await fetch('/api/agents/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromSessionKey: agentId,
          toSessionKey: toAgentId,
          fromName: 'Current Agent',
          toName: toAgentName,
          type,
          message,
          data,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send agent message:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending agent message:', error);
      return false;
    }
  }, [agentId]);

  // Start listening for messages (poll-based for now)
  const startListening = useCallback(() => {
    setIsListening(true);

    const interval = setInterval(async () => {
      try {
        // Fetch session history for new messages
        const response = await fetch(`/api/agents/status?sessionKey=${agentId}`);

        if (response.ok) {
          const data = await response.json();

          // Check for agent messages in session history
          if (data.messages && Array.isArray(data.messages)) {
            const newMessages = data.messages.filter(
              (msg: AgentMessage) => !messages.find(m => m.id === msg.id)
            );

            if (newMessages.length > 0) {
              setMessages(prev => [...prev, ...newMessages]);
            }
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
      setIsListening(false);
    };
  }, [agentId, messages]);

  // Auto-start listening when agentId changes
  useEffect(() => {
    const cleanup = startListening();
    return cleanup;
  }, [startListening]);

  return {
    messages,
    sendMessage,
    isListening,
    clearMessages: () => setMessages([]),
  };
}
