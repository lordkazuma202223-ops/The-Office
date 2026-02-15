import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

export async function GET(request: NextRequest) {
  console.log('[STATUS] Route called');

  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    console.log('[STATUS] Request params:', { sessionKey });
    console.log('[STATUS] GATEWAY_URL:', GATEWAY_URL);
    console.log('[STATUS] GATEWAY_TOKEN:', GATEWAY_TOKEN ? 'SET' : 'NOT SET');

    if (!GATEWAY_TOKEN) {
      console.log('[STATUS ERROR] GATEWAY_TOKEN is not set!');
    }

    if (sessionKey) {
      // Get specific session history via tools/invoke
      const historyUrl = `${GATEWAY_URL}/tools/invoke`;
      console.log('[STATUS] Fetching history via tools/invoke');

      const response = await fetch(historyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          tool: 'sessions_history',
          args: {
            sessionKey: sessionKey,
          },
        }),
      });

      console.log('[STATUS] History response status:', response.status);
      console.log('[STATUS] History response ok:', response.ok);

      if (!response.ok) {
        const error = await response.text();
        console.log('[STATUS ERROR] Failed to fetch session history:', error);
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch session history', details: error },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[STATUS] History response data:', JSON.stringify(data, null, 2));

      // The /tools/invoke endpoint returns { ok: true, result }
      if (data.ok) {
        return NextResponse.json(data.result);
      } else {
        return NextResponse.json(data);
      }
    } else {
      // Get all active sessions via tools/invoke
      const listUrl = `${GATEWAY_URL}/tools/invoke`;
      console.log('[STATUS] Fetching sessions list via tools/invoke');

      const response = await fetch(listUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          tool: 'sessions_list',
          args: {},
        }),
      });

      console.log('[STATUS] List response status:', response.status);
      console.log('[STATUS] List response ok:', response.ok);

      if (!response.ok) {
        const error = await response.text();
        console.log('[STATUS ERROR] Failed to fetch sessions:', error);
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch sessions', details: error },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[STATUS] Sessions list response data:', JSON.stringify(data, null, 2));

      // The /tools/invoke endpoint returns { ok: true, result }
      if (data.ok) {
        return NextResponse.json(data.result);
      } else {
        return NextResponse.json(data);
      }
    }
  } catch (error) {
    console.error('[STATUS ERROR] Exception:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
