import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const apiKey = process.env.FRONTEND_API_KEY || '';

  const pathStr = path.join('/');
  const queryStr = request.nextUrl.search;
  const targetUrl = `${backendUrl}/api/${pathStr}${queryStr}`;

  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'cookie', 'authorization'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Inyectar el FRONTEND_API_KEY para autenticación en la Jump PC
    if (apiKey) {
      headers.set('Authorization', `Bearer ${apiKey}`);
    }

    const body = request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.arrayBuffer()
      : undefined;

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store'
    });

    const resBody = await res.arrayBuffer();

    return new NextResponse(resBody, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json'
      }
    });
  } catch (err: any) {
    console.error(`[Proxy Error] failed to forward to ${targetUrl}:`, err);
    return NextResponse.json({ error: 'Failed to communicate with internal backend API' }, { status: 502 });
  }
}
