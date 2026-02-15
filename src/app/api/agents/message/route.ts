import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface AgentMessage {
  fromSessionKey: string;
  toSessionKey: string;
  fromName: string;
  toName: string;
  type: 'info' | 'data' | 'request' | 'response';
  message: string;
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentMessage = await request.json();

    // Send message via OpenClaw Gateway sessions_send
    const response = await fetch(`${GATEWAY_URL}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        sessionKey: body.toSessionKey,
        message: `[Message from ${body.fromName} (${body.type}): ${body.message}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { ok: false, error: `Failed to send message: ${error}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending agent message:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
