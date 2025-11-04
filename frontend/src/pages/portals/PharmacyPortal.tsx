import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Prescription, Patient } from '@/lib/supabase'
import { LogOut, Search, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PharmacyPortal() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPrescriptions()
  }, [])

  async function loadPrescriptions() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('status', 'active')
        .order('date_issued', { ascending: false })
        .limit(100)

      if (!error && data) setPrescriptions(data)
    } catch (error) {
      console.error('Error loading prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function dispensePrescription(prescriptionId: string) {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({
          status: 'dispensed',
          pharmacy_dispensed_id: profile?.user_id,
          dispensed_at: new Date().toISOString()
        })
        .eq('id', prescriptionId)

      if (error) throw error

      setMessage('Prescription dispensed successfully!')
      loadPrescriptions()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const filteredPrescriptions = prescriptions.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">MedAssist - Pharmacy Portal</h1>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active E-Prescriptions</h2>
          
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by prescription ID or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {prescription.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {prescription.patient_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prescription.date_issued).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prescription.prescription_text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => dispensePrescription(prescription.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} />
                      Dispense
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPrescriptions.length === 0 && (
            <p className="px-6 py-8 text-gray-500 text-center">No active prescriptions found</p>
          )}
        </div>
      </div>
    </div>
  )
}
