import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useSearchParams } from 'react-router';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  iacraFtn: string;
  aircraftMakeModel: string;
  serviceType: string;
  selectedDate: string;
  selectedTime: string;
  retestCertificationType?: string; // For retest services only
  notes?: string; // Optional notes for Ryan
}

interface BusyTime {
  start: string;
  end: string;
  summary: string;
}

// Service type with duration mapping
const SERVICE_DURATIONS: { [key: string]: number } = {
  'pp-initial-asel': 6,
  'pp-initial-amel': 6,
  'pp-added-class': 4,
  'ir-airplane': 6,
  'cp-initial-asel': 6,
  'cp-initial-amel': 6,
  'cp-added-class': 4,
  'retest-flight-only': 3,
  'retest-ground-flight': 5,
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
  'checkride': 'Private Pilot ASEL Checkride', // Legacy support
};

export function SchedulePage() {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showAllDates, setShowAllDates] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    iacraFtn: '',
    aircraftMakeModel: '',
    serviceType: '',
    selectedDate: '',
    selectedTime: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [busyTimes, setBusyTimes] = useState<BusyTime[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // Refs for auto-scrolling
  const dateSelectionRef = useRef<HTMLDivElement>(null);
  const timeSelectionRef = useRef<HTMLDivElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Pre-fill service type from URL parameter
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && SERVICE_DURATIONS[serviceParam]) {
      setFormData(prev => ({ ...prev, serviceType: serviceParam }));
      // Auto-scroll to date selection after a brief delay
      setTimeout(() => {
        dateSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [searchParams]);

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

  // Check if a date has ANY available time slots for the given duration
  const hasAvailableSlots = (dateStr: string, duration: number): boolean => {
    // Check if there's an all-day event on this date
    const [year, month, day] = dateStr.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    const checkDateOnly = checkDate.getTime();
    
    const hasAllDayEvent = busyTimes.some(busyTime => {
      if (!busyTime.start.includes('T')) {
        // All-day event
        const [y, m, d] = busyTime.start.split('-').map(Number);
        const busyStart = new Date(y, m - 1, d);
        
        const [ye, me, de] = busyTime.end.split('-').map(Number);
        const busyEnd = new Date(ye, me - 1, de - 1);
        
        const busyStartDateOnly = new Date(busyStart.getFullYear(), busyStart.getMonth(), busyStart.getDate()).getTime();
        const busyEndDateOnly = new Date(busyEnd.getFullYear(), busyEnd.getMonth(), busyEnd.getDate()).getTime();
        
        return checkDateOnly >= busyStartDateOnly && checkDateOnly <= busyEndDateOnly;
      }
      return false;
    });
    
    // If there's an all-day event, no slots are available
    if (hasAllDayEvent) {
      return false;
    }
    
    // Generate all possible time slots for this duration and check if any are available
    const possibleSlots = generateTimeSlots(duration);
    return possibleSlots.some(slot => isTimeSlotAvailable(dateStr, slot.start, duration));
  };

  // Check if a specific time slot is available (not conflicting with busy times)
  const isTimeSlotAvailable = (dateStr: string, startHour: number, durationHours: number): boolean => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const slotStart = new Date(year, month - 1, day, startHour, 0, 0);
    const slotEnd = new Date(year, month - 1, day, startHour + durationHours, 0, 0);
    
    // Check if this slot conflicts with any busy time
    return !busyTimes.some(busyTime => {
      // Skip all-day events - only check timed events for slot conflicts
      if (!busyTime.start.includes('T')) {
        return false;
      }
      
      const busyStart = new Date(busyTime.start);
      const busyEnd = new Date(busyTime.end);
      
      // Check if there's any overlap between slot and busy time
      // Overlap occurs if: slot starts before busy ends AND slot ends after busy starts
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  };

  // Generate available time slots based on service duration
  const generateTimeSlots = (duration: number): Array<{start: number, end: number, label: string}> => {
    if (duration === 6) {
      return [
        { start: 9, end: 15, label: '9:00 AM - 3:00 PM' },
        { start: 10, end: 16, label: '10:00 AM - 4:00 PM' },
        { start: 11, end: 17, label: '11:00 AM - 5:00 PM' },
      ];
    } else if (duration === 4) {
      return [
        { start: 9, end: 13, label: '9:00 AM - 1:00 PM' },
        { start: 10, end: 14, label: '10:00 AM - 2:00 PM' },
        { start: 11, end: 15, label: '11:00 AM - 3:00 PM' },
        { start: 12, end: 16, label: '12:00 PM - 4:00 PM' },
        { start: 13, end: 17, label: '1:00 PM - 5:00 PM' },
      ];
    } else if (duration === 3) {
      return [
        { start: 9, end: 12, label: '9:00 AM - 12:00 PM' },
        { start: 10, end: 13, label: '10:00 AM - 1:00 PM' },
        { start: 11, end: 14, label: '11:00 AM - 2:00 PM' },
        { start: 12, end: 15, label: '12:00 PM - 3:00 PM' },
        { start: 13, end: 16, label: '1:00 PM - 4:00 PM' },
        { start: 14, end: 17, label: '2:00 PM - 5:00 PM' },
      ];
    } else if (duration === 5) {
      return [
        { start: 9, end: 14, label: '9:00 AM - 2:00 PM' },
        { start: 10, end: 15, label: '10:00 AM - 3:00 PM' },
        { start: 11, end: 16, label: '11:00 AM - 4:00 PM' },
        { start: 12, end: 17, label: '12:00 PM - 5:00 PM' },
      ];
    } else if (duration === 1) {
      return [
        { start: 9, end: 10, label: '9:00 AM - 10:00 AM' },
        { start: 10, end: 11, label: '10:00 AM - 11:00 AM' },
        { start: 11, end: 12, label: '11:00 AM - 12:00 PM' },
        { start: 12, end: 13, label: '12:00 PM - 1:00 PM' },
        { start: 13, end: 14, label: '1:00 PM - 2:00 PM' },
        { start: 14, end: 15, label: '2:00 PM - 3:00 PM' },
        { start: 15, end: 16, label: '3:00 PM - 4:00 PM' },
        { start: 16, end: 17, label: '4:00 PM - 5:00 PM' },
      ];
    }
    return [];
  };

  // Generate available dates (exclude weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const daysToShow = showAllDates ? 60 : 24;

    for (let i = 5; i < daysToShow; i++) {
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
    if (!hasAvailableSlots(date, SERVICE_DURATIONS[formData.serviceType])) {
      return; // Don't allow selection of busy dates
    }
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setFormData({ ...formData, selectedDate: date, selectedTime: '' });
    
    // Auto-scroll to time selection when date is selected
    setTimeout(() => {
      timeSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleTimeSelect = (timeLabel: string) => {
    setSelectedTime(timeLabel);
    setFormData({ ...formData, selectedTime: timeLabel });
    
    // Auto-scroll to booking form when time is selected
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-scroll to date selection when service type is selected (but not for retest types)
    if (name === 'serviceType' && value) {
      // Don't scroll if it's a retest service type - wait for retestCertificationType to be filled
      if (value !== 'retest-flight-only' && value !== 'retest-ground-flight') {
        setTimeout(() => {
          dateSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
    
    // Auto-scroll to date selection when retestCertificationType is selected
    if (name === 'retestCertificationType' && value) {
      setTimeout(() => {
        dateSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const generateGoogleCalendarUrl = (data: BookingFormData) => {
    // Get the duration for this service type
    const duration = SERVICE_DURATIONS[data.serviceType] || 6;
    
    // Parse the selected time to extract start hour
    // Format is like "9:00 AM - 3:00 PM" or "10:00 AM - 4:00 PM"
    const timeMatch = data.selectedTime.match(/(\d{1,2}):00 (AM|PM)/);
    let startHour = 9; // default to 9 AM
    
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const meridiem = timeMatch[2];
      
      if (meridiem === 'PM' && hour !== 12) {
        startHour = hour + 12;
      } else if (meridiem === 'AM' && hour === 12) {
        startHour = 0;
      } else {
        startHour = hour;
      }
    }
    
    // Parse the date and create start/end times
    const [year, month, day] = data.selectedDate.split('-');
    const startHourStr = startHour.toString().padStart(2, '0');
    const startDateTime = `${year}${month}${day}T${startHourStr}0000`;
    
    // Calculate end time based on duration
    const endHour = startHour + duration;
    const endHourStr = endHour.toString().padStart(2, '0');
    const endDateTime = `${year}${month}${day}T${endHourStr}0000`;
    
    const serviceTypeLabel = SERVICE_TYPE_LABELS[data.serviceType] || data.serviceType;
    
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
            <h2 className="text-3xl font-bold text-green-900 mb-4">Request Submitted!</h2>
            <div className="text-left max-w-2xl mx-auto space-y-4">
              <p className="text-green-800 font-semibold">
                Thank you for your request. Watch for a confirmation email. If one is not received within 24 hours, email Ryan to confirm.
              </p>
              <p className="text-green-800">
                There are several scheduling factors to consider before final confirmation is provided. <strong>Please do not make any travel or logistical arrangements until you have received written confirmation via email that your practical test has been officially scheduled.</strong>
              </p>
              <p className="text-green-800 text-sm">
                You should receive an automatic email shortly confirming we received your request, along with a copy of the information you submitted.
              </p>
            </div>
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
            First select your service type, then choose an available date and complete the booking form.
          </p>
        </div>

        {/* High Volume Notice */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-2">New Availability Released</h3>
              <p className="text-lg text-amber-800 leading-relaxed">
                Additional availability has been added to the schedule. More appointment times will be released as they become available.
              </p>
              <p className="text-lg text-amber-800 leading-relaxed mt-2">
                Please select the appropriate Service Type to view upcoming availability and schedule your appointment.
              </p>
              <p className="text-sm text-amber-700 mt-3 italic">Updated: August 26, 2026</p>
            </div>
          </div>
        </div>

        {/* Service Type Selection - STEP 1 */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
            <h2 className="text-2xl font-semibold">Select Service Type</h2>
          </div>
          <div className="max-w-2xl">
            <label htmlFor="serviceType-main" className="block font-semibold mb-2">
              What service do you need? <span className="text-red-600">*</span>
            </label>
            <select
              id="serviceType-main"
              name="serviceType"
              required
              value={formData.serviceType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a service...</option>
              <optgroup label="Private Pilot Certificate">
                <option value="pp-initial-asel">Private Pilot - Airplane Single Engine Land (ASEL)</option>
                <option value="pp-initial-amel">Private Pilot - Airplane Multiengine Land (AMEL)</option>
                <option value="pp-added-class">Added Category or Class Rating</option>
              </optgroup>
              <optgroup label="Instrument Rating">
                <option value="ir-airplane">Instrument Rating Airplane</option>
              </optgroup>
              <optgroup label="Commercial Pilot Certificate">
                <option value="cp-initial-asel">Commercial Pilot - Airplane Single Engine Land (ASEL)</option>
                <option value="cp-initial-amel">Commercial Pilot - Airplane Multiengine Land (AMEL)</option>
                <option value="cp-added-class">Added Category or Class Rating</option>
              </optgroup>
              <optgroup label="Retests">
                <option value="retest-flight-only">Retest - Flight Portion Only</option>
                <option value="retest-ground-flight">Retest - Ground and Flight Portion</option>
              </optgroup>
              <optgroup label="Administrative Functions">
                <option value="foreign">Foreign Pilot</option>
                <option value="military">Military Competency</option>
                <option value="cfi-renewal">Flight Instructor Renewal</option>
                <option value="ground-instructor">Ground Instructor</option>
                <option value="sic">SIC Type Ratings</option>
                <option value="soe">SOE Limitation Removals</option>
                <option value="atp">ATP Limitation Removals</option>
                <option value="remote">Remote Pilot Certificate</option>
                <option value="night">Night Flight Limitation Removals</option>
              </optgroup>
            </select>
            {formData.serviceType && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 font-semibold">
                  ✓ Service selected: {SERVICE_DURATIONS[formData.serviceType]} hour appointment
                </p>
              </div>
            )}
          </div>

          {/* Conditional dropdown for retest certification type */}
          {(formData.serviceType === 'retest-flight-only' || formData.serviceType === 'retest-ground-flight') && (
            <div className="max-w-2xl mt-6">
              <label htmlFor="retestCertificationType" className="block font-semibold mb-2">
                Which test are you seeking a retest for? <span className="text-red-600">*</span>
              </label>
              <select
                id="retestCertificationType"
                name="retestCertificationType"
                required
                value={formData.retestCertificationType || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select the original test...</option>
                <optgroup label="Private Pilot">
                  <option value="pp-initial-asel">Private Pilot - Airplane Single Engine Land (ASEL)</option>
                  <option value="pp-initial-amel">Private Pilot - Airplane Multiengine Land (AMEL)</option>
                </optgroup>
                <optgroup label="Instrument Rating">
                  <option value="ir-airplane">Instrument Rating Airplane</option>
                </optgroup>
                <optgroup label="Commercial Pilot">
                  <option value="cp-initial-asel">Commercial Pilot - Airplane Single Engine Land (ASEL)</option>
                  <option value="cp-initial-amel">Commercial Pilot - Airplane Multiengine Land (AMEL)</option>
                </optgroup>
              </select>
              {formData.retestCertificationType && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-semibold">
                    ✓ Retest for: {SERVICE_TYPE_LABELS[formData.retestCertificationType] || formData.retestCertificationType}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date and Time Selection - STEP 2 */}
        {formData.serviceType && (
          <div ref={dateSelectionRef} className="grid lg:grid-cols-2 gap-8 mb-12" style={{ scrollMarginTop: '2rem' }}>
            {/* Calendar Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <h2 className="text-2xl font-semibold">Select a Date</h2>
              </div>
              {loadingCalendar && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Loading calendar availability...</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {availableDates.map((date) => {
                  const isBusy = !hasAvailableSlots(date, SERVICE_DURATIONS[formData.serviceType]);
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
            <div ref={timeSelectionRef} className="bg-white border border-gray-200 rounded-lg p-6" style={{ scrollMarginTop: '2rem' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <h2 className="text-2xl font-semibold">Select Time</h2>
              </div>
              {!selectedDate ? (
                <p className="text-gray-500 italic">Please select a date first</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Choose your preferred time slot:</p>
                  <div className="space-y-3">
                    {(() => {
                      const allSlots = generateTimeSlots(SERVICE_DURATIONS[formData.serviceType]);
                      
                      // For 6-hour events, only show 9:00 AM if it's available
                      const duration = SERVICE_DURATIONS[formData.serviceType];
                      if (duration === 6) {
                        const nineAmSlot = allSlots.find(slot => slot.start === 9);
                        const isNineAmAvailable = nineAmSlot && isTimeSlotAvailable(selectedDate, nineAmSlot.start, duration);
                        
                        // If 9:00 AM is available, only show that slot
                        if (isNineAmAvailable) {
                          return [nineAmSlot].map((slot) => {
                            const isAvailable = isTimeSlotAvailable(selectedDate, slot.start, duration);
                            const isSelected = selectedTime === slot.label;
                            
                            return (
                              <button
                                key={slot.label}
                                onClick={() => isAvailable && handleTimeSelect(slot.label)}
                                disabled={!isAvailable}
                                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                                    : !isAvailable
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-lg">{slot.label}</span>
                                  {!isAvailable && <span className="text-xs text-red-500">Unavailable</span>}
                                  {isSelected && <span className="text-emerald-600 text-lg">✓</span>}
                                </div>
                              </button>
                            );
                          });
                        }
                      }
                      
                      // For non-6-hour events, or if 9 AM is not available, show all slots
                      return allSlots.map((slot) => {
                        const isAvailable = isTimeSlotAvailable(selectedDate, slot.start, SERVICE_DURATIONS[formData.serviceType]);
                        const isSelected = selectedTime === slot.label;
                        
                        return (
                          <button
                            key={slot.label}
                            onClick={() => isAvailable && handleTimeSelect(slot.label)}
                            disabled={!isAvailable}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                                : !isAvailable
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-lg">{slot.label}</span>
                              {!isAvailable && <span className="text-xs text-red-500">Unavailable</span>}
                              {isSelected && <span className="text-emerald-600 text-lg">✓</span>}
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                  
                  {selectedTime && (
                    <div className="flex justify-center mt-6">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="w-12 h-12 text-emerald-600 animate-bounce" />
                        <span className="text-sm text-emerald-600 font-semibold mt-4">Complete booking form below</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Form - STEP 4 */}
        {selectedDate && selectedTime && formData.serviceType && (
          <div ref={bookingFormRef} className="bg-white border border-gray-200 rounded-lg p-8" style={{ scrollMarginTop: '2rem' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
              <h2 className="text-2xl font-semibold">Complete Your Booking</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">
                <strong>Selected:</strong> {formatDate(selectedDate)} at {selectedTime} ({SERVICE_DURATIONS[formData.serviceType]} hour{SERVICE_DURATIONS[formData.serviceType] > 1 ? 's' : ''})
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

                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block font-semibold mb-2">
                    Notes for Ryan <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-vertical"
                    placeholder="Add any additional information or questions for Ryan..."
                  />
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
                  * Required fields (Notes are optional)
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}