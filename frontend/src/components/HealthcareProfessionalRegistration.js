import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HealthcareProfessionalRegistration() {
  const [formData, setFormData] = useState({
    slmcNo: '', name: '', specialty: '', phoneNumber: '', email: '', address: '', healthInstituteNumber: '', password: '', nic: '', role: ''
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
          userType: 'healthcare_professional',
          portal_type: 'healthcare_professional',
          userIdentifier: formData.slmcNo,
          username: formData.slmcNo,
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
      <h2 className="text-2xl font-bold mb-4">Healthcare Professional Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="slmcNo" placeholder="SLMC Number" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="nic" placeholder="NIC" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="specialty" placeholder="Specialty" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="healthInstituteNumber" placeholder="Health Institute Number" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="text" name="role" placeholder="Role" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-2" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border border-gray-300 rounded p-2 w-full mb-4" required />
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full">Register</button>
      </form>
    </div>
  );
}

export default HealthcareProfessionalRegistration;
