import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface SpawnRequest {
  task: string;
  sessionTarget?: string;
  cleanup?: string;
  label?: string;
}

interface SpawnResponse {
  ok: boolean;
  sessionKey?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpawnRequest = await request.json();

    // Spawn session via OpenClaw Gateway sessions_spawn skill
    // This uses the correct OpenClaw API method
    const response = await fetch(`${GATEWAY_URL}/v1/sessions/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        task: body.task,
        sessionTarget: body.sessionTarget || 'isolated',
        cleanup: body.cleanup || 'delete',
        label: body.label,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to spawn agent:', error);
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
