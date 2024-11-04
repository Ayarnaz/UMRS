import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../services/api';
import { Button } from '../../../components/ui/button';

export default function ProfessionalAppointmentModal({ isOpen, onClose, appointment, onAppointmentUpdated, user }) {
  const [formData, setFormData] = useState({
    patientPHN: '',
    appointmentDate: '',
    appointmentTime: '',
    purpose: '',
    notes: '',
    status: 'Scheduled'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      const date = appointment.start ? new Date(appointment.start) : new Date();
      setFormData({
        patientPHN: appointment.extendedProps?.patientPHN || '',
        appointmentDate: date.toISOString().split('T')[0],
        appointmentTime: date.toTimeString().split(' ')[0].slice(0, 5),
        purpose: appointment.title?.split(' - ')[1] || '',
        notes: appointment.extendedProps?.notes || '',
        status: appointment.extendedProps?.status || 'Scheduled'
      });
    }
  }, [appointment]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        slmcNo: user.slmcNo,
        patientPHN: formData.patientPHN,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        purpose: formData.purpose,
        notes: formData.notes,
        status: formData.status
      };

      if (appointment?.id) {
        await api.put(`/api/professional/appointments/${appointment.id}`, payload);
      } else {
        await api.post('/api/professional/appointments', payload);
      }

      onAppointmentUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
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

          <div className="flex justify-end space-x-3 mt-6">
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