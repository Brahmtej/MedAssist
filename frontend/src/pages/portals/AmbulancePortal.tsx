import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LogOut, AlertCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AmbulancePortal() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [patientHealthId, setPatientHealthId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [emergencyType, setEmergencyType] = useState('')
  const [patientData, setPatientData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmergencyAccess(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPatientData(null)
    setLoading(true)

    try {
      const { data, error: accessError } = await supabase.functions.invoke('emergency-access', {
        body: {
          patientHealthId,
          purpose,
          emergencyType,
          locationCoordinates: 'GPS coordinates here'
        }
      })

      if (accessError) throw accessError

      if (data?.data?.patient) {
        setPatientData(data.data.patient)
      } else {
        setError('Patient data not found')
      }
    } catch (err: any) {
      console.error('Emergency access error:', err)
      setError(err.message || 'Failed to access patient data')
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
            <h1 className="text-2xl font-bold text-red-600">MedAssist - Ambulance Portal</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Emergency Access Only</h3>
              <p className="text-sm text-red-700 mt-1">
                This portal provides access to critical patient information during emergencies. 
                All access attempts are logged and monitored for compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Patient Lookup</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleEmergencyAccess} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Health ID *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={patientHealthId}
                  onChange={(e) => setPatientHealthId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter patient's Health ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Type *
              </label>
              <select
                required
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select emergency type</option>
                <option value="cardiac_arrest">Cardiac Arrest</option>
                <option value="severe_trauma">Severe Trauma</option>
                <option value="stroke">Stroke</option>
                <option value="respiratory_distress">Respiratory Distress</option>
                <option value="severe_bleeding">Severe Bleeding</option>
                <option value="unconscious">Unconscious Patient</option>
                <option value="other">Other Critical Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose / Notes *
              </label>
              <textarea
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe the emergency situation..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accessing...' : 'Access Emergency Data'}
            </button>
          </form>

          {patientData && (
            <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Critical Patient Information</h3>
              <div className="space-y-3">
                <InfoRow label="Name" value={patientData.full_name} />
                <InfoRow label="Blood Type" value={patientData.blood_type || 'Not specified'} critical />
                <InfoRow label="Allergies" value={patientData.allergies || 'None recorded'} critical />
                <InfoRow label="Chronic Conditions" value={patientData.chronic_conditions || 'None recorded'} critical />
                <InfoRow label="Emergency Contact" value={patientData.emergency_contact_name || 'Not available'} />
                <InfoRow label="Emergency Contact Number" value={patientData.emergency_contact_number || 'Not available'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, critical }: { label: string; value: string; critical?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${critical ? 'font-semibold' : ''}`}>
      <div className="text-gray-700">{label}:</div>
      <div className={critical ? 'text-red-900' : 'text-gray-900'}>{value}</div>
    </div>
  )
}
