import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    if (sessionKey) {
      // Get specific session history
      const response = await fetch(`${GATEWAY_URL}/v1/sessions/history?sessionKey=${sessionKey}`, {
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch session history', details: error },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Get all active sessions
      const response = await fetch(`${GATEWAY_URL}/v1/sessions/list`, {
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch sessions', details: error },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
