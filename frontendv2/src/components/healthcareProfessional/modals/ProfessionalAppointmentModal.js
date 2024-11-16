import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../services/api';
import { Button } from '../../../components/ui/button';

function ProfessionalAppointmentModal({ isOpen, onClose, appointment, onAppointmentUpdated, user }) {
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientPHN: '',
    slmcNo: '',
    healthInstituteNumber: '',
    appointmentDate: '',
    appointmentTime: '',
    purpose: '',
    status: 'Scheduled',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && appointment) {
      // Convert the appointment start time to date and time components
      const startDate = new Date(appointment.start);
      const formattedDate = startDate.toISOString().split('T')[0];
      const formattedTime = startDate.toTimeString().slice(0, 5);

      setFormData({
        appointmentId: appointment.id,
        patientPHN: appointment.extendedProps.patientPHN,
        slmcNo: user?.slmcNo || '',
        healthInstituteNumber: appointment.extendedProps.healthInstituteNumber,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        purpose: appointment.title.split(' - ')[1] || '',
        status: appointment.extendedProps.status || 'Scheduled',
        notes: appointment.extendedProps.notes || ''
      });
    } else {
      // Reset form for new appointments
      setFormData({
        appointmentId: '',
        patientPHN: '',
        slmcNo: user?.slmcNo || '',
        healthInstituteNumber: user?.healthInstituteNumber || '',
        appointmentDate: '',
        appointmentTime: '',
        purpose: '',
        status: 'Scheduled',
        notes: ''
      });
    }
  }, [isOpen, appointment, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Check if user and SLMC number exist using userIdentifier
      if (!user?.userIdentifier) {
        setError('User SLMC number not found. Please try logging in again.');
        return;
      }

      const payload = {
        patientPHN: formData.patientPHN,
        slmcNo: user.userIdentifier, // Use userIdentifier instead of slmcNo
        healthInstituteNumber: formData.healthInstituteNumber || '',
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        purpose: formData.purpose,
        status: formData.status || 'Scheduled',
        notes: formData.notes || ''
      };

      console.log('Submitting appointment with payload:', payload);

      if (appointment?.id) {
        await api.put(`/api/professional/appointments/${appointment.id}`, payload);
      } else {
        await api.post('/api/professional/appointments', payload);
      }

      onAppointmentUpdated();
      onClose();
    } catch (err) {
      console.error('Error submitting appointment:', err);
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!appointment?.id) return;
      
      const response = await api.delete(`/api/professional/appointments/${appointment.id}`);
      if (response.status === 200) {
        onAppointmentUpdated(); // Refresh the appointments list
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient PHN</label>
            <input
              type="text"
              value={formData.patientPHN}
              onChange={(e) => setFormData({ ...formData, patientPHN: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {appointment?.id && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {appointment?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this appointment?')) {
                    handleDelete();
                  }
                }}
                className="!bg-red-500 hover:!bg-red-600 text-white mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (appointment?.id ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalAppointmentModal; 