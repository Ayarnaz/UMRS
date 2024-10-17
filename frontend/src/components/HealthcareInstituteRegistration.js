import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HealthcareInstituteRegistration() {
  const [formData, setFormData] = useState({
    instituteNumber: '', name: '', address: '', email: '', phoneNumber: '', type: '', password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          ...formData,
          userType: 'healthcare_institute',
          portal_type: 'healthcare_institute',
          userIdentifier: formData.instituteNumber,
          username: formData.instituteNumber,
          twoFAPreference: 'email'
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Registration successful');
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-4">Healthcare Institute Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="instituteNumber" placeholder="Health Institute Number" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="type" placeholder="Type (e.g. Hospital, Clinic)" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-4" required />
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full">Register</button>
      </form>
    </div>
  );
}

export default HealthcareInstituteRegistration;
