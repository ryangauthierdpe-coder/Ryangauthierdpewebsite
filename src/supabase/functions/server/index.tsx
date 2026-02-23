import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { getGoogleAccessToken } from "./google-auth.tsx";

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
      const appointmentDate = new Date(booking.selectedDate + 'T00:00:00');
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const serviceTypeLabel = booking.serviceType === 'checkride' 
        ? 'Private Pilot ASEL Checkride ($850)' 
        : booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1);
      
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
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
        
        <p>Please log in to your admin dashboard to confirm or manage this appointment:</p>
        <p><a href="https://your-website-url.com/admin" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Admin Dashboard</a></p>
      `;
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DPE Booking System <onboarding@resend.dev>',
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
  const { status } = parseResult.data;
  
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
  
  // Update booking with new status
  const updatedBooking = {
    ...existingBooking,
    status,
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(bookingId, updatedBooking);
  
  console.log(`Booking ${bookingId} status updated to: ${status}`);
  
  // Send automatic confirmation email to customer if status is "confirmed"
  if (status === 'confirmed') {
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
        
        // Parse the time correctly (e.g., "9:00 AM" -> 09:00)
        const timeParts = updatedBooking.selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeParts) {
          throw new Error('Invalid time format');
        }
        
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const period = timeParts[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        // Create proper datetime string (YYYY-MM-DDTHH:mm:ss)
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        const dateTimeString = `${updatedBooking.selectedDate}T${timeString}`;
        
        // Calculate end time (assuming 4 hours for checkride, 1 hour for admin)
        const durationHours = updatedBooking.serviceType === 'checkride' ? 6 : 1;
        
        // Parse start time and calculate end time
        const [year, month, day] = updatedBooking.selectedDate.split('-').map(Number);
        let endHours = hours + durationHours;
        let endDay = day;
        let endMonth = month;
        let endYear = year;
        
        // Handle day overflow
        if (endHours >= 24) {
          endHours -= 24;
          endDay += 1;
          // Simple day overflow (not handling month/year overflow for simplicity)
        }
        
        const endTimeString = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        const endDateTimeString = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T${endTimeString}`;
        
        const calendarEvent = {
          summary: `${updatedBooking.serviceType === 'checkride' ? 'Checkride' : 'Admin'} - ${updatedBooking.name}`,
          description: `PRACTICAL TEST APPOINTMENT\n\nApplicant: ${updatedBooking.name}\nEmail: ${updatedBooking.email}\nPhone: ${updatedBooking.phone}\nIACRA FTN: ${updatedBooking.iacraFtn}\nAircraft: ${updatedBooking.aircraftMakeModel}\n\nService: ${updatedBooking.serviceType}\nBooking ID: ${bookingId}`,
          location: 'Westerly State Airport (WST), 56 Airport Road, Westerly, RI 02891',
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
        
        const calendarResponse = await fetch(
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
        
        const calendarResult = await calendarResponse.json();
        
        if (calendarResponse.ok) {
          console.log(`✅ Google Calendar event created for booking ${bookingId}. Event ID: ${calendarResult.id}`);
          
          // Save the calendar event ID to the booking for future reference
          updatedBooking.calendarEventId = calendarResult.id;
          await kv.set(bookingId, updatedBooking);
        } else {
          console.error('❌ Failed to create Google Calendar event:', calendarResult);
        }
      } catch (calendarError) {
        console.error('❌ Error creating Google Calendar event:', calendarError);
        // Don't fail the confirmation if calendar creation fails
      }
    }
    
    if (resendApiKey) {
      try {
        const appointmentDate = new Date(updatedBooking.selectedDate + 'T00:00:00');
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const confirmationEmailHtml = `
          <p>Dear ${updatedBooking.name},</p>
          <p>Great news! Your appointment with Ryan Gauthier, DPE has been <strong>confirmed</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Time:</strong> ${updatedBooking.selectedTime}<br>
            <strong>Location:</strong> Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891
          </p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>APPLICANT INFORMATION:</h3>
          <p>
            <strong>Name:</strong> ${updatedBooking.name}<br>
            <strong>Email Address:</strong> ${updatedBooking.email}<br>
            <strong>Phone Number:</strong> ${updatedBooking.phone}<br>
            <strong>IACRA FTN:</strong> ${updatedBooking.iacraFtn}<br>
            <strong>Aircraft:</strong> ${updatedBooking.aircraftMakeModel}
          </p>
          <p>Please advise if any of this information is incorrect.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>PRACTICAL TEST BRIEFING:</h3>
          <p>Please look for a Practical Test Briefing, to include the scenario to prepare, approximately 2 weeks prior to your scheduled exam date. If you have not received said briefing 10 days prior, please contact me so I can get that to you.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>FLYING IN:</h3>
          <p>Upon arrival at WST on the day of your practical test, please proceed to the Main Terminal building, where we will meet.</p>
          
          <p>Parking is available on the ramp directly in front of the terminal. Look for spaces marked with a "T" in the center of the ramp and park facing the terminal.</p>
          
          <p>Enter the building through the door on the left, which is marked "General Aviation." We will meet in the conference room located inside that entrance.</p>
          
          <p>If you have any difficulty finding the location, feel free to reach out. I look forward to meeting you. A map is available under the Preparation Tab on my website (www.DPERyan.com)</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>WHAT TO BRING:</h3>
          <p>Please visit <a href="http://www.DPERyan.com">www.DPERyan.com</a> and navigate to the Preparation page for important information to ensure you are fully prepared for your Practical Test.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>WEATHER:</h3>
          <p>We cannot begin the exam unless we have a reasonable expectation that we will be able to complete the exam, to include the flight. If you have any concerns that we will not be able to fly on the day of your practical test, please let me know in advance so that we may reschedule.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
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
            from: 'Ryan Gauthier DPE <noreply@resend.dev>',
            to: [updatedBooking.email], // Send to the applicant
            cc: ['ryangauthierdpe@gmail.com'], // CC Ryan's email
            subject: `Appointment Confirmed - ${formattedDate} at ${updatedBooking.selectedTime}`,
            html: confirmationEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`Confirmation email sent to ${updatedBooking.email} for booking ${bookingId}`);
        } else {
          console.error('Failed to send confirmation email:', result);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }
  }
  
  // Send automatic cancellation email to customer if status is "cancelled"
  if (status === 'cancelled') {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    
    // Delete Google Calendar event if it exists
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
    
    // Send cancellation email to applicant
    if (resendApiKey) {
      try {
        const appointmentDate = new Date(updatedBooking.selectedDate + 'T00:00:00');
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const cancellationEmailHtml = `
          <p>Dear ${updatedBooking.name},</p>
          <p>This email is to inform you that your appointment with Ryan Gauthier, DPE has been <strong>cancelled</strong>.</p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>CANCELLED APPOINTMENT DETAILS:</h3>
          <p>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Time:</strong> ${updatedBooking.selectedTime}<br>
            <strong>Location:</strong> Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891
          </p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
          <h3>NEXT STEPS:</h3>
          <p>If you would like to reschedule your appointment, please contact me at your earliest convenience.</p>
          
          <p>
            <strong>Phone:</strong> 860-912-3283<br>
            <strong>Email:</strong> RyanGauthierDPE@gmail.com<br>
            <strong>Website:</strong> <a href="http://www.DPERyan.com">www.DPERyan.com</a>
          </p>
          
          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
          
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
            from: 'Ryan Gauthier DPE <noreply@resend.dev>',
            to: [updatedBooking.email], // Send to the applicant
            cc: ['ryangauthierdpe@gmail.com'], // CC Ryan's email
            subject: `Appointment Cancelled - ${formattedDate}`,
            html: cancellationEmailHtml,
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`Cancellation email sent to ${updatedBooking.email} for booking ${bookingId}`);
        } else {
          console.error('Failed to send cancellation email:', result);
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the status update if email fails
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
    const appointmentDate = new Date(booking.selectedDate + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
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
      
      <h3>FLYING IN:</h3>
      <p>When you land at WST on the day of your practical test, we will meet in the Main Terminal building. There are parking spots in the middle of the ramp, marked with a T, where you can park facing the terminal. As you walk towards the terminal, you'll enter through the door to the left with a sign for General Aviation. There is a conference room there where we will meet. A map is available under the Preparation Tab on my website (www.DPERyan.com)</p>
      
      <h3>WHAT TO BRING:</h3>
      <p>Please visit <a href="http://www.DPERyan.com">www.DPERyan.com</a> and navigate to the Preparation page for important information to ensure you are fully prepared for your Practical Test.</p>
      
      <h3>WEATHER:</h3>
      <p>We cannot begin the exam unless we have a reasonable expectation that we will be able to complete the exam, to include the flight. If you have any concerns that we will not be able to fly on the day of your practical test, please let me know in advance so that we may reschedule.</p>
      
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
      
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
        from: 'Ryan Gauthier DPE <onboarding@resend.dev>',
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
    const booking = await kv.get(bookingId);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
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
    
    console.log(`Booking ${bookingId} moved to deleted storage`);
    
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
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
    
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
      from: 'DPE Website Contact <onboarding@resend.dev>',
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
    
    <hr style=\"margin: 20px 0; border: none; border-top: 1px solid #ccc;\">
    
    <p><strong>From:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href=\"mailto:${email}\">${email}</a></p>
    <p><strong>Phone:</strong> ${phone}</p>
    
    <h3>Message:</h3>
    <div style=\"background-color: #f5f5f5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;\">
      ${message.replace(/\n/g, '<br>')}
    </div>
    
    <hr style=\"margin: 20px 0; border: none; border-top: 1px solid #ccc;\">
    
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
      from: 'DPE Website Contact <onboarding@resend.dev>',
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