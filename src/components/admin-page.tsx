import { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, Plane, Clock, User, FileText, AlertCircle, Download, Send, ExternalLink, LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Booking {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  iacraFtn: string;
  aircraftMakeModel: string;
  serviceType: string;
  selectedDate: string;
  selectedTime: string;
  createdAt: string;
  status: string;
}

interface AdminPageProps {
  onLogout?: () => void;
}

export function AdminPage({ onLogout }: AdminPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string>('');
  const [sendingReminder, setSendingReminder] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e4d9f7d7/bookings`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const labels: { [key: string]: string } = {
      'checkride': 'Private Pilot ASEL Checkride ($850)',
      'foreign': 'Foreign Pilot Examiner ($250)',
      'military': 'Military Competency Examiner ($250)',
      'cfi-renewal': 'Flight Instructor Renewal ($250)',
      'remote': 'Remote Pilot Examiner ($250)',
      'sic': 'SIC Type Ratings ($250)',
      'soe': 'SOE Limitation Removals ($250)',
      'atp': 'ATP Limitation Removals ($250)',
      'night': 'Night Flight Limitation Removals ($250)'
    };
    return labels[serviceType] || serviceType;
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const upcomingBookings = filteredBookings.filter(b => {
    const bookingDate = new Date(b.selectedDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  });

  const pastBookings = filteredBookings.filter(b => {
    const bookingDate = new Date(b.selectedDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  });

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e4d9f7d7/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status');
      }

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.bookingId === bookingId ? { ...b, status: newStatus } : b
        )
      );

      alert('Booking status updated successfully!');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
    } finally {
      setUpdatingStatus('');
    }
  };

  const sendEmailReminder = async (bookingId: string) => {
    setSendingReminder(bookingId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e4d9f7d7/bookings/${bookingId}/send-reminder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email reminder');
      }

      alert('Email reminder sent successfully!');
    } catch (err) {
      console.error('Error sending email reminder:', err);
      alert(err instanceof Error ? err.message : 'Failed to send email reminder');
    } finally {
      setSendingReminder('');
    }
  };

  const generateGoogleCalendarUrl = (booking: Booking) => {
    const appointmentDate = new Date(booking.selectedDate + 'T00:00:00');
    const [hours, minutes] = booking.selectedTime.match(/(\d+):(\d+)/)?.slice(1) || [];
    const isPM = booking.selectedTime.includes('PM') && hours !== '12';
    const isAM = booking.selectedTime.includes('AM') && hours === '12';
    
    let hour = parseInt(hours);
    if (isPM) hour += 12;
    if (isAM) hour = 0;
    
    appointmentDate.setHours(hour, parseInt(minutes), 0, 0);
    
    const startTime = appointmentDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Assume 6 hour duration
    const endDate = new Date(appointmentDate.getTime() + 6 * 60 * 60 * 1000);
    const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(`DPE Appointment - ${booking.name}`);
    const details = encodeURIComponent(
      `Service: ${getServiceTypeLabel(booking.serviceType)}\n` +
      `IACRA FTN: ${booking.iacraFtn}\n` +
      `Aircraft: ${booking.aircraftMakeModel}\n` +
      `Email: ${booking.email}\n` +
      `Phone: ${booking.phone}`
    );
    const location = encodeURIComponent('Westerly State Airport (WST), 58 Airport Road, Westerly, RI 02891');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Date', 'Time', 'Service', 'IACRA FTN', 'Aircraft', 'Status', 'Submitted'];
    const rows = bookings.map(b => [
      b.name,
      b.email,
      b.phone,
      b.selectedDate,
      b.selectedTime,
      getServiceTypeLabel(b.serviceType),
      b.iacraFtn,
      b.aircraftMakeModel,
      b.status,
      formatTimestamp(b.createdAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your appointment bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-emerald-600">{upcomingBookings.length}</p>
              </div>
              <Clock className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Past</p>
                <p className="text-3xl font-bold text-gray-500">{pastBookings.length}</p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label className="font-semibold">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={bookings.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No appointments have been scheduled yet.'
                : `No ${filterStatus} bookings found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="bg-white border-2 border-emerald-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.name}</h3>
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedBooking(selectedBooking?.bookingId === booking.bookingId ? null : booking)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          {selectedBooking?.bookingId === booking.bookingId ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                          <span className="font-semibold">{formatDate(booking.selectedDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                          <span>{booking.selectedTime}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-5 h-5 mr-2 text-emerald-600" />
                          <a href={`mailto:${booking.email}`} className="hover:underline">{booking.email}</a>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-5 h-5 mr-2 text-emerald-600" />
                          <a href={`tel:${booking.phone}`} className="hover:underline">{booking.phone}</a>
                        </div>
                      </div>

                      {selectedBooking?.bookingId === booking.bookingId && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">IACRA FTN</label>
                              <p className="text-gray-900">{booking.iacraFtn}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Aircraft</label>
                              <p className="text-gray-900 flex items-center">
                                <Plane className="w-4 h-4 mr-2 text-emerald-600" />
                                {booking.aircraftMakeModel}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Service Type</label>
                              <p className="text-gray-900">{getServiceTypeLabel(booking.serviceType)}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Booking ID</label>
                              <p className="text-gray-500 text-sm font-mono">{booking.bookingId}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Submitted</label>
                              <p className="text-gray-500 text-sm">{formatTimestamp(booking.createdAt)}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-semibold text-gray-600">Update Status:</label>
                              <select
                                value={booking.status}
                                onChange={(e) => updateBookingStatus(booking.bookingId, e.target.value)}
                                disabled={updatingStatus === booking.bookingId}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <a
                              href={generateGoogleCalendarUrl(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Add to Google Calendar
                            </a>
                            <button
                              onClick={() => sendEmailReminder(booking.bookingId)}
                              disabled={sendingReminder === booking.bookingId}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              {sendingReminder === booking.bookingId ? 'Sending...' : 'Send Email Reminder'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-600">Past Appointments</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow opacity-75"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-700 mb-1">{booking.name}</h3>
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedBooking(selectedBooking?.bookingId === booking.bookingId ? null : booking)}
                          className="text-gray-600 hover:text-gray-700 font-semibold"
                        >
                          {selectedBooking?.bookingId === booking.bookingId ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="font-semibold">{formatDate(booking.selectedDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{booking.selectedTime}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-5 h-5 mr-2 text-gray-400" />
                          <a href={`mailto:${booking.email}`} className="hover:underline">{booking.email}</a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-5 h-5 mr-2 text-gray-400" />
                          <a href={`tel:${booking.phone}`} className="hover:underline">{booking.phone}</a>
                        </div>
                      </div>

                      {selectedBooking?.bookingId === booking.bookingId && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">IACRA FTN</label>
                              <p className="text-gray-700">{booking.iacraFtn}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Aircraft</label>
                              <p className="text-gray-700 flex items-center">
                                <Plane className="w-4 h-4 mr-2 text-gray-400" />
                                {booking.aircraftMakeModel}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Service Type</label>
                              <p className="text-gray-700">{getServiceTypeLabel(booking.serviceType)}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Booking ID</label>
                              <p className="text-gray-500 text-sm font-mono">{booking.bookingId}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-600 mb-1">Submitted</label>
                              <p className="text-gray-500 text-sm">{formatTimestamp(booking.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}