import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { getGoogleAccessToken } from "./google-auth.tsx";

// Service type labels mapping
const SERVICE_TYPE_LABELS: { [key: string]: string } = {
  'pp-initial-asel': 'Private Pilot - Airplane Single Engine Land (ASEL)',
  'pp-initial-amel': 'Private Pilot - Airplane Multiengine Land (AMEL)',
  'pp-added-class': 'Added Category or Class Rating',
  'ir-airplane': 'Instrument Rating - Airplane',
  'cp-initial-asel': 'Commercial Pilot - Airplane Single Engine Land (ASEL)',
  'cp-initial-amel': 'Commercial Pilot - Airplane Multiengine Land (AMEL)',
  'cp-added-class': 'Added Category or Class Rating',
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

// Helper function to generate Google Calendar URL for email
function generateGoogleCalendarUrlForEmail(booking: any, formattedDate: string, serviceTypeLabel: string): string {
  // Parse the time to extract start hour
  const timeMatch = booking.selectedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) {
    console.error('Failed to parse time:', booking.selectedTime);
    return '';
  }
  
  let startHour = parseInt(timeMatch[1]);
  const startMinutes = parseInt(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === 'PM' && startHour !== 12) {
    startHour += 12;
  } else if (period === 'AM' && startHour === 12) {
    startHour = 0;
  }
  
  // Parse duration from service type (default 6 hours)
  const SERVICE_DURATIONS: { [key: string]: number } = {
    'pp-initial-asel': 6,
    'pp-initial-amel': 6,
    'pp-added-class': 4,
    'ir-airplane': 6,
    'cp-initial-asel': 6,
    'cp-initial-amel': 6,
    'cp-added-class': 4,
    'foreign': 1,
    'military': 1,
    'cfi-renewal': 1,
    'ground-instructor': 1,
    'sic': 1,
    'soe': 1,
    'atp': 1,
    'remote': 1,
    'night': 1,
  };
  
  const duration = SERVICE_DURATIONS[booking.serviceType] || 6;
  const endHour = startHour + duration;
  
  // Create datetime strings for Google Calendar
  const [year, month, day] = booking.selectedDate.split('-');
  const startHourStr = startHour.toString().padStart(2, '0');
  const startMinutesStr = startMinutes.toString().padStart(2, '0');
  const endHourStr = endHour.toString().padStart(2, '0');
  const startDateTime = `${year}${month}${day}T${startHourStr}${startMinutesStr}00`;
  const endDateTime = `${year}${month}${day}T${endHourStr}${startMinutesStr}00`;
  
  const title = encodeURIComponent(`${serviceTypeLabel} - Checkride`);
  const details = encodeURIComponent(
    `Practical Test Appointment with Ryan Gauthier, DPE\\n\\n` +
    `Service: ${serviceTypeLabel}\\n` +
    `Applicant: ${booking.name}\\n` +
    `IACRA FTN: ${booking.iacraFtn}\\n` +
    `Aircraft: ${booking.aircraftMakeModel}\\n\\n` +
    `For questions, contact:\\n` +
    `Phone: 860-912-3283\\n` +
    `Email: RyanGauthierDPE@gmail.com`
  );
  const location = encodeURIComponent(booking.location || 'Westerly State Airport (WST), 56 Airport Road, Westerly, RI 02891');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
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

// Create admin user endpoint (one-time setup)
app.post("/make-server-e4d9f7d7/create-admin", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }
  
  const { email, password, name } = parseResult.data;
  
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Import Supabase client
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name: name || 'Admin' },
    // Automatically confirm the user's email since an email server hasn't been configured.
    email_confirm: true
  });

  if (error) {
    console.error('Error creating admin user:', error);
    return c.json({ error: error.message }, 400);
  }

  console.log('Admin user created successfully:', email);

  return c.json({ 
    success: true, 
    message: 'Admin user created successfully',
    userId: data.user.id
  });
});

// Admin login endpoint
app.post("/make-server-e4d9f7d7/admin-login", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }
  
  const { email, password } = parseResult.data;
  
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Import Supabase client
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error during admin login:', error);
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  if (!data.session) {
    return c.json({ error: 'Login failed - no session created' }, 401);
  }

  console.log('Admin user logged in successfully:', email);

  return c.json({ 
    success: true, 
    session: data.session,
    user: data.user
  });
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
        console.log('✅ Notification email sent to DPE for booking:', bookingId, 'Email ID:', emailResult.id);
      } else {
        console.error('❌ Failed to send notification email to DPE. Response:', emailResult);
        console.error('❌ Status:', response.status);
        console.error('❌ Full error details:', JSON.stringify(emailResult, null, 2));
        
        // If domain verification error, try fallback with resend.dev
        if (emailResult.statusCode === 403 && emailResult.message?.includes('not verified')) {
          console.log('⚠️  Attempting fallback with resend.dev domain...');
          try {
            const fallbackResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'DPE Booking System <noreply@resend.dev>',
                to: ['ryangauthierdpe@gmail.com'],
                subject: `🔔 New Appointment Request - ${booking.name} on ${formattedDate}`,
                html: dpeEmailHtml,
              }),
            });
            
            const fallbackResult = await fallbackResponse.json();
            
            if (fallbackResponse.ok) {
              console.log('✅ Notification email sent via fallback for booking:', bookingId, 'Email ID:', fallbackResult.id);
            } else {
              console.error('❌ Fallback notification email also failed:', fallbackResult);
            }
          } catch (fallbackError) {
            console.error('❌ Error sending fallback notification email:', fallbackError);
          }
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending notification email to DPE:', emailError);
      console.error('❌ Error details:', emailError instanceof Error ? emailError.message : String(emailError));
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

// Get a specific booking by ID
app.get("/make-server-e4d9f7d7/bookings/:id", async (c) => {
  try {
    const bookingId = c.req.param('id');
    const booking = await kv.get(bookingId);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    return c.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return c.json({ error: 'Failed to fetch booking', details: error.message }, 500);
  }
});

