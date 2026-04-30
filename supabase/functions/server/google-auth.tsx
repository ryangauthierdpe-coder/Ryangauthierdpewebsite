import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

export async function getGoogleAccessToken(serviceAccountEmail: string, serviceAccountKey: string): Promise<string> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const now = Math.floor(Date.now() / 1000);

  try {
    let privateKeyPem = serviceAccountKey;

    if (serviceAccountKey.trim().startsWith('{')) {
      const serviceAccountJson = JSON.parse(serviceAccountKey);
      privateKeyPem = serviceAccountJson.private_key;
    }

    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');

    if (!privateKeyPem.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyPem}\n-----END PRIVATE KEY-----`;
    }

    privateKeyPem = privateKeyPem.trim();
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');

    const jwt = await new SignJWT({
      scope: scopes.join(' '),
      aud: tokenUrl,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(serviceAccountEmail)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google OAuth error:', data);
      throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error in getGoogleAccessToken:', error);
    throw error;
  }
}
