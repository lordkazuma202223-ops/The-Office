import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface StatusResponse {
  sessions: Array<{
    key: string;
    displayName: string;
    kind: string;
    updatedAt: string;
    status?: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    if (sessionKey) {
      // Get specific session status
      const response = await fetch(`${GATEWAY_URL}/api/sessions/history?sessionKey=${sessionKey}`, {
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch session status' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Get all active sessions
      const response = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch sessions' },
          { status: response.status }
        );
      }

      const data: StatusResponse = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
