import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

const app = new Hono();

// Google Service Account Authentication Helper
async function getGoogleAccessToken(serviceAccountEmail: string, serviceAccountKey: string): Promise<string> {
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

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e4d9f7d7/health", (c) => {
  return c.json({ status: "ok" });
});

// Get busy times from Google Calendar
app.get("/make-server-e4d9f7d7/calendar/busy-times", async (c) => {
  try {
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const apiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');

    if (!calendarId || !apiKey) {
      return c.json({
        error: 'Google Calendar not configured. Please add GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_API_KEY environment variables.'
      }, 500);
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const timeMin = now.toISOString();
    const timeMax = endDate.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Calendar API error:', data);
      return c.json({
        error: 'Failed to fetch calendar data',
        details: data.error?.message || 'Unknown error'
      }, 500);
    }

    const busyTimes = data.items?.map((event: any) => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary || 'Busy',
    })) || [];

    console.log(`Fetched ${busyTimes.length} events from Google Calendar`);

    return c.json({ busyTimes });
  } catch (error) {
    console.error('Error fetching Google Calendar busy times:', error);
    return c.json({ error: 'Failed to fetch calendar busy times', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);