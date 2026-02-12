import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  iacraFtn: string;
  aircraftMakeModel: string;
  serviceType: string;
  selectedDate: string;
  selectedTime: string;
}

interface BusyTime {
  start: string;
  end: string;
  summary: string;
}

export function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showAllDates, setShowAllDates] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    iacraFtn: '',
    aircraftMakeModel: '',
    serviceType: 'checkride',
    selectedDate: '',
    selectedTime: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [busyTimes, setBusyTimes] = useState<BusyTime[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // Fetch busy times from Google Calendar on component mount
  useEffect(() => {
    fetchBusyTimes();
  }, []);

  const fetchBusyTimes = async () => {
    setLoadingCalendar(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e4d9f7d7/calendar/busy-times`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBusyTimes(data.busyTimes || []);
        console.log('Fetched busy times from Google Calendar:', data.busyTimes?.length || 0);
      } else {
        console.error('Failed to fetch busy times:', data.error);
      }
    } catch (err) {
      console.error('Error fetching busy times:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Check if a date is busy based on Google Calendar events
  const isDateBusy = (dateStr: string): boolean => {
    // Parse the date string as local date (YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    const checkDateOnly = checkDate.getTime();
    
    return busyTimes.some(busyTime => {
      // Handle both all-day events (date format) and timed events (dateTime format)
      let busyStart: Date;
      let busyEnd: Date;
      
      if (busyTime.start.includes('T')) {
        // Timed event - has dateTime
        busyStart = new Date(busyTime.start);
      } else {
        // All-day event - date only (e.g., "2026-02-17")
        const [y, m, d] = busyTime.start.split('-').map(Number);
        busyStart = new Date(y, m - 1, d);
      }
      
      if (busyTime.end.includes('T')) {
        // Timed event - has dateTime
        busyEnd = new Date(busyTime.end);
      } else {
        // All-day event - date only
        // For all-day events, Google Calendar sets end date to the next day
        // So we need to subtract 1 day to get the actual last day of the event
        const [y, m, d] = busyTime.end.split('-').map(Number);
        busyEnd = new Date(y, m - 1, d - 1);
      }
      
      // Get just the date parts (without time) for comparison
      const busyStartDateOnly = new Date(busyStart.getFullYear(), busyStart.getMonth(), busyStart.getDate()).getTime();
      const busyEndDateOnly = new Date(busyEnd.getFullYear(), busyEnd.getMonth(), busyEnd.getDate()).getTime();
      
      // Check if the date falls within the busy period (inclusive)
      return checkDateOnly >= busyStartDateOnly && checkDateOnly <= busyEndDateOnly;
    });
  };

  // Generate available dates (exclude weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const daysToShow = showAllDates ? 60 : 24;

    for (let i = 10; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Only include weekdays (Monday = 1, Friday = 5)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
      }
    }
    return dates.slice(0, showAllDates ? dates.length : 8);
  };

  const availableDates = generateAvailableDates();

  const appointmentTime = '9:00 AM';
  const appointmentDuration = '6 hours (9:00 AM - 3:00 PM)';

  const handleDateSelect = (date: string) => {
    if (isDateBusy(date)) {
      return; // Don't allow selection of busy dates
    }
    setSelectedDate(date);
    setSelectedTime(appointmentTime);
    setFormData({ ...formData, selectedDate: date, selectedTime: appointmentTime });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateGoogleCalendarUrl = (data: BookingFormData) => {
    // Parse the date and create start/end times
    const [year, month, day] = data.selectedDate.split('-');
    const startDateTime = `${year}${month}${day}T090000`; // 9:00 AM
    const endDateTime = `${year}${month}${day}T150000`; // 3:00 PM (6 hours later)
    
    const serviceTypeLabel = data.serviceType === 'checkride' 
      ? 'Private Pilot ASEL Checkride' 
      : 'Pilot Examination - ' + data.serviceType;
    
    const title = encodeURIComponent(`${serviceTypeLabel} - ${data.name}`);
    const details = encodeURIComponent(
      `Applicant: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `IACRA FTN: ${data.iacraFtn}\n` +
      `Aircraft: ${data.aircraftMakeModel}\n` +
      `Service: ${serviceTypeLabel}`
    );
    const location = encodeURIComponent('58 Airport Road, Westerly, RI 02891');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Send booking data to server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e4d9f7d7/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      console.log('Booking submitted successfully:', data);

      // Generate Google Calendar URL
      const calendarUrl = generateGoogleCalendarUrl(formData);
      setGoogleCalendarUrl(calendarUrl);

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year}`;
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-900 mb-2">Booking Submitted!</h2>
            <p className="text-green-800 mb-6">
              Thank you for scheduling your appointment. You will receive a confirmation email shortly.
            </p>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-transparent border-2 border-emerald-500 hover:bg-emerald-500/20 text-emerald-600 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Add to Your Google Calendar
            </a>
            <p className="text-sm text-gray-600 mt-4">
              Click the button above to add this appointment to your personal Google Calendar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Schedule Your Appointment</h1>
          <p className="text-gray-600">
            Select an available date and time, then complete the booking form below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Calendar Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Select a Date</h2>
            {loadingCalendar && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Loading calendar availability...</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {availableDates.map((date) => {
                const isBusy = isDateBusy(date);
                const isSelected = selectedDate === date;
                return (
                  <button
                    key={date}
                    onClick={() => !isBusy && handleDateSelect(date)}
                    disabled={isBusy}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : isBusy
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="text-sm font-semibold">{formatDate(date)}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatDateShort(date)}</div>
                    {isBusy && <div className="text-xs text-red-500 mt-1">Unavailable</div>}
                  </button>
                );
              })}
            </div>
            <button
              className="mt-4 w-full text-emerald-600 hover:text-emerald-700 font-semibold py-2 underline"
              onClick={() => setShowAllDates(!showAllDates)}
            >
              {showAllDates ? 'Show fewer dates' : 'Show more dates'}
            </button>
          </div>

          {/* Time Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-emerald-600" />
              Appointment Time
            </h2>
            {!selectedDate ? (
              <p className="text-gray-500 italic">Please select a date first</p>
            ) : (
              <div>
                <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-emerald-900 mb-2">{appointmentTime}</div>
                  <div className="text-gray-700">{appointmentDuration}</div>
                  <div className="mt-4 text-sm text-gray-600">
                    All checkrides start at 9:00 AM and last approximately 6 hours
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <div className="flex flex-col items-center">
                    <ArrowDown className="w-12 h-12 text-emerald-600 animate-bounce" />
                    <span className="text-sm text-emerald-600 font-semibold mt-4">Complete booking form below</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        {selectedDate && selectedTime && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Complete Your Booking</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">
                <strong>Selected:</strong> {formatDate(selectedDate)} at {selectedTime}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block font-semibold mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-semibold mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block font-semibold mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="iacraFtn" className="block font-semibold mb-2">
                    IACRA FTN <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="iacraFtn"
                    name="iacraFtn"
                    required
                    value={formData.iacraFtn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="X-XXXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="aircraftMakeModel" className="block font-semibold mb-2">
                    Aircraft Make & Model <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="aircraftMakeModel"
                    name="aircraftMakeModel"
                    required
                    value={formData.aircraftMakeModel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Cessna 172"
                  />
                </div>

                <div>
                  <label htmlFor="serviceType" className="block font-semibold mb-2">
                    Service Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="checkride">Checkride - Private Pilot ASEL ($850)</option>
                    <option value="foreign">Foreign Pilot ($250)</option>
                    <option value="military">Military Competency ($250)</option>
                    <option value="cfi-renewal">Flight Instructor Renewal ($150)</option>
                    <option value="ground-instructor">Ground Instructor ($150)</option>
                    <option value="sic">SIC Type Ratings ($150)</option>
                    <option value="soe">SOE Limitation Removals ($150)</option>
                    <option value="atp">ATP Limitation Removals ($150)</option>
                    <option value="remote">Remote Pilot Certificate ($150)</option>
                    <option value="night">Night Flight Limitation Removals ($150)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-2 border-emerald-500 hover:bg-emerald-500/20 text-emerald-600 px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  * All fields are required
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}