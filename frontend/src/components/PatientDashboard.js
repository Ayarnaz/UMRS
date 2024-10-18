import React, { useState, useEffect } from 'react';
import { Bell, Home, FileText, Calendar, Settings, LogOut, Search } from 'lucide-react';
import PatientMedicalRecords from './PatientMedicalRecords';
import PatientAppointments from './PatientAppointments';
import PatientProfileModal from './PatientProfileModal';

// Temporary placeholder components
const Button = ({ children, variant, size, ...props }) => <button className={`${variant} ${size}`} {...props}>{children}</button>;
const Card = ({ children }) => <div className="border p-4 rounded">{children}</div>;
const CardHeader = ({ children }) => <div className="mb-2">{children}</div>;
const CardTitle = ({ children }) => <h3 className="font-bold">{children}</h3>;
const CardContent = ({ children }) => <div>{children}</div>;

export default function PatientDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [recentTest, setRecentTest] = useState(null);
  const [recentPrescription, setRecentPrescription] = useState(null);
  const [recentMedicalRecord, setRecentMedicalRecord] = useState(null);
  const [activities, setActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch patient data
    fetch('/api/patient')
      .then(response => response.json())
      .then(data => setPatientData(data))
      .catch(error => console.error('Error fetching patient data:', error));

    // Fetch recent test result
    fetch('/api/patient/recent-test')
      .then(response => response.json())
      .then(data => setRecentTest(data))
      .catch(error => console.error('Error fetching recent test:', error));

    // Fetch recent prescription
    fetch('/api/patient/recent-prescription')
      .then(response => response.json())
      .then(data => setRecentPrescription(data))
      .catch(error => console.error('Error fetching recent prescription:', error));

    // Fetch recent medical record entry
    fetch('/api/patient/recent-medical-record')
      .then(response => response.json())
      .then(data => setRecentMedicalRecord(data))
      .catch(error => console.error('Error fetching recent medical record:', error));

    // Fetch activities
    fetch('/api/patient/activities')
      .then(response => response.json())
      .then(data => setActivities(data))
      .catch(error => console.error('Error fetching activities:', error));

    // Fetch appointments
    fetch('/api/patient/appointments')
      .then(response => response.json())
      .then(data => setAppointments(data || [])) // Ensure it's always an array
      .catch(error => console.error('Error fetching appointments:', error));
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-16 bg-white shadow-md flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-center border-b">
            <span className="font-bold text-xl">Logo</span>
          </div>
          <nav className="flex flex-col items-center py-4 space-y-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveView('dashboard')}
              title="Dashboard"
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveView('medicalRecords')}
              title="Medical Records"
            >
              <FileText className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveView('appointments')}
              title="Appointments"
            >
              <Calendar className="h-6 w-6" />
            </Button>
          </nav>
        </div>
        <div className="mb-4 flex flex-col items-center space-y-4">
          <Button variant="ghost" size="icon" title="Settings">
            <Settings className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" title="Logout">
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <img src="/placeholder.svg?height=32&width=32" alt="User" className="rounded-full" />
            </Button>
          </div>
        </header>

        {/* Content */}
        {activeView === 'dashboard' ? (
          <div className="p-6 space-y-6">
            {/* Medical Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Recent Medical Test Result</h2>
                {recentTest ? (
                  <>
                    <h3 className="text-md font-medium">{recentTest.name} <span className="text-green-500">- NEW</span></h3>
                    <p className="text-sm text-gray-500">{recentTest.lab}</p>
                    <p className="text-sm text-gray-500">{recentTest.date}</p>
                    <p className="text-sm text-gray-500">Note: {recentTest.note}</p>
                  </>
                ) : (
                  <p>No recent test results available.</p>
                )}
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">View Details</button>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Recent Prescription</h2>
                {recentPrescription ? (
                  <>
                    <h3 className="text-md font-medium">{recentPrescription.name} <span className="text-green-500">- NEW</span></h3>
                    <p className="text-sm text-gray-500">Prescribed by: {recentPrescription.doctor}</p>
                    <p className="text-sm text-gray-500">Date: {recentPrescription.date}</p>
                    <p className="text-sm text-gray-500">Instructions: {recentPrescription.instructions}</p>
                  </>
                ) : (
                  <p>No recent prescriptions available.</p>
                )}
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">View Details</button>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Recent Medical Record Entry</h2>
                {recentMedicalRecord ? (
                  <>
                    <h3 className="text-md font-medium">{recentMedicalRecord.title} <span className="text-green-500">- NEW</span></h3>
                    <p className="text-sm text-gray-500">Date: {recentMedicalRecord.date}</p>
                    <p className="text-sm text-gray-500">Doctor: {recentMedicalRecord.doctor}</p>
                    <p className="text-sm text-gray-500">Summary: {recentMedicalRecord.summary}</p>
                  </>
                ) : (
                  <p>No recent medical record entries available.</p>
                )}
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">View Details</button>
              </div>
            </div>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex flex-col items-center justify-center h-32 border rounded p-4">
                    <FileText className="h-8 w-8 mb-2" />
                    View Medical Records
                  </button>
                  <button className="flex flex-col items-center justify-center h-32 border rounded p-4">
                    <FileText className="h-8 w-8 mb-2" />
                    Upload a New Medical Document
                  </button>
                  <button className="flex flex-col items-center justify-center h-32 border rounded p-4">
                    <Calendar className="h-8 w-8 mb-2" />
                    Book an Appointment
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{activity?.description || 'No description available'}</span>
                        <span className="text-sm text-gray-500">{activity?.date || 'No date available'}</span>
                      </div>
                    ))
                  ) : (
                    <p>No activities to display.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeView === 'medicalRecords' ? (
          <PatientMedicalRecords />
        ) : (
          <PatientAppointments />
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Welcome Back {patientData?.name}!</h2>
          <button className="w-full bg-red-500 text-white px-4 py-2 rounded">Emergency Care</button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">My Appointments</h3>
          {/* Calendar component would go here */}
          <div className="bg-gray-100 p-2 text-center">Calendar Placeholder</div>
        </div>
        {appointments.length > 0 && appointments[0] && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center space-x-4">
              <Calendar className="h-10 w-10" />
              <div>
                <h4 className="font-semibold">{appointments[0].type || 'N/A'}</h4>
                <p className="text-sm text-gray-500">{appointments[0].date || 'N/A'}</p>
                <p className="text-sm">{appointments[0].note || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Patient Profile Modal */}
      <PatientProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
}
// Remove or comment out the unused NavItem function
// export function NavItem({ icon, text, active = false }) {
//   // ... existing NavItem code ...
// }