// Update booking status
app.put("/make-server-e4d9f7d7/bookings/:id", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }
  
  const bookingId = c.req.param('id');
  const { status, location, selectedDate, selectedTime, sendEmail = true } = parseResult.data;
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return c.json({ error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled' }, 400);
  }
  
  // Get existing booking
  const existingBooking = await kv.get(bookingId);
  if (!existingBooking) {
    return c.json({ error: 'Booking not found' }, 404);
  }
  
  // Check if date or time has changed
  const dateChanged = selectedDate && selectedDate !== existingBooking.selectedDate;
  const timeChanged = selectedTime && selectedTime !== existingBooking.selectedTime;
  const locationChanged = location && location !== existingBooking.location;
  
  // Check if status is changing
  const statusChanged = status !== existingBooking.status;
  const isChangingToConfirmed = statusChanged && status === 'confirmed';
  const isChangingToCancelled = statusChanged && status === 'cancelled';
  
  // Update booking with new status and optionally location, date, and time
  const updatedBooking = {
    ...existingBooking,
    status,
    ...(location && { location }),
    ...(selectedDate && { selectedDate }),
    ...(selectedTime && { selectedTime }),
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(bookingId, updatedBooking);
  
  console.log(`Booking ${bookingId} status updated to: ${status}${location ? ` with location: ${location}` : ''}${selectedDate ? ` on date: ${selectedDate}` : ''}${selectedTime ? ` at time: ${selectedTime}` : ''}`);
  
  // Send automatic confirmation email to customer if status is "confirmed"
  if (isChangingToConfirmed && sendEmail) {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    
    console.log('🔍 Environment Check:');
    console.log('  - RESEND_API_KEY:', resendApiKey ? '✅ Set' : '❌ Not Set');
    console.log('  - GOOGLE_CALENDAR_ID:', calendarId ? '✅ Set' : '❌ Not Set');
    console.log('  - GOOGLE_SERVICE_ACCOUNT_EMAIL:', serviceAccountEmail ? '✅ Set' : '❌ Not Set');
    console.log('  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', serviceAccountKey ? `✅ Set (${serviceAccountKey.length} chars)` : '❌ Not Set');
    
    // Create Google Calendar event using Service Account
    if (calendarId && serviceAccountEmail && serviceAccountKey) {
      console.log('🚀 All Google credentials available, proceeding with calendar event creation...');
      try {
        // Get OAuth access token using Service Account
        const accessToken = await getGoogleAccessToken(serviceAccountEmail, serviceAccountKey);
        
        console.log('✅ Successfully obtained Google access token');
        console.log('🔑 Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
        
        // Parse the time range (e.g., "9:00 AM - 3:00 PM")
        // selectedTime could be just start time or a range
        let startTimeStr = updatedBooking.selectedTime;
        let endTimeStr = updatedBooking.selectedTime;
        
        if (updatedBooking.selectedTime.includes(' - ')) {
          const [start, end] = updatedBooking.selectedTime.split(' - ');
          startTimeStr = start.trim();
          endTimeStr = end.trim();
        }
        
        // Parse start time
        const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!startTimeParts) {
          throw new Error('Invalid start time format');
        }
        
        let startHours = parseInt(startTimeParts[1]);
        const startMinutes = parseInt(startTimeParts[2]);
        const startPeriod = startTimeParts[3].toUpperCase();
        
        // Convert start time to 24-hour format
        if (startPeriod === 'PM' && startHours !== 12) {
          startHours += 12;
        } else if (startPeriod === 'AM' && startHours === 12) {
          startHours = 0;
        }
        
        // Create proper datetime string for start (YYYY-MM-DDTHH:mm:ss)
        const startTimeString = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
        const dateTimeString = `${updatedBooking.selectedDate}T${startTimeString}`;
        
        // Parse end time
        const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!endTimeParts) {
          throw new Error('Invalid end time format');
        }
        
        let endHours = parseInt(endTimeParts[1]);
        const endMinutes = parseInt(endTimeParts[2]);
        const endPeriod = endTimeParts[3].toUpperCase();
        
        // Convert end time to 24-hour format
        if (endPeriod === 'PM' && endHours !== 12) {
          endHours += 12;
        } else if (endPeriod === 'AM' && endHours === 12) {
          endHours = 0;
        }
        
        // Create proper datetime string for end
        const [year, month, day] = updatedBooking.selectedDate.split('-').map(Number);
        let endDay = day;
        let endMonth = month;
        let endYear = year;
        
        // Handle day overflow if end time is earlier than start time (next day)
        if (endHours < startHours) {
          endDay += 1;
          // Simple day overflow (not handling month/year overflow for simplicity)
        }
        
        const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
        const endDateTimeString = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T${endTimeString}`;
        
        const serviceTypeLabel = SERVICE_TYPE_LABELS[updatedBooking.serviceType] || updatedBooking.serviceType;
        
        const calendarEvent = {
          summary: `Checkride - ${updatedBooking.name}`,
          description: `PRACTICAL TEST APPOINTMENT\n\nApplicant: ${updatedBooking.name}\nEmail: ${updatedBooking.email}\nPhone: ${updatedBooking.phone}\nIACRA FTN: ${updatedBooking.iacraFtn}\nAircraft: ${updatedBooking.aircraftMakeModel}\n\nService: ${serviceTypeLabel}\nBooking ID: ${bookingId}`,
          location: updatedBooking.location || 'Westerly State Airport (WST), 56 Airport Road, Westerly, RI 02891',
          start: {
            dateTime: dateTimeString,
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: endDateTimeString,
            timeZone: 'America/New_York',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 }, // 1 hour before
            ],
          },
        };
        
        // Check if we should update existing event or create new one
        const shouldUpdateExistingEvent = updatedBooking.calendarEventId;
        const calendarUrl = shouldUpdateExistingEvent
          ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${updatedBooking.calendarEventId}`
          : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
        const calendarMethod = shouldUpdateExistingEvent ? 'PATCH' : 'POST';
        
        console.log(`📅 ${shouldUpdateExistingEvent ? 'Updating existing' : 'Creating new'} Google Calendar event...`);
        if (shouldUpdateExistingEvent) {
          console.log(`  - Existing Event ID: ${updatedBooking.calendarEventId}`);
        }
        
        const calendarResponse = await fetch(
          calendarUrl,
          {
            method: calendarMethod,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(calendarEvent),
          }
        );
        
        const calendarResult = await calendarResponse.json();
        
        if (calendarResponse.ok) {
          if (shouldUpdateExistingEvent) {
            console.log(`✅ Google Calendar event updated for booking ${bookingId}. Event ID: ${calendarResult.id}`);
          } else {
            console.log(`✅ Google Calendar event created for booking ${bookingId}. Event ID: ${calendarResult.id}`);
            
            // Save the calendar event ID to the booking for future reference (only for new events)
            updatedBooking.calendarEventId = calendarResult.id;
            await kv.set(bookingId, updatedBooking);
          }
        } else {
          console.error('❌ Failed to create/update Google Calendar event:', calendarResult);
          
          // If we tried to update but event not found (404 or 410), create a new one
          if (shouldUpdateExistingEvent && (calendarResponse.status === 404 || calendarResponse.status === 410)) {
            console.log(`⚠️ Calendar event not found (may have been deleted). Creating new event...`);
            
            try {
              const createResponse = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(calendarEvent),
                }
              );
              
              const createResult = await createResponse.json();
              
              if (createResponse.ok) {
                console.log(`✅ New Google Calendar event created for booking ${bookingId}. Event ID: ${createResult.id}`);
                
                // Save the new calendar event ID
                updatedBooking.calendarEventId = createResult.id;
                await kv.set(bookingId, updatedBooking);
              } else {
                console.error('❌ Failed to create new Google Calendar event:', createResult);
              }
            } catch (createError) {
              console.error('❌ Error creating new Google Calendar event:', createError);
            }
          }
        }
      } catch (calendarError) {
        console.error('❌ Error creating Google Calendar event:', calendarError);
        // Don't fail the confirmation if calendar creation fails
      }
    }
    
    if (resendApiKey) {
      try {
        const formattedDate = new Date(updatedBooking.selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const serviceTypeLabel = SERVICE_TYPE_LABELS[updatedBooking.serviceType] || updatedBooking.serviceType;
        
        // Use custom location if provided, otherwise default to Westerly State Airport
        const locationForEmail = updatedBooking.location || 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891';
        
        // Generate Google Calendar URL
        const calendarUrl = generateGoogleCalendarUrlForEmail(updatedBooking, formattedDate, serviceTypeLabel);
        
        const confirmationEmailHtml = `
          <p>Dear ${updatedBooking.name},</p>
          <p>Great news! Your appointment with Ryan Gauthier, DPE has been <strong>confirmed</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Time:</strong> ${updatedBooking.selectedTime}<br>
            <strong>Location:</strong> ${locationForEmail}
          </p>
          
          <div style=\"text-align: center; margin: 20px 0;\">
            <a href=\"${calendarUrl}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;\">
              📅 Add to Google Calendar
            </a>
            <p style=\"font-size: 12px; color: #666; margin-top: 8px;\">Click the button above to add this appointment to your personal calendar</p>
          </div>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>APPLICANT INFORMATION:</h3>
          <p>
            <strong>Name:</strong> ${updatedBooking.name}<br>
            <strong>Email Address:</strong> ${updatedBooking.email}<br>
            <strong>Phone Number:</strong> ${updatedBooking.phone}<br>
            <strong>IACRA FTN:</strong> ${updatedBooking.iacraFtn}<br>
            <strong>Aircraft:</strong> ${updatedBooking.aircraftMakeModel}
          </p>
          <p>Please advise if any of this information is incorrect.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>WHAT TO PREPARE:</h3>
          <p>Please visit <a href="http://www.DPERyan.com">www.DPERyan.com</a> and navigate to the Preparation page for important information to ensure you are fully prepared for your Practical Test.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>WEATHER:</h3>
          <p>We cannot begin the exam unless we have a reasonable expectation that we will be able to complete the exam, to include the flight. If you have any concerns that we will not be able to fly on the day of your practical test, please let me know in advance so that we may reschedule.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <p>If you need to reschedule or have any questions, please contact me:</p>
          <p>
            <strong>Phone:</strong> 860-912-3283<br>
            <strong>Email:</strong> RyanGauthierDPE@gmail.com
          </p>
          
          <p>I look forward to seeing you on ${formattedDate} at ${updatedBooking.selectedTime}!</p>
          
          <p>All the best,</p>
          <p>Ryan</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
            --<br>
            <strong>Ryan Gauthier</strong><br>
            Designated Pilot Examiner (DPE)<br>
            Boston FSDO: EA-61<br>
            Email: RyanGauthierDPE@gmail.com<br>
            Phone: 860-912-3283
          </p>
        `;
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ryan Gauthier DPE <noreply@dperyan.com>',
            to: [updatedBooking.email], // Send to the applicant
            cc: ['ryangauthierdpe@gmail.com'], // CC Ryan's email
            subject: `Appointment Confirmed - ${formattedDate} at ${updatedBooking.selectedTime}`,
            html: confirmationEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Confirmation email sent to ${updatedBooking.email} for booking ${bookingId}`);
        } else {
          console.error('❌ Failed to send confirmation email:', result);
          
          // Check if it's a domain verification error
          if (result.statusCode === 403 && result.message?.includes('verify a domain')) {
            console.error('⚠️  RESEND DOMAIN VERIFICATION REQUIRED:');
            console.error('   1. Go to https://resend.com/domains');
            console.error('   2. Add and verify your domain (dperyan.com)');
            console.error('   3. Update the "from" email to use your verified domain (e.g., noreply@dperyan.com)');
            console.error('   📧 In the meantime, emails can only be sent to: ryangauthierdpe@gmail.com');
            
            // Send a copy to the DPE's email so they have the confirmation details
            try {
              const fallbackResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Ryan Gauthier DPE <noreply@resend.dev>',
                  to: ['ryangauthierdpe@gmail.com'],
                  subject: `[COPY FOR YOUR RECORDS] Appointment Confirmed - ${updatedBooking.name} on ${formattedDate}`,
                  html: `
                    <p><strong>⚠️ Note:</strong> This is a copy of the confirmation email that should have been sent to ${updatedBooking.email}. 
                    Please forward this manually or contact the applicant directly.</p>
                    <hr style="margin: 20px 0;">
                    ${confirmationEmailHtml}
                  `,
                }),
              });
              
              if (fallbackResponse.ok) {
                console.log(`✅ Fallback email sent to ryangauthierdpe@gmail.com with confirmation details`);
              }
            } catch (fallbackError) {
              console.error('❌ Failed to send fallback email:', fallbackError);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }
  }
  
  // Delete Google Calendar event if status is changing to cancelled (regardless of sendEmail flag)
  if (isChangingToCancelled) {
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    
    if (updatedBooking.calendarEventId && calendarId && serviceAccountEmail && serviceAccountKey) {
      try {
        console.log(`🗑️ Attempting to delete Google Calendar event: ${updatedBooking.calendarEventId}`);
        
        // Get OAuth access token using Service Account
        const accessToken = await getGoogleAccessToken(serviceAccountEmail, serviceAccountKey);
        
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${updatedBooking.calendarEventId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (calendarResponse.ok || calendarResponse.status === 204) {
          console.log(`✅ Google Calendar event deleted for booking ${bookingId}`);
          updatedBooking.calendarEventId = null; // Clear the event ID
          await kv.set(bookingId, updatedBooking);
        } else {
          const errorText = await calendarResponse.text();
          console.error('❌ Failed to delete Google Calendar event:', errorText);
        }
      } catch (calendarError) {
        console.error('❌ Error deleting Google Calendar event:', calendarError);
        // Don't fail the cancellation if calendar deletion fails
      }
    }
  }
  
  // Send automatic cancellation email to customer if status is "cancelled" and sendEmail is true
  if (isChangingToCancelled && sendEmail) {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const formattedDate = new Date(updatedBooking.selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const cancellationEmailHtml = `
          <p>Dear ${updatedBooking.name},</p>
          <p>This email is to inform you that your appointment with Ryan Gauthier, DPE has been <strong>cancelled</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>CANCELLED APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Time:</strong> ${updatedBooking.selectedTime}<br>
            <strong>Location:</strong> Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891
          </p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>NEXT STEPS:</h3>
          <p>If you would like to reschedule your appointment, please contact me at your earliest convenience.</p>
          
          <p>
            <strong>Phone:</strong> 860-912-3283<br>
            <strong>Email:</strong> RyanGauthierDPE@gmail.com<br>
            <strong>Website:</strong> <a href="http://www.DPERyan.com">www.DPERyan.com</a>
          </p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <p>If you have any questions about this cancellation or would like to discuss rescheduling, please don't hesitate to reach out.</p>
          
          <p>All the best,</p>
          <p>Ryan</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
            --<br>
            <strong>Ryan Gauthier</strong><br>
            Designated Pilot Examiner (DPE)<br>
            Boston FSDO: EA-61<br>
            Email: RyanGauthierDPE@gmail.com<br>
            Phone: 860-912-3283
          </p>
        `;
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ryan Gauthier DPE <noreply@dperyan.com>',
            to: [updatedBooking.email], // Send to the applicant
            cc: ['ryangauthierdpe@gmail.com'], // CC Ryan's email
            subject: `Appointment Cancelled - ${formattedDate}`,
            html: cancellationEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Cancellation email sent to ${updatedBooking.email} for booking ${bookingId}`);
        } else {
          console.error('❌ Failed to send cancellation email:', result);
          
          // Check if it's a domain verification error
          if (result.statusCode === 403 && result.message?.includes('verify a domain')) {
            console.error('⚠️  RESEND DOMAIN VERIFICATION REQUIRED:');
            console.error('   1. Go to https://resend.com/domains');
            console.error('   2. Add and verify your domain (dperyan.com)');
            console.error('   3. Update the "from" email to use your verified domain (e.g., noreply@dperyan.com)');
            console.error('   📧 In the meantime, emails can only be sent to: ryangauthierdpe@gmail.com');
            
            // Send a copy to the DPE's email so they have the cancellation details
            try {
              const fallbackResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Ryan Gauthier DPE <noreply@resend.dev>',
                  to: ['ryangauthierdpe@gmail.com'],
                  subject: `[COPY FOR YOUR RECORDS] Appointment Cancelled - ${updatedBooking.name} on ${formattedDate}`,
                  html: `
                    <p><strong>⚠️ Note:</strong> This is a copy of the cancellation email that should have been sent to ${updatedBooking.email}. 
                    Please forward this manually or contact the applicant directly.</p>
                    <hr style="margin: 20px 0;">
                    ${cancellationEmailHtml}
                  `,
                }),
              });
              
              if (fallbackResponse.ok) {
                console.log(`✅ Fallback cancellation email sent to ryangauthierdpe@gmail.com`);
              }
            } catch (fallbackError) {
              console.error('❌ Failed to send fallback cancellation email:', fallbackError);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the status update if email fails
      }
    }
  }
  
  // Update Google Calendar event if date, time, or location changed (regardless of sendEmail flag)
  if ((dateChanged || timeChanged || locationChanged) && !isChangingToConfirmed && !isChangingToCancelled) {
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    
    if (updatedBooking.calendarEventId && calendarId && serviceAccountEmail && serviceAccountKey) {
      try {
        console.log(`📅 Updating Google Calendar event: ${updatedBooking.calendarEventId}`);
        
        // Get OAuth access token using Service Account
        const accessToken = await getGoogleAccessToken(serviceAccountEmail, serviceAccountKey);
        
        // Parse the time range
        let startTimeStr = updatedBooking.selectedTime;
        let endTimeStr = updatedBooking.selectedTime;
        
        if (updatedBooking.selectedTime.includes(' - ')) {
          const [start, end] = updatedBooking.selectedTime.split(' - ');
          startTimeStr = start.trim();
          endTimeStr = end.trim();
        }
        
        // Parse start time
        const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (startTimeParts) {
          let startHours = parseInt(startTimeParts[1]);
          const startMinutes = parseInt(startTimeParts[2]);
          const startPeriod = startTimeParts[3].toUpperCase();
          
          if (startPeriod === 'PM' && startHours !== 12) {
            startHours += 12;
          } else if (startPeriod === 'AM' && startHours === 12) {
            startHours = 0;
          }
          
          const startTimeString = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
          const dateTimeString = `${updatedBooking.selectedDate}T${startTimeString}`;
          
          // Parse end time
          const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (endTimeParts) {
            let endHours = parseInt(endTimeParts[1]);
            const endMinutes = parseInt(endTimeParts[2]);
            const endPeriod = endTimeParts[3].toUpperCase();
            
            if (endPeriod === 'PM' && endHours !== 12) {
              endHours += 12;
            } else if (endPeriod === 'AM' && endHours === 12) {
              endHours = 0;
            }
            
            const [year, month, day] = updatedBooking.selectedDate.split('-').map(Number);
            let endDay = day;
            let endMonth = month;
            let endYear = year;
            
            if (endHours < startHours) {
              endDay += 1;
            }
            
            const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
            const endDateTimeString = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T${endTimeString}`;
            
            const serviceTypeLabel = SERVICE_TYPE_LABELS[updatedBooking.serviceType] || updatedBooking.serviceType;
            
            const updatedCalendarEvent = {
              summary: `Checkride - ${updatedBooking.name}`,
              description: `PRACTICAL TEST APPOINTMENT\\n\\nApplicant: ${updatedBooking.name}\\nEmail: ${updatedBooking.email}\\nPhone: ${updatedBooking.phone}\\nIACRA FTN: ${updatedBooking.iacraFtn}\\nAircraft: ${updatedBooking.aircraftMakeModel}\\n\\nService: ${serviceTypeLabel}\\nBooking ID: ${bookingId}`,
              location: updatedBooking.location || 'Westerly State Airport (WST), 56 Airport Road, Westerly, RI 02891',
              start: {
                dateTime: dateTimeString,
                timeZone: 'America/New_York',
              },
              end: {
                dateTime: endDateTimeString,
                timeZone: 'America/New_York',
              },
            };
            
            const calendarResponse = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${updatedBooking.calendarEventId}`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCalendarEvent),
              }
            );
            
            if (calendarResponse.ok) {
              console.log(`✅ Google Calendar event updated for booking ${bookingId}`);
            } else {
              const errorText = await calendarResponse.text();
              console.error('❌ Failed to update Google Calendar event:', errorText);
              
              // If event not found (404), create a new one
              if (calendarResponse.status === 404 || calendarResponse.status === 410) {
                console.log(`⚠️ Calendar event not found (may have been deleted). Creating new event...`);
                
                const createResponse = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedCalendarEvent),
                  }
                );
                
                if (createResponse.ok) {
                  const newEvent = await createResponse.json();
                  console.log(`✅ New Google Calendar event created for booking ${bookingId}. Event ID: ${newEvent.id}`);
                  
                  // Save the new calendar event ID
                  updatedBooking.calendarEventId = newEvent.id;
                  await kv.set(bookingId, updatedBooking);
                } else {
                  const createErrorText = await createResponse.text();
                  console.error('❌ Failed to create new Google Calendar event:', createErrorText);
                }
              }
            }
          }
        }
      } catch (calendarError) {
        console.error('❌ Error updating Google Calendar event:', calendarError);
      }
    } else if (!updatedBooking.calendarEventId && calendarId && serviceAccountEmail && serviceAccountKey) {
      // No calendar event exists - create a new one
      try {
        console.log(`📅 No calendar event exists. Creating new Google Calendar event for booking ${bookingId}...`);
        
        // Get OAuth access token using Service Account
        const accessToken = await getGoogleAccessToken(serviceAccountEmail, serviceAccountKey);
        
        // Parse the time range
        let startTimeStr = updatedBooking.selectedTime;
        let endTimeStr = updatedBooking.selectedTime;
        
        if (updatedBooking.selectedTime.includes(' - ')) {
          const [start, end] = updatedBooking.selectedTime.split(' - ');
          startTimeStr = start.trim();
          endTimeStr = end.trim();
        }
        
        // Parse start time
        const startTimeParts = startTimeStr.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
        if (startTimeParts) {
          let startHours = parseInt(startTimeParts[1]);
          const startMinutes = parseInt(startTimeParts[2]);
          const startPeriod = startTimeParts[3].toUpperCase();
          
          if (startPeriod === 'PM' && startHours !== 12) {
            startHours += 12;
          } else if (startPeriod === 'AM' && startHours === 12) {
            startHours = 0;
          }
          
          const startTimeString = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
          const dateTimeString = `${updatedBooking.selectedDate}T${startTimeString}`;
          
          // Parse end time
          const endTimeParts = endTimeStr.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
          if (endTimeParts) {
            let endHours = parseInt(endTimeParts[1]);
            const endMinutes = parseInt(endTimeParts[2]);
            const endPeriod = endTimeParts[3].toUpperCase();
            
            if (endPeriod === 'PM' && endHours !== 12) {
              endHours += 12;
            } else if (endPeriod === 'AM' && endHours === 12) {
              endHours = 0;
            }
            
            const [year, month, day] = updatedBooking.selectedDate.split('-').map(Number);
            let endDay = day;
            let endMonth = month;
            let endYear = year;
            
            if (endHours < startHours) {
              endDay += 1;
            }
            
            const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
            const endDateTimeString = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T${endTimeString}`;
            
            const serviceTypeLabel = SERVICE_TYPE_LABELS[updatedBooking.serviceType] || updatedBooking.serviceType;
            
            const newCalendarEvent = {
              summary: `Checkride - ${updatedBooking.name}`,
              description: `PRACTICAL TEST APPOINTMENT\\\\n\\\\nApplicant: ${updatedBooking.name}\\\\nEmail: ${updatedBooking.email}\\\\nPhone: ${updatedBooking.phone}\\\\nIACRA FTN: ${updatedBooking.iacraFtn}\\\\nAircraft: ${updatedBooking.aircraftMakeModel}\\\\n\\\\nService: ${serviceTypeLabel}\\\\nBooking ID: ${bookingId}`,
              location: updatedBooking.location || 'Westerly State Airport (WST), 56 Airport Road, Westerly, RI 02891',
              start: {
                dateTime: dateTimeString,
                timeZone: 'America/New_York',
              },
              end: {
                dateTime: endDateTimeString,
                timeZone: 'America/New_York',
              },
            };
            
            const createResponse = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCalendarEvent),
              }
            );
            
            if (createResponse.ok) {
              const newEvent = await createResponse.json();
              console.log(`✅ New Google Calendar event created for booking ${bookingId}. Event ID: ${newEvent.id}`);
              
              // Save the new calendar event ID
              updatedBooking.calendarEventId = newEvent.id;
              await kv.set(bookingId, updatedBooking);
            } else {
              const errorText = await createResponse.text();
              console.error('❌ Failed to create new Google Calendar event:', errorText);
            }
          }
        }
      } catch (calendarError) {
        console.error('❌ Error creating Google Calendar event:', calendarError);
      }
    }
  }
  
  // Send "appointment updated" email if date, time, or location changed (and sendEmail is true)
  if ((dateChanged || timeChanged || locationChanged) && !isChangingToConfirmed && !isChangingToCancelled && sendEmail) {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const formattedDate = new Date(updatedBooking.selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const serviceTypeLabel = SERVICE_TYPE_LABELS[updatedBooking.serviceType] || updatedBooking.serviceType;
        const locationForEmail = updatedBooking.location || 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891';
        
        // Highlight style for changed fields
        const highlightStyle = 'background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; font-weight: bold;';
        
        const updateEmailHtml = `
          <p>Dear ${updatedBooking.name},</p>
          <p>This email is to inform you that your appointment with Ryan Gauthier, DPE has been <strong>updated</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>UPDATED APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Service:</strong> ${serviceTypeLabel}<br>
            <strong>Date:</strong> ${dateChanged ? `<span style="${highlightStyle}">${formattedDate}</span>` : formattedDate}<br>
            <strong>Time:</strong> ${timeChanged ? `<span style="${highlightStyle}">${updatedBooking.selectedTime}</span>` : updatedBooking.selectedTime}<br>
            <strong>Location:</strong> ${locationChanged ? `<span style="${highlightStyle}">${locationForEmail}</span>` : locationForEmail}
          </p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>APPLICANT INFORMATION:</h3>
          <p>
            <strong>Name:</strong> ${updatedBooking.name}<br>
            <strong>Email Address:</strong> ${updatedBooking.email}<br>
            <strong>Phone Number:</strong> ${updatedBooking.phone}<br>
            <strong>IACRA FTN:</strong> ${updatedBooking.iacraFtn}<br>
            <strong>Aircraft:</strong> ${updatedBooking.aircraftMakeModel}
          </p>
          <p>Please advise if any of this information is incorrect.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>WHAT TO PREPARE:</h3>
          <p>Please visit <a href="http://www.DPERyan.com">www.DPERyan.com</a> and navigate to the Preparation page for important information to ensure you are fully prepared for your Practical Test.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <p>If you have any questions about this change or need to discuss further modifications, please contact me:</p>
          <p>
            <strong>Phone:</strong> 860-912-3283<br>
            <strong>Email:</strong> RyanGauthierDPE@gmail.com
          </p>
          
          <p>I look forward to seeing you on ${formattedDate} at ${updatedBooking.selectedTime}!</p>
          
          <p>All the best,</p>
          <p>Ryan</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
            --<br>
            <strong>Ryan Gauthier</strong><br>
            Designated Pilot Examiner (DPE)<br>
            Boston FSDO: EA-61<br>
            Email: RyanGauthierDPE@gmail.com<br>
            Phone: 860-912-3283
          </p>
        `;
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ryan Gauthier DPE <noreply@dperyan.com>',
            to: [updatedBooking.email],
            cc: ['ryangauthierdpe@gmail.com'],
            subject: `Appointment Updated - ${formattedDate}`,
            html: updateEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Appointment update email sent to ${updatedBooking.email} for booking ${bookingId}`);
        } else {
          console.error('❌ Failed to send appointment update email:', result);
          
          // Fallback if domain verification error
          if (result.statusCode === 403 && result.message?.includes('verify a domain')) {
            try {
              const fallbackResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Ryan Gauthier DPE <noreply@resend.dev>',
                  to: ['ryangauthierdpe@gmail.com'],
                  subject: `[COPY FOR YOUR RECORDS] Appointment Updated - ${updatedBooking.name} on ${formattedDate}`,
                  html: `
                    <p><strong>⚠️ Note:</strong> This is a copy of the update email that should have been sent to ${updatedBooking.email}. 
                    Please forward this manually or contact the applicant directly.</p>
                    <hr style="margin: 20px 0;">
                    ${updateEmailHtml}
                  `,
                }),
              });
              
              if (fallbackResponse.ok) {
                console.log(`✅ Fallback appointment update email sent to ryangauthierdpe@gmail.com`);
              }
            } catch (fallbackError) {
              console.error('❌ Failed to send fallback appointment update email:', fallbackError);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending appointment update email:', emailError);
      }
    }
  }
  
  return c.json({ 
    success: true, 
    booking: updatedBooking,
    message: 'Booking status updated successfully'
  });
});

