import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [selectedPortal, setSelectedPortal] = useState('patient');
  const [loginButtonClicked, setLoginButtonClicked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handlePortalChange = (portal) => {
    setSelectedPortal(portal);
    setLoginButtonClicked(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginButtonClicked) {
      setLoginButtonClicked(true);
    } else {
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: username,
            password: password,
            portal_type: selectedPortal
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          // Store the token in localStorage or a secure cookie
          localStorage.setItem('token', data.message);
          // Redirect to dashboard or appropriate page
          navigate('/dashboard');
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const getRegistrationPath = () => {
    switch(selectedPortal) {
      case 'patient':
        return '/patient-signup';
      case 'healthcare_professional':
        return '/healthcare-professional-signup';
      case 'healthcare_institute':
        return '/healthcare-institute-signup';
      default:
        return '/';
    }
  };

  return (
    <div className="bg-white flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">UNITED MEDICAL RECORD SYSTEM</h1>
        <div className="inline-block bg-white border border-gray-300 rounded-lg shadow-lg p-6" style={{width: '300px'}}>
          <div className="flex justify-center mb-4">
            <a href="#patient-portal" 
               className={`p-2 ${selectedPortal === 'patient' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'} rounded-l-lg`}
               style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
               onClick={() => handlePortalChange('patient')}>
              <i className="fas fa-user" style={{fontSize: '24px'}}></i>
            </a>
            <a href="#healthcare-professional-portal"
               className={`p-2 ${selectedPortal === 'healthcare_professional' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
               style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
               onClick={() => handlePortalChange('healthcare_professional')}>
              <i className="fas fa-user-md" style={{fontSize: '24px'}}></i>
            </a>
            <a href="#healthcare-institute-portal"
               className={`p-2 ${selectedPortal === 'healthcare_institute' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'} rounded-r-lg`}
               style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
               onClick={() => handlePortalChange('healthcare_institute')}>
              <i className="fas fa-hospital" style={{fontSize: '24px'}}></i>
            </a>
          </div>
          <form onSubmit={handleLogin}>
            {loginButtonClicked && (
              <div>
                <input 
                  type="text" 
                  name="username" 
                  placeholder={selectedPortal === 'patient' ? "Personal Health No" : selectedPortal === 'healthcare_professional' ? "SLMC No" : "Healthcare Institute No"} 
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input type="hidden" name="portal_type" value={selectedPortal} />
              </div>
            )}
            <button type="submit" className="bg-black text-white font-bold py-2 px-4 rounded w-full mb-2">
              {loginButtonClicked ? 'Submit' : 'Log In'}
            </button>
          </form>
          <p className="mb-2">Or</p>
          <Link to={getRegistrationPath()} className="bg-black text-white font-bold py-2 px-4 rounded w-full mb-2 text-center block">
            Register
          </Link>
          <p id="portal-type-text">
            As a {selectedPortal === 'patient' ? 'Patient' : selectedPortal === 'healthcare_professional' ? 'Healthcare Professional' : 'Healthcare Institute'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
