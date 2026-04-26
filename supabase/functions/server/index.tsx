import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

// Service type labels mapping
const SERVICE_TYPE_LABELS: { [key: string]: string } = {
  'pp-initial-asel': 'Private Pilot - Airplane Single Engine Land (ASEL)',
  'pp-initial-amel': 'Private Pilot - Airplane Multiengine Land (AMEL)',
  'pp-added-class': 'Added Category or Class Rating',
  'ir-airplane': 'Instrument Rating - Airplane',
  'cp-initial-asel': 'Commercial Pilot - Airplane Single Engine Land (ASEL)',
  'cp-initial-amel': 'Commercial Pilot - Airplane Multiengine Land (AMEL)',
  'cp-added-class': 'Added Category or Class Rating',
  'retest-flight-only': 'Retest - Flight Portion Only',
  'retest-ground-flight': 'Retest - Ground and Flight Portion',
  'foreign': 'Foreign Pilot',
  'military': 'Military Competency',
  'cfi-renewal': 'Flight Instructor Renewal',
  'ground-instructor': 'Ground Instructor',
  'sic': 'SIC Type Ratings',
  'soe': 'SOE Limitation Removals',
  'atp': 'ATP Limitation Removals',
  'remote': 'Remote Pilot Certificate',
  'night': 'Night Flight Limitation Removals',
};

const app = new Hono();

// Helper function to safely parse JSON
async function safeJsonParse(c: any) {
  try {
    const contentType = c.req.header('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return { error: 'Content-Type must be application/json', status: 400 };
    }

    const text = await c.req.text();
    if (!text || text.trim() === '') {
      return { error: 'Request body is empty', status: 400 };
    }

    const data = JSON.parse(text);
    return { data };
  } catch (error) {
    console.error('JSON parsing error:', error);
    return { error: 'Invalid JSON in request body', status: 400 };
  }
}

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

// Create a new booking
app.post("/make-server-e4d9f7d7/bookings", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }

  const bookingData = parseResult.data;

  // Generate unique booking ID
  const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create booking object with timestamp and status
  const booking = {
    ...bookingData,
    bookingId,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  // Save to database
  await kv.set(bookingId, booking);

  console.log('New booking created:', bookingId);

  // Send notification email to DPE (Ryan)
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (resendApiKey) {
    try {
      console.log('📧 Attempting to send notification email to DPE...');

      const formattedDate = new Date(booking.selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const serviceTypeLabel = SERVICE_TYPE_LABELS[booking.serviceType] || booking.serviceType;

      let notesSection = '';
      if (booking.notes && booking.notes.trim()) {
        notesSection = `
          <h3>Additional Notes:</h3>
          <p style="white-space: pre-wrap;">${booking.notes}</p>
        `;
      }

      const dpeEmailHtml = `
        <h2>🔔 New Appointment Request</h2>
        <p>You have received a new appointment request from <strong>${booking.name}</strong>.</p>

        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${booking.selectedTime}</li>
          <li><strong>Service:</strong> ${serviceTypeLabel}</li>
        </ul>

        <h3>Customer Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.name}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phone}</li>
          <li><strong>IACRA FTN:</strong> ${booking.iacraFtn}</li>
          <li><strong>Aircraft:</strong> ${booking.aircraftMakeModel}</li>
        </ul>

        ${notesSection}

        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Status:</strong> Pending Confirmation</p>

        <hr style="margin: 20px 0; border: none; border-top: 2px solid #10b981;">

        <p>Please log in to your admin dashboard to confirm or manage this appointment:</p>
        <p><a href="https://dperyan.com/admin" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Admin Dashboard</a></p>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DPE Booking System <noreply@dperyan.com>',
          to: ['ryangauthierdpe@gmail.com'],
          subject: `🔔 New Appointment Request - ${booking.name} on ${formattedDate}`,
          html: dpeEmailHtml,
        }),
      });

      const emailResult = await response.json();

      if (response.ok) {
        console.log('✅ Notification email sent to DPE for booking:', bookingId);
      } else {
        console.error('❌ Failed to send notification email to DPE:', emailResult);
      }
    } catch (emailError) {
      console.error('❌ Error sending notification email to DPE:', emailError);
      // Don't fail the booking if email fails
    }
  } else {
    console.error('❌ RESEND_API_KEY not found - cannot send notification email to DPE');
  }

  return c.json({
    success: true,
    bookingId,
    message: 'Booking created successfully'
  });
});

// Get all bookings
app.get("/make-server-e4d9f7d7/bookings", async (c) => {
  try {
    const bookings = await kv.getByPrefix('booking_');

    // Sort by creation date (newest first)
    const sortedBookings = bookings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ bookings: sortedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);