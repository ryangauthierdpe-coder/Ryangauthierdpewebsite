// Google Service Account Authentication Helper
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

export async function getGoogleAccessToken(serviceAccountEmail: string, serviceAccountKey: string): Promise<string> {
  console.log('🔐 Attempting to get Google access token...');
  console.log('📧 Service Account Email:', serviceAccountEmail);
  console.log('🔑 Private Key Length:', serviceAccountKey?.length || 0);
  
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  
  const now = Math.floor(Date.now() / 1000);
  
  try {
    // Check if the key is a JSON service account file
    let privateKeyPem = serviceAccountKey;
    
    if (serviceAccountKey.trim().startsWith('{')) {
      console.log('📦 Detected JSON service account file, extracting private_key...');
      try {
        const serviceAccountJson = JSON.parse(serviceAccountKey);
        privateKeyPem = serviceAccountJson.private_key;
        console.log('✅ Successfully extracted private_key from JSON');
      } catch (parseError) {
        console.error('❌ Failed to parse service account JSON:', parseError);
        throw new Error('Invalid service account JSON format');
      }
    }
    
    // Clean up the private key (replace escaped newlines with actual newlines)
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
    
    console.log('🔧 Private key first 50 chars:', privateKeyPem.substring(0, 50));
    console.log('🔧 Private key last 50 chars:', privateKeyPem.substring(privateKeyPem.length - 50));
    
    // Ensure the key has proper PEM format headers
    if (!privateKeyPem.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('⚠️  Private key missing headers, attempting to add them...');
      privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyPem}\n-----END PRIVATE KEY-----`;
    }
    
    // Remove any extra whitespace
    privateKeyPem = privateKeyPem.trim();
    
    console.log('🔧 Private key cleaned, attempting to import...');
    
    // Import the private key
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');
    
    console.log('✅ Private key imported successfully');
    
    // Create JWT using jose
    const jwt = await new SignJWT({
      scope: scopes.join(' '),
      aud: tokenUrl,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(serviceAccountEmail)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600) // 1 hour expiration
      .sign(privateKey);
    
    console.log('✅ JWT created successfully');
    console.log('🎫 JWT (first 50 chars):', jwt.substring(0, 50) + '...');
    
    // Exchange JWT for access token
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
      console.error('❌ Google OAuth error response:', JSON.stringify(data, null, 2));
      throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }
    
    console.log('✅ Access token obtained successfully');
    console.log('🎫 Token type:', data.token_type);
    console.log('⏱️  Expires in:', data.expires_in, 'seconds');
    
    return data.access_token;
  } catch (error) {
    console.error('❌ Error in getGoogleAccessToken:', error);
    throw error;
  }
}