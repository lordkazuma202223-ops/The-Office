import { GatewayMessage } from '@/types/agent';

export class OpenClawGateway {
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: GatewayMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string = 'ws://localhost:8765') {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('OpenClaw Gateway connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: GatewayMessage = JSON.parse(event.data);
          this.notifyHandlers(message);
        } catch (error) {
          console.error('Failed to parse gateway message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('OpenClaw Gateway error:', error);
      };

      this.ws.onclose = () => {
        console.log('OpenClaw Gateway disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to OpenClaw Gateway:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, delay);
    }
  }

  onMessage(handler: (message: GatewayMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  private notifyHandlers(message: GatewayMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  sendCommand(command: string, agentId?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: GatewayMessage = {
        type: 'command',
        payload: { command, agentId },
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Gateway not connected');
      return false;
    }
    return true;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const gateway = new OpenClawGateway();
