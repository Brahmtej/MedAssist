import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Patient, Prescription, LabReport, Appointment, Hospital, UserProfile } from '@/lib/supabase'
import { LogOut, FileText, Pill, Calendar, Download, Activity, Plus, X, User, Upload, Camera, Edit2, Save, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OCRProcessor from '@/components/OCRProcessor'
import Chatbot from '@/components/Chatbot'

export default function PatientPortal() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [doctors, setDoctors] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPrescriptionScanModal, setShowPrescriptionScanModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [message, setMessage] = useState('')
  const [prescriptionScanForm, setPrescriptionScanForm] = useState({
    imageData: '',
    fileName: '',
    prescriptionText: ''
  })
  const [profileForm, setProfileForm] = useState({
    contact_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relation: ''
  })

  const [appointmentForm, setAppointmentForm] = useState({
    hospitalId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    chiefComplaint: ''
  })

  useEffect(() => {
    loadPatientData()
    loadHospitals()
  }, [user])

  useEffect(() => {
    if (patient) loadData()
  }, [activeTab, patient])

  useEffect(() => {
    if (appointmentForm.hospitalId) {
      loadDoctorsByHospital(appointmentForm.hospitalId)
    }
  }, [appointmentForm.hospitalId])

  async function loadPatientData() {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data) {
        setPatient(data)
        setProfileForm({
          contact_number: data.contact_number || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          allergies: data.allergies || '',
          chronic_conditions: data.chronic_conditions || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_number: data.emergency_contact_number || '',
          emergency_contact_relation: data.emergency_contact_relation || ''
        })
      }
    } catch (error) {
      console.error('Error loading patient data:', error)
    }
  }

  async function loadHospitals() {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true })
      
      if (!error && data) setHospitals(data)
    } catch (error) {
      console.error('Error loading hospitals:', error)
    }
  }

  async function loadDoctorsByHospital(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'doctor')
        .eq('hospital_id', hospitalId)
      
      if (!error && data) setDoctors(data)
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  async function loadData() {
    if (!patient) return

    setLoading(true)
    try {
      if (activeTab === 'prescriptions') {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patient.id)
          .order('date_issued', { ascending: false })
        if (!error && data) setPrescriptions(data)
      } else if (activeTab === 'lab-reports') {
        const { data, error } = await supabase
          .from('lab_reports')
          .select('*')
          .eq('patient_id', patient.id)
          .order('test_date', { ascending: false })
        if (!error && data) setLabReports(data)
      } else if (activeTab === 'appointments') {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patient.id)
          .order('appointment_datetime', { ascending: false })
        if (!error && data) setAppointments(data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return
    
    setLoading(true)
    setMessage('')

    try {
      const appointmentDateTime = `${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}:00`
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patient.id,
          doctor_id: appointmentForm.doctorId,
          hospital_id: appointmentForm.hospitalId,
          appointment_date: appointmentForm.appointmentDate,
          appointment_time: appointmentForm.appointmentTime,
          appointment_datetime: appointmentDateTime,
          chief_complaint: appointmentForm.chiefComplaint,
          status: 'scheduled'
        }])

      if (error) throw error

      setMessage('Appointment booked successfully!')
      setShowBookingModal(false)
      setAppointmentForm({
        hospitalId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        chiefComplaint: ''
      })
      loadData()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error booking appointment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('patients')
        .update(profileForm)
        .eq('id', patient.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setIsEditingProfile(false)
      loadPatientData()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleScanPrescription(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return

    setLoading(true)
    setMessage('')

    try {
      // Note: This saves the prescription text entered by patient
      // In production, this would go through doctor verification
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          patient_id: patient.id,
          prescription_text: prescriptionScanForm.prescriptionText,
          status: 'pending_verification',
          notes: 'Self-scanned by patient - requires doctor verification'
        }])

      if (error) throw error

      setMessage('Prescription saved! It will be verified by your doctor.')
      setShowPrescriptionScanModal(false)
      setPrescriptionScanForm({
        imageData: '',
        fileName: '',
        prescriptionText: ''
      })
      loadData()
      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      setMessage('Error saving prescription: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-600">MedAssist - Patient Portal</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {patient && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Health Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Health ID</p>
                <p className="font-medium">{patient.health_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="font-medium">{patient.blood_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
              </div>
            </div>
            {patient.allergies && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Allergies: {patient.allergies}</p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              <Activity size={18} />
              Overview
            </TabButton>
            <TabButton active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')}>
              <Pill size={18} />
              Prescriptions
            </TabButton>
            <TabButton active={activeTab === 'lab-reports'} onClick={() => setActiveTab('lab-reports')}>
              <FileText size={18} />
              Lab Reports
            </TabButton>
            <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
              <Calendar size={18} />
              Appointments
            </TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
              <User size={18} />
              Profile
            </TabButton>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard title="Prescriptions" value={prescriptions.length.toString()} icon="💊" color="blue" />
              <StatsCard title="Lab Reports" value={labReports.length.toString()} icon="🔬" color="green" />
              <StatsCard title="Appointments" value={appointments.length.toString()} icon="📅" color="purple" />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <Plus size={24} />
                Book New Appointment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Prescriptions</h3>
              <button
                onClick={() => setShowPrescriptionScanModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Camera size={18} />
                Scan Prescription
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Issued: {new Date(prescription.date_issued).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 mt-1">{prescription.prescription_text}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'dispensed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    {prescription.image_url && (
                      <a
                        href={prescription.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Download size={16} />
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <p className="px-6 py-8 text-gray-500 text-center">No prescriptions available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lab-reports' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">My Lab Reports</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {labReports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{report.test_name}</p>
                      <p className="text-sm text-gray-600 mt-1">Test Date: {new Date(report.test_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Lab: {report.lab_name || 'Hospital Lab'}</p>
                      {report.result_summary && (
                        <p className="text-sm text-gray-700 mt-2">{report.result_summary}</p>
                      )}
                    </div>
                    {report.report_url && (
                      <a
                        href={report.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {labReports.length === 0 && (
                <p className="px-6 py-8 text-gray-500 text-center">No lab reports available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setShowBookingModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Book New Appointment
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">My Appointments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <div key={apt.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{new Date(apt.appointment_datetime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">Doctor ID: {apt.doctor_id.substring(0, 8)}...</p>
                        <p className="text-sm text-gray-600">{apt.chief_complaint || 'General consultation'}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="px-6 py-8 text-gray-500 text-center">No appointments scheduled</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">My Profile</h3>
              {patient && !isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
            {patient && !isEditingProfile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900 font-medium">{patient.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health ID</label>
                    <p className="text-gray-900 font-medium">{patient.health_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <p className="text-gray-900 font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p className="text-gray-900 font-medium">{patient.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                    <p className="text-gray-900 font-medium">{patient.blood_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <p className="text-gray-900 font-medium">{patient.contact_number || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{patient.email || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City, State</label>
                    <p className="text-gray-900 font-medium">{patient.city && patient.state ? `${patient.city}, ${patient.state}` : 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900 font-medium">{patient.address || 'Not specified'}</p>
                  </div>
                </div>

                {(patient.allergies || patient.chronic_conditions) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {patient.allergies && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-yellow-900 mb-2">Allergies</h4>
                        <p className="text-sm text-yellow-800">{patient.allergies}</p>
                      </div>
                    )}
                    {patient.chronic_conditions && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Chronic Conditions</h4>
                        <p className="text-sm text-blue-800">{patient.chronic_conditions}</p>
                      </div>
                    )}
                  </div>
                )}

                {(patient.emergency_contact_name || patient.emergency_contact_number) && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-900 mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {patient.emergency_contact_name && (
                        <div>
                          <label className="block text-xs font-medium text-red-700 mb-1">Name</label>
                          <p className="text-sm text-red-800">{patient.emergency_contact_name}</p>
                        </div>
                      )}
                      {patient.emergency_contact_number && (
                        <div>
                          <label className="block text-xs font-medium text-red-700 mb-1">Phone</label>
                          <p className="text-sm text-red-800">{patient.emergency_contact_number}</p>
                        </div>
                      )}
                      {patient.emergency_contact_relation && (
                        <div>
                          <label className="block text-xs font-medium text-red-700 mb-1">Relation</label>
                          <p className="text-sm text-red-800">{patient.emergency_contact_relation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profile && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-4">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Email</label>
                        <p className="text-gray-900 font-medium">{profile.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                        <p className="text-gray-900 font-medium capitalize">{profile.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          profile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {patient && isEditingProfile && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={profileForm.contact_number}
                      onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <textarea
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="List any allergies..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                    <textarea
                      value={profileForm.chronic_conditions}
                      onChange={(e) => setProfileForm({ ...profileForm, chronic_conditions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="List any chronic conditions..."
                    />
                  </div>
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Emergency Contact</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact_name}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.emergency_contact_number}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact_relation}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_relation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {!patient && (
              <div className="text-center py-8 text-gray-500">
                <p>Loading profile information...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <Modal title="Book Appointment" onClose={() => setShowBookingModal(false)}>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
              <select
                required
                value={appointmentForm.hospitalId}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, hospitalId: e.target.value, doctorId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select hospital</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} - {h.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <select
                required
                disabled={!appointmentForm.hospitalId}
                value={appointmentForm.doctorId}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.user_id}>{d.full_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={appointmentForm.appointmentTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint / Reason</label>
              <textarea
                required
                rows={3}
                value={appointmentForm.chiefComplaint}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, chiefComplaint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe your symptoms or reason for visit..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription Scan Modal */}
      {showPrescriptionScanModal && (
        <Modal title="Scan Prescription" onClose={() => setShowPrescriptionScanModal(false)}>
          <form onSubmit={handleScanPrescription} className="space-y-4">
            <div>
              <OCRProcessor
                onTextExtracted={(text) => setPrescriptionScanForm({ ...prescriptionScanForm, prescriptionText: text })}
                onImageSelected={(imageData, fileName) => setPrescriptionScanForm({ ...prescriptionScanForm, imageData, fileName })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Details</label>
              <textarea
                required
                rows={6}
                value={prescriptionScanForm.prescriptionText}
                onChange={(e) => setPrescriptionScanForm({ ...prescriptionScanForm, prescriptionText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter prescription details or upload image above for automatic extraction..."
              />
              <p className="mt-2 text-sm text-gray-600">
                Note: This prescription will be saved and sent to your doctor for verification before it becomes active.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Prescription'}
              </button>
              <button
                type="button"
                onClick={() => setShowPrescriptionScanModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Floating Chat Button */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 z-40"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chatbot Component */}
      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-green-600 text-green-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function StatsCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
