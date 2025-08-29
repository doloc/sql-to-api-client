import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    console.log('[auth/token] incoming', {
      at: new Date().toISOString(),
      username,
    });

    if (!username || !password) {
      console.warn('[auth/token] missing credentials');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET;

    console.log('[auth/token] env check', {
      hasUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    });

    if (!keycloakUrl || !realm || !clientId || !clientSecret) {
      console.error('[auth/token] missing keycloak envs');
      return NextResponse.json({ error: 'Keycloak server is not configured' }, { status: 500 });
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('username', username);
    formData.append('password', password);

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('[auth/token] keycloak error', { status: response.status, body: data });
      return NextResponse.json({ error: data?.error_description || 'Authentication failed' }, { status: response.status });
    }
    console.log('[auth/token] success', {
      at: new Date().toISOString(),
      status: response.status,
      hasAccessToken: Boolean(data?.access_token),
      expiresIn: data?.expires_in,
      tokenType: data?.token_type,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[auth/token] unexpected error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