// Send email reminder for a booking
app.post("/make-server-e4d9f7d7/bookings/:id/send-reminder", async (c) => {
  try {
    const bookingId = c.req.param('id');
    const booking = await kv.get(bookingId);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Check if Resend API key is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return c.json({ error: 'Email service not configured. Please add RESEND_API_KEY environment variable.' }, 500);
    }
    
    // Format the date
    const formattedDate = new Date(booking.selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Prepare email content
    const emailHtml = `
      <p>Dear ${booking.name},</p>
      <p>This is a reminder of your upcoming appointment with Ryan Gauthier, DPE.</p>
      
      <h3>APPOINTMENT DETAILS:</h3>
      <p>
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${booking.selectedTime}<br>
        <strong>Location:</strong> Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891
      </p>
      
      <h3>WHAT TO PREPARE:</h3>
      <p>Please visit <a href="http://www.DPERyan.com">www.DPERyan.com</a> and navigate to the Preparation page for important information to ensure you are fully prepared for your Practical Test.</p>
      
      <h3>WEATHER:</h3>
      <p>We cannot begin the exam unless we have a reasonable expectation that we will be able to complete the exam, to include the flight. If you have any concerns that we will not be able to fly on the day of your practical test, please let me know in advance so that we may reschedule.</p>
      
      <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
      
      <p>If you have any questions or concerns, please contact me:</p>
      <p>
        <strong>Phone:</strong> 860-912-3283<br>
        <strong>Email:</strong> RyanGauthierDPE@gmail.com
      </p>
      
      <p>I look forward to seeing you on ${formattedDate} at ${booking.selectedTime}!</p>
      
      <p>All the best,</p>
      <p>Ryan</p>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
        --<br>
        <strong>Ryan Gauthier</strong><br>
        Designated Pilot Examiner (DPE)<br>
        Boston FSDO: EA-61<br>
        Email: RyanGauthierDPE@gmail.com<br>
        Phone: 860-912-3283
      </p>
    `;
    
    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ryan Gauthier DPE <noreply@dperyan.com>',
        to: [booking.email],
        subject: `Appointment Reminder - ${formattedDate} at ${booking.selectedTime}`,
        html: emailHtml,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Resend API error:', result);
      return c.json({ error: 'Failed to send email', details: result }, 500);
    }
    
    console.log(`Email reminder sent for booking ${bookingId} to ${booking.email}`);
    
    return c.json({ 
      success: true, 
      message: 'Email reminder sent successfully',
      emailId: result.id
    });
  } catch (error) {
    console.error('Error sending email reminder:', error);
    return c.json({ error: 'Failed to send email reminder', details: error.message }, 500);
  }
});

