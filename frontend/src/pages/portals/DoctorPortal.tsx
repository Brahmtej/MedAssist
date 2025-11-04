import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Patient, MedicalRecord, Prescription, Appointment } from '@/lib/supabase'
import { LogOut, Search, FileText, Pill, Calendar, User, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OCRProcessor from '@/components/OCRProcessor'

export default function DoctorPortal() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('patients')
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [message, setMessage] = useState('')

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    prescriptionText: '',
    validUntil: '',
    notes: '',
    imageData: '',
    fileName: ''
  })

  const [medicalRecordForm, setMedicalRecordForm] = useState({
    patientId: '',
    chiefComplaint: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: ''
    }
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'patients') {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (!error && data) setPatients(data)
      } else if (activeTab === 'appointments') {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', user?.id || '')
          .order('appointment_datetime', { ascending: true })
        if (!error && data) setAppointments(data)
      } else if (activeTab === 'prescriptions') {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('doctor_id', user?.id || '')
          .order('date_issued', { ascending: false })
          .limit(50)
        if (!error && data) setPrescriptions(data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePrescription(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          patient_id: prescriptionForm.patientId,
          doctor_id: user?.id,
          prescription_text: prescriptionForm.prescriptionText,
          valid_until: prescriptionForm.validUntil || null,
          notes: prescriptionForm.notes,
          status: 'active'
        }])

      if (error) throw error

      setMessage('Prescription created successfully!')
      setShowPrescriptionModal(false)
      setPrescriptionForm({ patientId: '', prescriptionText: '', validUntil: '', notes: '', imageData: '', fileName: '' })
      loadData()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateMedicalRecord(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: medicalRecordForm.patientId,
          doctor_id: user?.id,
          visit_date: new Date().toISOString(),
          chief_complaint: medicalRecordForm.chiefComplaint,
          diagnosis: medicalRecordForm.diagnosis,
          treatment_plan: medicalRecordForm.treatmentPlan,
          notes: medicalRecordForm.notes,
          vital_signs: medicalRecordForm.vitalSigns,
          status: 'active'
        }])

      if (error) throw error

      setMessage('Medical record created successfully!')
      setShowMedicalRecordModal(false)
      setMedicalRecordForm({
        patientId: '',
        chiefComplaint: '',
        diagnosis: '',
        treatmentPlan: '',
        notes: '',
        vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', respiratoryRate: '' }
      })
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.health_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">MedAssist - Doctor Portal</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Dr. {profile?.full_name}</span>
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

        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <TabButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
              <User size={18} />
              Patients
            </TabButton>
            <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
              <Calendar size={18} />
              Appointments
            </TabButton>
            <TabButton active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')}>
              <Pill size={18} />
              Prescriptions
            </TabButton>
            <TabButton active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
              <FileText size={18} />
              Medical Records
            </TabButton>
          </div>
        </div>

        {activeTab === 'patients' && (
          <div>
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients by name or health ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                New Prescription
              </button>
              <button
                onClick={() => setShowMedicalRecordModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                New Record
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allergies</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.health_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.blood_type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.contact_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{patient.allergies || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Prescriptions</h3>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                New
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Patient ID: {prescription.patient_id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600 mt-1">{prescription.prescription_text}</p>
                      <p className="text-xs text-gray-500 mt-1">Issued: {new Date(prescription.date_issued).toLocaleDateString()}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'dispensed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <p className="px-6 py-8 text-gray-500 text-center">No prescriptions created yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Patient ID: {apt.patient_id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(apt.appointment_datetime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{apt.chief_complaint || 'General consultation'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Prescription Modal */}
      {showPrescriptionModal && (
        <Modal title="Create New Prescription" onClose={() => setShowPrescriptionModal(false)}>
          <form onSubmit={handleCreatePrescription} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                required
                value={prescriptionForm.patientId}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.health_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Prescription Image (Optional)</label>
              <OCRProcessor
                onTextExtracted={(text) => setPrescriptionForm({ ...prescriptionForm, prescriptionText: text })}
                onImageSelected={(imageData, fileName) => setPrescriptionForm({ ...prescriptionForm, imageData, fileName })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Details</label>
              <textarea
                required
                rows={4}
                value={prescriptionForm.prescriptionText}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescriptionText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter prescription details (or upload image above for automatic extraction)..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Review and edit the extracted text above. OCR may require manual corrections.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
              <input
                type="date"
                value={prescriptionForm.validUntil}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows={2}
                value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Prescription'}
              </button>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Medical Record Modal */}
      {showMedicalRecordModal && (
        <Modal title="Create Medical Record" onClose={() => setShowMedicalRecordModal(false)}>
          <form onSubmit={handleCreateMedicalRecord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                required
                value={medicalRecordForm.patientId}
                onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.health_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
              <input
                type="text"
                required
                value={medicalRecordForm.chiefComplaint}
                onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, chiefComplaint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              <textarea
                required
                rows={3}
                value={medicalRecordForm.diagnosis}
                onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
              <textarea
                required
                rows={3}
                value={medicalRecordForm.treatmentPlan}
                onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, treatmentPlan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Record'}
              </button>
              <button
                type="button"
                onClick={() => setShowMedicalRecordModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
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
