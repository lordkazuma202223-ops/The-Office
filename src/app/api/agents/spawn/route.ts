import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface SpawnRequest {
  task: string;
  agentId?: string;
  agentName?: string;
}

interface SpawnResponse {
  ok: boolean;
  sessionKey?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpawnRequest = await request.json();

    // Spawn agent via OpenClaw Gateway
    const response = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        task: body.task,
        sessionTarget: 'isolated',
        cleanup: 'delete',
        label: body.agentName || `Agent-${body.agentId}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { ok: false, error: `Failed to spawn agent: ${error}` },
        { status: response.status }
      );
    }

    const data: SpawnResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error spawning agent:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