// Delete a booking
app.delete("/make-server-e4d9f7d7/bookings/:id", async (c) => {
  try {
    const bookingId = c.req.param('id');
    const sendEmail = c.req.query('sendEmail') !== 'false'; // Default to true unless explicitly set to 'false'
    const booking = await kv.get(bookingId);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Delete Google Calendar event if it exists
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    
    if (booking.calendarEventId && calendarId && serviceAccountEmail && serviceAccountKey) {
      try {
        console.log(`🗑️ Attempting to delete Google Calendar event: ${booking.calendarEventId}`);
        
        // Get OAuth access token using Service Account
        const accessToken = await getGoogleAccessToken(serviceAccountEmail, serviceAccountKey);
        
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${booking.calendarEventId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (calendarResponse.ok || calendarResponse.status === 204) {
          console.log(`✅ Google Calendar event deleted for booking ${bookingId}`);
        } else {
          const errorText = await calendarResponse.text();
          console.error('❌ Failed to delete Google Calendar event:', errorText);
        }
      } catch (calendarError) {
        console.error('❌ Error deleting Google Calendar event:', calendarError);
        // Don't fail the deletion if calendar deletion fails
      }
    }
    
    // Send cancellation email to applicant
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && sendEmail) {
      try {
        const formattedDate = new Date(booking.selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const serviceTypeLabel = SERVICE_TYPE_LABELS[booking.serviceType] || booking.serviceType;
        const locationForEmail = booking.location || 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891';
        
        const cancellationEmailHtml = `
          <p>Dear ${booking.name},</p>
          <p>This email is to inform you that your appointment with Ryan Gauthier, DPE has been <strong>cancelled</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>CANCELLED APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Service:</strong> ${serviceTypeLabel}<br>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Time:</strong> ${booking.selectedTime}<br>
            <strong>Location:</strong> ${locationForEmail}
          </p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <h3>NEXT STEPS:</h3>
          <p>If you would like to reschedule your appointment, please contact me at your earliest convenience.</p>
          
          <p>
            <strong>Phone:</strong> 860-912-3283<br>
            <strong>Email:</strong> RyanGauthierDPE@gmail.com<br>
            <strong>Website:</strong> <a href="http://www.DPERyan.com">www.DPERyan.com</a>
          </p>
          
          <hr style="border: none; border-top: 2px solid #10b981; margin: 20px 0;">
          
          <p>If you have any questions about this cancellation or would like to discuss rescheduling, please don't hesitate to reach out.</p>
          
          <p>All the best,</p>
          <p>Ryan</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
            --<br>
            <strong>Ryan Gauthier</strong><br>
            Designated Pilot Examiner (DPE)<br>
            Boston FSDO: EA-61<br>
            Email: RyanGauthierDPE@gmail.com<br>
            Phone: 860-912-3283
          </p>
        `;
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ryan Gauthier DPE <noreply@dperyan.com>',
            to: [booking.email], // Send to the applicant
            cc: ['ryangauthierdpe@gmail.com'], // CC Ryan's email
            subject: `Appointment Cancelled - ${formattedDate}`,
            html: cancellationEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Cancellation email sent to ${booking.email} for deleted booking ${bookingId}`);
        } else {
          console.error('❌ Failed to send cancellation email:', result);
          
          // Try with fallback domain if verification error
          if (result.statusCode === 403 && result.message?.includes('verify a domain')) {
            try {
              const fallbackResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Ryan Gauthier DPE <noreply@resend.dev>',
                  to: ['ryangauthierdpe@gmail.com'],
                  subject: `[COPY FOR YOUR RECORDS] Appointment Cancelled - ${booking.name} on ${formattedDate}`,
                  html: `
                    <p><strong>⚠️ Note:</strong> This is a copy of the cancellation email that should have been sent to ${booking.email}. 
                    Please forward this manually or contact the applicant directly.</p>
                    <hr style="margin: 20px 0;">
                    ${cancellationEmailHtml}
                  `,
                }),
              });
              
              if (fallbackResponse.ok) {
                console.log(`✅ Fallback cancellation email sent to ryangauthierdpe@gmail.com`);
              }
            } catch (fallbackError) {
              console.error('❌ Failed to send fallback cancellation email:', fallbackError);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the deletion if email fails
      }
    }
    
    // Move the booking to deleted storage with a timestamp
    const deletedBooking = {
      ...booking,
      deletedAt: new Date().toISOString()
    };
    
    // Store in deleted prefix
    await kv.set(`deleted_${bookingId}`, deletedBooking);
    
    // Remove from active bookings
    await kv.del(bookingId);
    
    console.log(`Booking ${bookingId} moved to deleted storage and cancellation email sent`);
    
    return c.json({ 
      success: true, 
      message: 'Booking deleted successfully (moved to trash)',
      deletedBookingId: bookingId
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return c.json({ error: 'Failed to delete booking', details: error.message }, 500);
  }
});

// Get all deleted bookings
app.get("/make-server-e4d9f7d7/bookings/deleted/all", async (c) => {
  try {
    const deletedBookings = await kv.getByPrefix('deleted_booking_');
    
    // Sort by deletion date (newest first)
    const sortedBookings = deletedBookings.sort((a, b) => {
      return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
    });
    
    console.log(`Retrieved ${deletedBookings.length} deleted bookings`);
    
    return c.json({ bookings: sortedBookings });
  } catch (error) {
    console.error('Error fetching deleted bookings:', error);
    return c.json({ error: 'Failed to fetch deleted bookings', details: error.message }, 500);
  }
});

// Restore a deleted booking
app.post("/make-server-e4d9f7d7/bookings/:id/restore", async (c) => {
  try {
    const bookingId = c.req.param('id');
    const deletedBooking = await kv.get(`deleted_${bookingId}`);
    
    if (!deletedBooking) {
      return c.json({ error: 'Deleted booking not found' }, 404);
    }
    
    // Remove the deletedAt field and restore to active bookings
    const { deletedAt, ...restoredBooking } = deletedBooking;
    restoredBooking.restoredAt = new Date().toISOString();
    
    // Save back to active bookings
    await kv.set(bookingId, restoredBooking);
    
    // Remove from deleted storage
    await kv.del(`deleted_${bookingId}`);
    
    console.log(`Booking ${bookingId} restored from deleted storage`);
    
    return c.json({ 
      success: true, 
      message: 'Booking restored successfully',
      booking: restoredBooking
    });
  } catch (error) {
    console.error('Error restoring booking:', error);
    return c.json({ error: 'Failed to restore booking', details: error.message }, 500);
  }
});

// Permanently delete a booking
app.delete("/make-server-e4d9f7d7/bookings/:id/permanent", async (c) => {
  try {
    const bookingId = c.req.param('id');
    const deletedBooking = await kv.get(`deleted_${bookingId}`);
    
    if (!deletedBooking) {
      return c.json({ error: 'Deleted booking not found' }, 404);
    }
    
    // Permanently remove from deleted storage
    await kv.del(`deleted_${bookingId}`);
    
    console.log(`Booking ${bookingId} permanently deleted`);
    
    return c.json({ 
      success: true, 
      message: 'Booking permanently deleted'
    });
  } catch (error) {
    console.error('Error permanently deleting booking:', error);
    return c.json({ error: 'Failed to permanently delete booking', details: error.message }, 500);
  }
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
    
    // Get start and end dates for the query (next 90 days)
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    
    const timeMin = now.toISOString();
    const timeMax = endDate.toISOString();
    
    // Fetch events from Google Calendar
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
    
    // Extract busy times from events
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

// Send message from chat box
app.post("/make-server-e4d9f7d7/send-message", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }
  
  const { name, email, message } = parseResult.data;
  
  // Validate input
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400);
  }
  
  // Check if Resend API key is available
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return c.json({ error: 'Email service not configured' }, 500);
  }
  
  // Prepare email content to Ryan
  const emailHtml = `
    <h2>💬 New Message from Website</h2>
    <p>You have received a new message from <strong>${name}</strong>.</p>
    
    <h3>Contact Information:</h3>
    <p>
      <strong>Name:</strong> ${name}<br>
      <strong>Email:</strong> ${email}
    </p>
    
    <h3>Message:</h3>
    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
      ${message.replace(/\n/g, '<br>')}
    </div>
    
    <hr style="margin: 20px 0; border: none; border-top: 2px solid #10b981;">
    
    <p><strong>Reply To:</strong> <a href="mailto:${email}">${email}</a></p>
    
    <p style="color: #666; font-size: 0.9em;">
      <em>To reply, simply respond to this email or send a new email to ${email}</em>
    </p>
  `;
  
  // Send email using Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DPE Website Contact <noreply@dperyan.com>',
      reply_to: email,
      to: ['ryangauthierdpe@gmail.com'],
      subject: `💬 New Message from ${name}`,
      html: emailHtml,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('Resend API error while sending message:', result);
    return c.json({ error: 'Failed to send message', details: result }, 500);
  }
  
  console.log(`Message sent from ${name} (${email}). Email ID: ${result.id}`);
  
  return c.json({ 
    success: true, 
    message: 'Message sent successfully',
    emailId: result.id
  });
});

// Contact form endpoint (from Contact Ryan modal)
app.post("/make-server-e4d9f7d7/contact", async (c) => {
  const parseResult = await safeJsonParse(c);
  if (parseResult.error) {
    return c.json({ error: parseResult.error }, parseResult.status);
  }
  
  const { name, email, phone, message, subject } = parseResult.data;
  
  // Validate required fields
  if (!name || !email || !phone || !message) {
    return c.json({ error: 'All fields are required' }, 400);
  }
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    return c.json({ error: 'Email service not configured' }, 500);
  }
  
  // Create HTML email for Ryan
  const emailHtml = `
    <h2 style=\"color: #10b981;\">New Contact Form Submission</h2>
    
    <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
    
    <hr style=\"margin: 20px 0; border: none; border-top: 2px solid #10b981;\">
    
    <p><strong>From:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href=\"mailto:${email}\">${email}</a></p>
    <p><strong>Phone:</strong> ${phone}</p>
    
    <h3>Message:</h3>
    <div style=\"background-color: #f5f5f5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;\">
      ${message.replace(/\n/g, '<br>')}
    </div>
    
    <hr style=\"margin: 20px 0; border: none; border-top: 2px solid #10b981;\">
    
    <p style=\"color: #666; font-size: 0.9em;\">
      <em>Reply directly to this email to respond to ${name}</em>
    </p>
  `;
  
  // Send email using Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DPE Website Contact <noreply@dperyan.com>',
      reply_to: email,
      to: ['ryangauthierdpe@gmail.com'],
      subject: `📧 ${subject || 'Contact Form'} - ${name}`,
      html: emailHtml,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('Resend API error while sending contact form:', result);
    return c.json({ error: 'Failed to send message', details: result }, 500);
  }
  
  console.log(`Contact form submitted by ${name} (${email}, ${phone}). Email ID: ${result.id}`);
  
  return c.json({ 
    success: true, 
    message: 'Message sent successfully',
    emailId: result.id
  });
});

Deno.serve(app.fetch);