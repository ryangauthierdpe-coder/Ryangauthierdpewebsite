import { CheckCircle } from 'lucide-react';

interface BookingEditFormProps {
  editingBookingData: any;
  setEditingBookingData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  savingBooking: boolean;
  booking: any;
  getServiceTypeLabel: (type: string) => string;
  getRetestCertificationLabel: (type: string) => string;
}

const TIME_OPTIONS = [
  "6:00 AM", "6:15 AM", "6:30 AM", "6:45 AM",
  "7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM",
  "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM",
  "9:00 AM", "9:15 AM", "9:30 AM", "9:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
  "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
  "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
  "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
  "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
  "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
  "6:00 PM", "6:15 PM", "6:30 PM", "6:45 PM",
  "7:00 PM", "7:15 PM", "7:30 PM", "7:45 PM",
  "8:00 PM"
];

export function BookingEditForm({
  editingBookingData,
  setEditingBookingData,
  onSave,
  onCancel,
  savingBooking,
  booking,
  getServiceTypeLabel,
  getRetestCertificationLabel
}: BookingEditFormProps) {
  const WST_LOCATION = 'Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891';
  const GON_LOCATION = 'Groton/New London Airport (GON) - 155 Tower Avenue, Groton, CT 06340';

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-sm text-blue-800 font-semibold">Editing Booking - Make your changes below</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={editingBookingData.selectedDate}
            onChange={(e) => setEditingBookingData({ ...editingBookingData, selectedDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Time</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editingBookingData.startTime}
              onChange={(e) => {
                const start = e.target.value;
                const end = editingBookingData.endTime;
                setEditingBookingData({ 
                  ...editingBookingData, 
                  startTime: start,
                  selectedTime: start && end ? `${start} - ${end}` : start
                });
              }}
              className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">Start...</option>
              {TIME_OPTIONS.map(time => (
                <option key={`start-${time}`} value={time}>{time}</option>
              ))}
            </select>
            <select
              value={editingBookingData.endTime}
              onChange={(e) => {
                const end = e.target.value;
                const start = editingBookingData.startTime;
                setEditingBookingData({ 
                  ...editingBookingData, 
                  endTime: end,
                  selectedTime: start && end ? `${start} - ${end}` : end
                });
              }}
              className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">End...</option>
              {TIME_OPTIONS.map(time => (
                <option key={`end-${time}`} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
          <select
            value={
              editingBookingData.location === WST_LOCATION ? 'WST' :
              editingBookingData.location === GON_LOCATION ? 'GON' :
              'MANUAL'
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'WST') {
                setEditingBookingData({ ...editingBookingData, location: WST_LOCATION });
              } else if (value === 'GON') {
                setEditingBookingData({ ...editingBookingData, location: GON_LOCATION });
              } else {
                setEditingBookingData({ ...editingBookingData, location: '' });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="WST">Westerly State Airport (WST) - 56 Airport Road, Westerly, RI 02891</option>
            <option value="GON">Groton/New London Airport (GON) - 155 Tower Avenue, Groton, CT 06340</option>
            <option value="MANUAL">Manual (Enter Custom Location)</option>
          </select>
          {(editingBookingData.location !== WST_LOCATION && 
            editingBookingData.location !== GON_LOCATION) && (
            <input
              type="text"
              value={editingBookingData.location || ''}
              onChange={(e) => setEditingBookingData({ ...editingBookingData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-2"
              placeholder="Enter custom location..."
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Exam Fee</label>
          <input
            type="text"
            value={editingBookingData.examFee || ''}
            onChange={(e) => setEditingBookingData({ ...editingBookingData, examFee: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g., $950"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Notes</label>
          <textarea
            value={editingBookingData.notes || ''}
            onChange={(e) => setEditingBookingData({ ...editingBookingData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add notes about this booking..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onSave}
          disabled={savingBooking}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold"
        >
          {savingBooking ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-sm text-gray-500 mb-2">Read-only information:</p>
        <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">IACRA FTN</label>
            <p className="text-gray-700 text-sm">{booking.iacraFtn}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Aircraft</label>
            <p className="text-gray-700 text-sm">{booking.aircraftMakeModel}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service Type</label>
            <p className="text-gray-700 text-sm">{getServiceTypeLabel(booking.serviceType)}</p>
          </div>
          {booking.retestCertificationType && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Retest For</label>
              <p className="text-gray-700 text-sm">{getRetestCertificationLabel(booking.retestCertificationType)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
