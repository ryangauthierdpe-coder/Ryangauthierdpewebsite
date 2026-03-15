import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Service type with duration mapping (matching schedule-page.tsx)
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

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string, selectedDate: string, selectedTime: string) => void;
  bookingName: string;
  currentDate: string;
  currentTime: string;
  currentLocation?: string;
  serviceType: string;
}

export function ConfirmBookingModal({ isOpen, onClose, onConfirm, bookingName, currentDate, currentTime, currentLocation, serviceType }: ConfirmBookingModalProps) {
  const [location, setLocation] = useState(currentLocation || 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891');
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedStartTime, setSelectedStartTime] = useState('6:00 AM');
  const [calculatedTimeRange, setCalculatedTimeRange] = useState('');

  // Generate time options from 6:00 AM to 8:00 PM in 30-minute increments
  const timeOptions = [];
  for (let hour = 6; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const isPM = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      const period = isPM ? 'PM' : 'AM';
      timeOptions.push(`${displayHour}:${displayMinute} ${period}`);
    }
  }

  // Calculate end time based on service duration
  const calculateTimeRange = (startTime: string) => {
    const duration = SERVICE_DURATIONS[serviceType] || 6;
    
    // Parse start time
    const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return startTime;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Add duration
    let endHours = hours + duration;
    const endMinutes = minutes;
    
    // Convert back to 12-hour format for end time
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    let displayEndHours = endHours;
    if (endHours > 12) {
      displayEndHours = endHours - 12;
    } else if (endHours === 0) {
      displayEndHours = 12;
    } else if (endHours === 12) {
      displayEndHours = 12;
    }
    
    const endTimeStr = `${displayEndHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
    
    return `${startTime} - ${endTimeStr}`;
  };

  // Update state when the modal opens with new values
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentDate);
      // Extract start time if it's a range (e.g., "9:00 AM - 1:00 PM" -> "9:00 AM")
      let normalizedTime = currentTime || '6:00 AM';
      if (normalizedTime.includes(' - ')) {
        normalizedTime = normalizedTime.split(' - ')[0];
      }
      setSelectedStartTime(normalizedTime);
      setLocation(currentLocation || 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891');
      
      // Calculate the time range
      const timeRange = calculateTimeRange(normalizedTime);
      setCalculatedTimeRange(timeRange);
      
      // Debug log to check values
      console.log('Modal opened with:', { currentDate, currentTime, normalizedTime, currentLocation, serviceType, timeRange });
    }
  }, [isOpen, currentDate, currentTime, currentLocation, serviceType]);

  // Update calculated time range when start time changes
  const handleStartTimeChange = (newStartTime: string) => {
    setSelectedStartTime(newStartTime);
    const timeRange = calculateTimeRange(newStartTime);
    setCalculatedTimeRange(timeRange);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the full time range to onConfirm
    onConfirm(location, selectedDate, calculatedTimeRange);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Confirm Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              Confirming appointment for: <strong>{bookingName}</strong>
            </p>
            
            {/* Date Field */}
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Time Field */}
            <div className="mb-4">
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Start Time
              </label>
              <select
                id="time"
                value={selectedStartTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {calculatedTimeRange && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm font-semibold text-emerald-800">
                    📅 Full Appointment Time: {calculatedTimeRange}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Duration: {SERVICE_DURATIONS[serviceType] || 6} hour{(SERVICE_DURATIONS[serviceType] || 6) !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
            
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Location
            </label>
            <textarea
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can edit the date, time, and location before confirming. These details will be included in the confirmation email sent to the applicant.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}