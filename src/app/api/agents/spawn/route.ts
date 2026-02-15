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
  console.log('[SPAWN] Route called');

  try {
    const body: SpawnRequest = await request.json();
    console.log('[SPAWN] Request body:', JSON.stringify(body, null, 2));

    // Get environment variables
    console.log('[SPAWN] GATEWAY_URL:', GATEWAY_URL);
    console.log('[SPAWN] GATEWAY_TOKEN:', GATEWAY_TOKEN ? 'SET' : 'NOT SET');

    if (!GATEWAY_TOKEN) {
      console.log('[SPAWN ERROR] GATEWAY_TOKEN is not set!');
    }

    if (!GATEWAY_URL) {
      console.log('[SPAWN ERROR] GATEWAY_URL is not set!');
    }

    // Build spawn URL
    const spawnUrl = `${GATEWAY_URL}/v1/sessions/spawn`;
    console.log('[SPAWN] Spawn URL:', spawnUrl);

    // Spawn session via OpenClaw Gateway sessions_spawn skill
    // This uses to correct OpenClaw API method
    const response = await fetch(spawnUrl, {
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

    console.log('[SPAWN] Spawn response status:', response.status);
    console.log('[SPAWN] Spawn response ok:', response.ok);

    if (!response.ok) {
      const error = await response.text();
      console.log('[SPAWN ERROR] Failed to spawn agent:', error);
      return NextResponse.json(
        { ok: false, error: `Failed to spawn agent: ${error}` },
        { status: response.status }
      );
    }

    const data: SpawnResponse = await response.json();
    console.log('[SPAWN] Spawn response data:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[SPAWN ERROR] Exception:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
