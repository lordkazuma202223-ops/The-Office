import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

export async function POST(request: NextRequest) {
  console.log('[MESSAGE] Route called');

  try {
    const body = await request.json();
    console.log('[MESSAGE] Request body:', JSON.stringify(body, null, 2));

    console.log('[MESSAGE] GATEWAY_URL:', GATEWAY_URL);
    console.log('[MESSAGE] GATEWAY_TOKEN:', GATEWAY_TOKEN ? 'SET' : 'NOT SET');

    if (!GATEWAY_TOKEN) {
      console.log('[MESSAGE ERROR] GATEWAY_TOKEN is not set!');
      return NextResponse.json(
        { ok: false, error: 'Gateway token is not configured' },
        { status: 500 }
      );
    }

    const messageUrl = `${GATEWAY_URL}/tools/invoke`;
    console.log('[MESSAGE] Message URL:', messageUrl);

    // Send message via OpenClaw Gateway tools/invoke endpoint
    // This uses the sessions_send tool
    const response = await fetch(messageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: 'sessions_send',
        args: {
          sessionKey: body.toSessionKey,
          message: `[Message from ${body.fromName} (${body.type}): ${body.message}]`,
        },
      }),
    });

    console.log('[MESSAGE] Send response status:', response.status);
    console.log('[MESSAGE] Send response ok:', response.ok);

    if (!response.ok) {
      const error = await response.text();
      console.log('[MESSAGE ERROR] Failed to send agent message:', error);
      return NextResponse.json(
        { ok: false, error: `Failed to send message: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[MESSAGE] Send response data:', JSON.stringify(data, null, 2));

    // The /tools/invoke endpoint returns { ok: true, result }
    if (data.ok) {
      return NextResponse.json({ ok: true, data: data.result });
    } else {
      return NextResponse.json({ ok: false, error: data.error });
    }
  } catch (error) {
    console.error('[MESSAGE ERROR] Exception:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
