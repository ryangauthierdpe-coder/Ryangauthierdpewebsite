import { Mail, X } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sendEmail: boolean) => void;
  action: string; // e.g., "cancel", "delete", "update", "confirm"
  applicantName: string;
  details?: string; // Optional additional details about the change
}

export function EmailConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  applicantName,
  details
}: EmailConfirmationModalProps) {
  if (!isOpen) return null;

  const actionText = {
    'cancel': 'cancellation',
    'delete': 'cancellation',
    'update': 'appointment update',
    'confirm': 'confirmation'
  }[action] || 'change';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Email Notification
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Would you like to notify <strong>{applicantName}</strong> of this {actionText}?
          </p>
          {details && (
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {details}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onConfirm(false);
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            No, Don't Send
          </button>
          <button
            onClick={() => {
              onConfirm(true);
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Yes, Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
