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

    // Build tools invoke URL
    const invokeUrl = `${GATEWAY_URL}/tools/invoke`;
    console.log('[SPAWN] Invoke URL:', invokeUrl);

    // Spawn session via OpenClaw Gateway tools/invoke endpoint
    // This uses the sessions_spawn tool
    const response = await fetch(invokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: 'sessions_spawn',
        args: {
          task: body.task,
          sessionTarget: body.sessionTarget || 'isolated',
          cleanup: body.cleanup || 'delete',
          label: body.label,
        },
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

    const data = await response.json();
    console.log('[SPAWN] Invoke response data:', JSON.stringify(data, null, 2));

    // The /tools/invoke endpoint returns { ok: true, result }
    // We return just the result part for consistency
    if (data.ok && data.result) {
      return NextResponse.json(data.result);
    } else {
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('[SPAWN ERROR] Exception:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
