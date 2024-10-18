import React, { useState, useEffect } from 'react'
import { Search, Plus, RefreshCw, Eye, Edit, Trash, FileText, Download, User, Stethoscope, Pill } from 'lucide-react'
import AddDocumentModal from './AddDocumentModal'
import AddRecordModal from './AddRecordModal'

// Temporary placeholder components
const Button = ({ children, ...props }) => <button {...props}>{children}</button>
const Card = ({ children }) => <div className="border p-4 rounded">{children}</div>
const CardHeader = ({ children }) => <div className="mb-2">{children}</div>
const CardTitle = ({ children }) => <h3 className="font-bold">{children}</h3>
const CardContent = ({ children }) => <div>{children}</div>
const Table = ({ children }) => <table className="w-full">{children}</table>
const TableHeader = ({ children }) => <thead>{children}</thead>
const TableBody = ({ children }) => <tbody>{children}</tbody>
const TableRow = ({ children }) => <tr>{children}</tr>
const TableHead = ({ children }) => <th className="text-left p-2">{children}</th>
const TableCell = ({ children }) => <td className="p-2">{children}</td>

export default function PatientMedicalRecords() {
  const [activeTab, setActiveTab] = useState('records')
  const [patientInfo, setPatientInfo] = useState(null)
  const [recentDiagnosis, setRecentDiagnosis] = useState(null)
  const [ongoingPrescriptions, setOngoingPrescriptions] = useState([])
  const [medicalDocuments, setMedicalDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const [patientResponse, diagnosisResponse, prescriptionsResponse, medicalDocumentsResponse] = await Promise.all([
          fetch('/api/patient'),
          fetch('/api/patient/recent-diagnosis'),
          fetch('/api/patient/ongoing-prescriptions'),
          fetch('/api/patient/medical-documents')
        ])

        if (!patientResponse.ok || !diagnosisResponse.ok || !prescriptionsResponse.ok || !medicalDocumentsResponse.ok) {
          throw new Error('One or more API requests failed')
        }

        const [patientData, diagnosisData, prescriptionsData, medicalDocumentsData] = await Promise.all([
          patientResponse.json(),
          diagnosisResponse.json(),
          prescriptionsResponse.json(),
          medicalDocumentsResponse.json()
        ])

        console.log('Patient Data:', patientData)
        console.log('Diagnosis Data:', diagnosisData)
        console.log('Prescriptions Data:', prescriptionsData)
        console.log('Medical Documents Data:', medicalDocumentsData)

        setPatientInfo(patientData)
        setRecentDiagnosis(diagnosisData)
        setOngoingPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : [])
        
        if (Array.isArray(medicalDocumentsData)) {
          setMedicalDocuments(medicalDocumentsData)
        } else {
          console.error('Received non-array data for medical documents:', medicalDocumentsData)
          setMedicalDocuments([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again later.')
        setMedicalDocuments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const renderMedicalDocumentsTab = () => (
    <>
      <h1 className="text-2xl font-bold mb-4">Medical Documents</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAddDocumentModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Document
          </Button>
          <Button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
            <RefreshCw className="mr-2 h-4 w-4" /> Reload
          </Button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Document"
            className="pl-10 pr-4 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicalDocuments.filter(doc => doc != null).map((doc, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{doc.documentType || 'N/A'}</TableCell>
              <TableCell>{doc.uploadedBy || 'N/A'}</TableCell>
              <TableCell>{doc.details || 'N/A'}</TableCell>
              <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <nav className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              className={`px-3 py-1 rounded ${
                page === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {page}
            </Button>
          ))}
        </nav>
      </div>

      <AddDocumentModal 
        isOpen={isAddDocumentModalOpen} 
        onClose={() => setIsAddDocumentModalOpen(false)} 
      />
    </>
  )

  const records = [
    { id: 1, type: 'Appointment', updatedBy: 'You', summary: 'Diabetes', date: 'Today' },
    { id: 2, type: 'Test Result', updatedBy: 'Test Labs', summary: 'Blood Test Results - Stable...', date: 'Yesterday' },
    { id: 3, type: 'Scan', updatedBy: 'Test Labs', summary: 'X-ray - Thoracic', date: '01/03' },
    { id: 4, type: 'Prescription', updatedBy: 'You', summary: 'Cholesterol', date: '01/03' },
    { id: 5, type: 'Scan', updatedBy: 'Hope Hospital', summary: 'CT Scan - Normal', date: '02/02' },
  ]

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const renderRecordsTable = () => (
    <Card className="mt-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Medical Record History</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => setIsAddRecordModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Record
            </Button>
            <Button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
              <RefreshCw className="mr-2 h-4 w-4" /> Reload
            </Button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.updatedBy}</TableCell>
                <TableCell>{record.summary}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {record.updatedBy === 'You' && (
                      <>
                        <Button className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'records' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Medical Records
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'documents' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Medical Documents
        </button>
      </div>

      {activeTab === 'records' ? (
        <>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          
          {/* Patient Info, Recent Diagnosis, and Ongoing Prescriptions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Info Card */}
            {patientInfo && (
              <Card>
                <CardContent className="flex flex-col items-center">
                  <User size={64} className="text-gray-400 mb-2" />
                  <p className="font-semibold text-center">{patientInfo.name} | {patientInfo.gender}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-semibold">{patientInfo.height} cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-semibold">{patientInfo.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BMI</p>
                      <p className="font-semibold">{patientInfo.bmi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="font-semibold">{patientInfo.bloodType}</p>
                    </div>
                  </div>
                  <div className="mt-4 w-full">
                    <p className="text-sm text-gray-500">Medical Conditions</p>
                    <p className="font-semibold">{patientInfo.medicalConditions}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Diagnosis Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="mr-2" size={20} />
                  Recent Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentDiagnosis ? (
                  <>
                    <p className="text-lg font-semibold">{recentDiagnosis.condition}</p>
                    <p className="text-sm text-gray-500">Diagnosed on {recentDiagnosis.date}</p>
                    <p className="mt-2">{recentDiagnosis.description}</p>
                  </>
                ) : (
                  <p>No recent diagnosis available.</p>
                )}
              </CardContent>
            </Card>

            {/* Ongoing Prescriptions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="mr-2" size={20} />
                  Ongoing Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(ongoingPrescriptions) && ongoingPrescriptions.length > 0 ? (
                  <ul className="space-y-2">
                    {ongoingPrescriptions.map((prescription, index) => (
                      prescription && prescription.medication ? (
                        <li key={index}>
                          <p className="font-semibold">{prescription.medication}</p>
                          <p className="text-sm text-gray-500">{prescription.dosage}</p>
                        </li>
                      ) : null
                    ))}
                  </ul>
                ) : (
                  <p>No ongoing prescriptions.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {renderRecordsTable()}
        </>
      ) : (
        renderMedicalDocumentsTab()
      )}

      <AddRecordModal 
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)} 
      />
    </div>
  )
}
