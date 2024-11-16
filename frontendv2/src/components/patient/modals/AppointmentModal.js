import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import moment from 'moment';
import api from '../../../services/api';

export default function AppointmentModal({ isOpen, onClose, appointment, onAppointmentUpdated, user }) {
  const [formData, setFormData] = useState({
    slmcNo: '',
    healthInstituteNumber: '',
    appointmentDate: '',
    appointmentTime: '',
    purpose: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment) {
      if (appointment.start && !appointment.id) {
        setFormData({
          slmcNo: '',
          healthInstituteNumber: '',
          appointmentDate: moment(appointment.start).format('YYYY-MM-DD'),
          appointmentTime: moment(appointment.start).format('HH:mm'),
          purpose: '',
          notes: ''
        });
      } else {
        setFormData({
          slmcNo: appointment.resource?.slmcNo || '',
          healthInstituteNumber: appointment.resource?.healthInstituteNumber || '',
          appointmentDate: moment(appointment.start).format('YYYY-MM-DD'),
          appointmentTime: moment(appointment.start).format('HH:mm'),
          purpose: appointment.title?.split(' - ')[0] || '',
          notes: appointment.resource?.notes || ''
        });
      }
    } else {
      setFormData({
        slmcNo: '',
        healthInstituteNumber: '',
        appointmentDate: moment().format('YYYY-MM-DD'),
        appointmentTime: moment().format('HH:mm'),
        purpose: '',
        notes: ''
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        personalHealthNo: user.userIdentifier,
        status: 'Scheduled'
      };

      if (appointment?.id) {
        await api.put(`/api/patient/appointments/${appointment.id}`, payload);
      } else {
        await api.post('/api/patient/appointments', payload);
      }

      onAppointmentUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError(error.response?.data?.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Healthcare Professional ID</label>
            <input
              type="text"
              value={formData.slmcNo}
              onChange={(e) => setFormData({ ...formData, slmcNo: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Healthcare Institute</label>
            <input
              type="text"
              value={formData.healthInstituteNumber}
              onChange={(e) => setFormData({ ...formData, healthInstituteNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : (appointment?.id ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 